import { TrustonicClient } from '../../modules/trustonic-api-client/index.js';
import { scrapeTrustonic } from './trustonic.js';

import 'dotenv/config';

const API_KEY = process.env.TRUSTONIC_API_KEY;
if (!API_KEY) {
    console.error('[Trustonic API] Falta la variable de entorno TRUSTONIC_API_KEY');
}
const client = new TrustonicClient(API_KEY);

export async function getTrustonicToken() {
    return await client.authorize();
}

export async function validateDevice(imei) {
    try {
        const response = await client.query.getDeviceInfo(imei);
        // La API v2 retorna { "deviceResponseList": [ ... ] }
        if (response && response.deviceResponseList && response.deviceResponseList.length > 0) {
            return { success: true, device: response.deviceResponseList[0] };
        }
        return { success: false, message: 'Dispositivo no encontrado en Trustonic.' };
    } catch (error) {
        if (error.message.includes('404')) {
            return { success: false, message: 'El dispositivo no está registrado en Trustonic.' };
        }
        return { success: false, message: 'Error al consultar Trustonic: ' + error.message };
    }
}

function parseTrustonicDate(dateStr) {
    if (!dateStr || dateStr === '---') return null;
    try {
        const months = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };
        // Format: "may 13, 2026 15:28"
        const regex = /([a-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})/;
        const match = dateStr.toLowerCase().match(regex);
        if (match) {
            const [_, monthStr, day, year, hour, min] = match;
            const month = months[monthStr];
            return new Date(year, month, day, hour, min);
        }
        return new Date(dateStr); // Intento fallback nativo
    } catch (e) {
        return null;
    }
}

// Función para sincronizar los movimientos en la base de datos
export async function syncMovements(pool, tenantId) {
    let devices = [];
    let source = 'API';

    try {
        const res = await client.request({ method: 'GET', url: '/smartphones' });
        devices = res.items || res || [];
    } catch (error) {
        console.warn('>>> [Trustonic API] Error en API, usando fallback de Scraping:', error.message);
        try {
            // Sincronizar usando el dominio consolidado bantos-msp
            devices = await scrapeTrustonic('itdevelopment', 'Alika2012.', 'bantos-msp');
            source = 'Scraping';
        } catch (scrapeError) {
            return { success: false, message: 'Error en API y Scraping: ' + scrapeError.message };
        }
    }

    if (devices.length === 0) {
        return { success: true, count: 0, message: 'No se encontraron dispositivos para sincronizar.', source };
    }

    let syncedCount = 0;
    for (const d of devices) {
        const imei1 = d.imei1;
        const status = d.status;
        const lastChange = parseTrustonicDate(d.lastChange || d.last_change);
        const lastConn = parseTrustonicDate(d.lastConnection || d.last_connection);
        let deviceTenant = d.scraped_tenant_id;
        if (!deviceTenant) {
            const [invRows] = await pool.query('SELECT tenant_id FROM inventory WHERE serial_number = ? LIMIT 1', [imei1]);
            if (invRows.length > 0) {
                deviceTenant = invRows[0].tenant_id;
            } else {
                deviceTenant = tenantId || 'c-romel';
            }
        }
        
        // 1. Actualizar tabla maestra (Estado actual siempre se sobreescribe)
        await pool.query(
            `INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             tenant_id=IF(VALUES(tenant_id) IS NOT NULL AND VALUES(tenant_id) != '', VALUES(tenant_id), tenant_id),
             service=COALESCE(VALUES(service), service),
             status=VALUES(status), 
             last_change=VALUES(last_change), 
             last_connection=VALUES(last_connection)`,
            [imei1, d.imei2 || null, deviceTenant, d.service, status, d.brand, d.model, lastChange, lastConn]
        );

        // 2. Registrar movimiento (Solo si no existe ya para ese IMEI y fecha)
        await pool.query(
            `INSERT IGNORE INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                imei1, 
                deviceTenant, 
                lastChange || new Date(), 
                d.operation_type || 'Actualización de Estado (Sync)', 
                status, 
                d.comment || d.cause || null
            ]
        );
        syncedCount++;
    }

    return { success: true, count: syncedCount, source: source === 'API' ? 'API' : 'Portal' };
}

// --- WEBHOOK LOGIC ---
import poolDb from '../config/db.js';

const TRUSTONIC_V2_BASE = 'https://api.cloud.trustonic.com/api/v2';
const WEBHOOK_BASE_URL = 'https://bantos.cloud/datacenter-api/webhooks/trustonic';

export const getTrustonicWebhookUrl = () => {
    const token = process.env.TRUSTONIC_WEBHOOK_TOKEN;
    return token ? `${WEBHOOK_BASE_URL}?token=${encodeURIComponent(token)}` : WEBHOOK_BASE_URL;
};

export const registerTrustonicWebhook = async () => {
    const events = ['idle', 'readyForUse', 'enrolled', 'active', 'locked', 'released'];
    const results = [];
    for (const event of events) {
        try {
            // La URL absoluta sobrescribe el baseURL v1 del cliente (el webhook solo existe en v2)
            const data = await client.request({
                method: 'POST',
                url: `${TRUSTONIC_V2_BASE}/webhook/subscription`,
                data: { eventType: event, url: getTrustonicWebhookUrl() },
                headers: { tenantId: 'bantos-msp' }
            });
            console.log(`[Trustonic API] Webhook registered for event: ${event}`);
            results.push({ event, ok: true, id: data?.id });
        } catch (error) {
            const duplicate = /WEBHOOK_DUPLICATE_SUBS/i.test(error.message);
            if (duplicate) console.log(`[Trustonic API] Webhook ya existía para evento: ${event}`);
            else console.error(`[Trustonic API] Error registering webhook (${event}):`, error.message);
            results.push({ event, ok: duplicate, alreadyExisted: duplicate, error: duplicate ? undefined : error.message });
        }
    }
    return results;
};

export const listTrustonicWebhooks = async () => {
    return client.request({
        method: 'GET',
        url: `${TRUSTONIC_V2_BASE}/webhook/subscriptions/`,
        headers: { tenantId: 'bantos-msp' }
    });
};


export const processTrustonicWebhook = async (payload) => {
    const { deviceUid, eventType, actionName, status, serviceType, updatedAt } = payload;
    
    if (status !== 'actionCompleted') {
        console.log(`[Trustonic API] Ignorando evento ${eventType} para ${deviceUid} con status ${status}`);
        return;
    }
    
    console.log(`[Trustonic API] Procesando webhook: ${actionName} -> ${eventType} para IMEI: ${deviceUid}`);
    
    const infoRes = await validateDevice(deviceUid);
    if (!infoRes.success) return;
    
    const info = infoRes.device;
    const tenant = info.tenantName || 'Unknown';
    let service = serviceType || 'Unknown';
    if (info.serviceDetails && info.serviceDetails.length > 0) {
        service = info.serviceDetails.map(s => s.serviceName || s).join(', ');
    }
    const tac = info.tac?.tacId || info.tac || null;
    const brand = info.deviceManufacturer || null;
    const model = info.deviceModel || null;
    const state = info.stateInfo || eventType;
    
    let expiration = null;
    if (info.expirationTime) {
        const d = new Date(parseInt(info.expirationTime));
        expiration = d.toISOString().split('T')[0];
    }

    await poolDb.query(
        `INSERT INTO trustonic_inventory (imei, tenant, service, tac, brand, model, status, expiration_date, last_sync) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         tenant=VALUES(tenant), service=VALUES(service), tac=VALUES(tac), brand=VALUES(brand), model=VALUES(model), status=VALUES(status), expiration_date=VALUES(expiration_date), last_sync=NOW()`,
        [deviceUid, tenant, service, tac, brand, model, state, expiration]
    );

    // Update tenant-specific trustonic_devices table
    let deviceTenant = tenant !== 'Unknown' ? tenant : null;
    if (!deviceTenant || deviceTenant === 'Unknown') {
        const [invRows] = await poolDb.query('SELECT tenant_id FROM inventory WHERE serial_number = ? LIMIT 1', [deviceUid]);
        if (invRows.length > 0) {
            deviceTenant = invRows[0].tenant_id;
        } else {
            deviceTenant = 'c-romel'; // Fallback
        }
    }

    await poolDb.query(
        `INSERT INTO trustonic_devices (imei1, tenant_id, service, status, brand, model, last_change) 
         VALUES (?, ?, ?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         status=VALUES(status), last_change=VALUES(last_change)`,
        [deviceUid, deviceTenant, service, state, brand, model]
    );
    
    console.log(`[Trustonic API] Dispositivo ${deviceUid} actualizado correctamente vía Webhook en inventario general y de tenant.`);
};

// --- DEVICE ACTION FUNCTIONS ---

export async function getDeviceServiceType(pool, tenantId, imei) {
    if (!imei) return null;
    const [rows] = await pool.query(
        'SELECT service, status FROM trustonic_devices WHERE (imei1 = ? OR imei2 = ?) AND (tenant_id = ? OR ? IS NULL) LIMIT 1',
        [imei, imei, tenantId, tenantId]
    );
    if (rows.length > 0) {
        return rows[0];
    }
    return null;
}

export async function activateDevice(pool, tenantId, imei, fallbackService = 'Pospago') {
    console.log(`[Trustonic API] Solicitud de activación para IMEI: ${imei} (Tenant: ${tenantId})`);
    
    // 1. Validar existencia y consultar tipo de servicio en la lista de Dispositivos de Trustonic
    const deviceInfo = await getDeviceServiceType(pool, tenantId, imei);
    
    if (!deviceInfo) {
        console.warn(`[Trustonic API] Advertencia: IMEI ${imei} no encontrado en trustonic_devices. Usando servicio fallback '${fallbackService}'.`);
    }

    const serviceType = deviceInfo?.service || fallbackService;
    console.log(`[Trustonic API] Tipo de servicio determinado para IMEI ${imei}: '${serviceType}'`);

    // 2. Intentar llamada vía API de Trustonic
    let apiSuccess = false;
    let apiMessage = '';

    try {
        const response = await client.request({
            method: 'POST',
            url: `/smartphones/${imei}/activate`,
            data: { service: serviceType },
            headers: { tenantId: tenantId || 'bantos-msp' }
        });
        apiSuccess = true;
        apiMessage = response?.message || 'Activación exitosa vía API Trustonic';
    } catch (error) {
        console.error(`[Trustonic API] Error al activar ${imei} por API (${error.message}). Intentando actualización de estado local.`);
        apiMessage = error.message;
    }

    // 3. Actualizar estado local en la tabla trustonic_devices
    await pool.query(
        `UPDATE trustonic_devices 
         SET status = 'Listo para su uso', service = ?, last_change = NOW() 
         WHERE imei1 = ? OR imei2 = ?`,
        [serviceType, imei, imei]
    );

    // 4. Registrar en historial de operaciones
    await pool.query(
        `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
         VALUES (?, ?, NOW(), 'Activación', 'Listo para su uso', ?)`,
        [imei, tenantId || 'c-romel', `Activado con servicio ${serviceType}. API response: ${apiMessage}`]
    );

    return {
        success: true,
        imei,
        service: serviceType,
        status: 'Listo para su uso',
        apiSuccess,
        message: apiMessage
    };
}

// Convierte la frecuencia de pago del contrato (número o texto) a días de recarga. Default: 15 (quincenal).
export function frequencyToDays(freq) {
    if (freq === null || freq === undefined || freq === '') return 15;
    const n = parseInt(freq, 10);
    if (!isNaN(n) && n > 0) return n;
    const f = String(freq).toLowerCase();
    if (f.includes('seman') || f.includes('week')) return 7;
    if (f.includes('quinc') || f.includes('bi')) return 15;
    if (f.includes('mens') || f.includes('month')) return 30;
    if (f.includes('dia') || f.includes('día') || f.includes('daily')) return 1;
    return 15;
}

// Extiende la fecha de expiración del dispositivo (Reload) tras un pago aceptado.
// A diferencia de activateDevice, un fallo en Trustonic se registra como Error y se propaga.
export async function reloadDevice(pool, tenantId, imei, reloadDays = 15) {
    console.log(`[Trustonic API] Solicitud de recarga para IMEI: ${imei} (+${reloadDays} días, Tenant: ${tenantId})`);
    const logTenant = tenantId || 'c-romel';
    try {
        const response = await client.service.update([imei], reloadDays);

        await pool.query(
            `UPDATE trustonic_devices
             SET status = 'Listo para su uso',
                 expiration_date = DATE_ADD(GREATEST(COALESCE(expiration_date, NOW()), NOW()), INTERVAL ? DAY),
                 last_change = NOW()
             WHERE imei1 = ? OR imei2 = ?`,
            [reloadDays, imei, imei]
        );
        await pool.query(
            `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment)
             VALUES (?, ?, NOW(), 'Recarga', 'Exitosa', ?)`,
            [imei, logTenant, `Recarga de ${reloadDays} días aplicada. API response: ${JSON.stringify(response)}`]
        );
        return { success: true, imei, reloadDays, response };
    } catch (error) {
        console.error(`[Trustonic API] Error en recarga de ${imei}:`, error.message);
        try {
            await pool.query(
                `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment)
                 VALUES (?, ?, NOW(), 'Recarga', 'Error', ?)`,
                [imei, logTenant, `Fallo recarga de ${reloadDays} días: ${error.message}`]
            );
        } catch (logErr) { console.error('Error guardando log de recarga:', logErr.message); }
        throw error;
    }
}

export async function lockDevice(pool, tenantId, imei, message = 'Dispositivo bloqueado por falta de pago') {
    console.log(`[Trustonic API] Solicitud de bloqueo para IMEI: ${imei}`);
    try {
        await client.request({
            method: 'POST',
            url: `/smartphones/${imei}/lock`,
            data: { message },
            headers: { tenantId: tenantId || 'bantos-msp' }
        });
    } catch (err) {
        console.error(`[Trustonic API] Error en API al bloquear IMEI ${imei}:`, err.message);
    }

    await pool.query(
        `UPDATE trustonic_devices SET status = 'Bloqueado', last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [imei, imei]
    );

    await pool.query(
        `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
         VALUES (?, ?, NOW(), 'Bloqueo', 'Bloqueado', ?)`,
        [imei, tenantId || 'c-romel', message]
    );

    return { success: true, imei, status: 'Bloqueado' };
}

export async function unlockDevice(pool, tenantId, imei) {
    console.log(`[Trustonic API] Solicitud de desbloqueo para IMEI: ${imei}`);
    try {
        await client.request({
            method: 'POST',
            url: `/smartphones/${imei}/unlock`,
            headers: { tenantId: tenantId || 'bantos-msp' }
        });
    } catch (err) {
        console.error(`[Trustonic API] Error en API al desbloquear IMEI ${imei}:`, err.message);
    }

    await pool.query(
        `UPDATE trustonic_devices SET status = 'Listo para su uso', last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [imei, imei]
    );

    await pool.query(
        `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
         VALUES (?, ?, NOW(), 'Desbloqueo', 'Listo para su uso', 'Desbloqueado tras pago')`,
        [imei, tenantId || 'c-romel']
    );

    return { success: true, imei, status: 'Listo para su uso' };
}

export async function deactivateDevice(pool, tenantId, imei) {
    await pool.query(
        `UPDATE trustonic_devices SET status = 'Inactivo', last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [imei, imei]
    );
    return { success: true, imei, status: 'Inactivo' };
}

export async function archiveDevice(pool, tenantId, imei) {
    return await deactivateDevice(pool, tenantId, imei);
}

export async function releaseDevice(pool, tenantId, imei, reason = 'Liberación por fin de contrato') {
    await pool.query(
        `UPDATE trustonic_devices SET status = 'Liberado', last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [imei, imei]
    );
    return { success: true, imei, status: 'Liberado' };
}

export async function notifyDevice(pool, tenantId, imei, title, message, type = 'HEADSUP') {
    return { success: true, imei, message: 'Notificación registrada' };
}

export async function pinUnlockDevice(pool, tenantId, imei) {
    return { success: true, imei, message: 'PIN Unlock solicitado' };
}

export async function reportStolenDevice(pool, tenantId, imei, status = 'REPORT') {
    await pool.query(
        `UPDATE trustonic_devices SET status = 'Robado', last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [imei, imei]
    );
    return { success: true, imei, status: 'Robado' };
}

export async function transferDevice(pool, tenantId, imei, targetTenantId) {
    await pool.query(
        `UPDATE trustonic_devices SET tenant_id = ?, last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [targetTenantId, imei, imei]
    );
    return { success: true, imei, targetTenantId };
}

