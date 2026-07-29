import { TrustonicClient } from '../../modules/trustonic-api-client/index.js';
import { scrapeTrustonic } from './trustonic.js';

const API_KEY = 'qjF+s7/rxVffo3Fnzm20PdIlFGDDpYOredEsRvl3wYYUAh2vhnmeHoQuUQNkKdoyOQCQN6oDcAZ7166n59orHQ==';
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
        const deviceTenant = d.scraped_tenant_id || tenantId;
        
        // 1. Actualizar tabla maestra (Estado actual siempre se sobreescribe)
        await pool.query(
            `INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             status=VALUES(status), last_change=VALUES(last_change), last_connection=VALUES(last_connection)`,
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
