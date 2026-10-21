import { TrustonicClient, TrustonicError } from '../../modules/trustonic-api-client/index.js';
import { scrapeTrustonic } from './trustonic.js';
import poolDb from '../config/db.js';

/*
 * Integración con Trustonic Telecom Platform API v2 (especificación v2.3).
 *
 * Variables de entorno:
 *   TRUSTONIC_API_KEY            (requerida) API-Key del usuario de Telecoms Platform
 *   TRUSTONIC_BASE_URL           (opcional)  default https://api.cloud.trustonic.com
 *   TRUSTONIC_DEFAULT_TENANT     (opcional)  tenant cuando no se indica uno; default 'bantos-msp'
 *   TRUSTONIC_TENANT_MAP         (opcional)  JSON {"<tenant local>": "<tenantId Trustonic>"}
 *   TRUSTONIC_PREPAID_UNLOCK_DAYS(opcional)  días de validez al desbloquear un equipo prepago; default 30
 *   TRUSTONIC_WEBHOOK_URL        (opcional)  default https://bantos.cloud/datacenter-api/webhooks/trustonic
 *   TRUSTONIC_PORTAL_USER / TRUSTONIC_PORTAL_PASSWORD / TRUSTONIC_PORTAL_DOMAIN
 *                                (opcionales) solo para el fallback de scraping del portal
 *
 * Regla: la base local solo se actualiza cuando Trustonic confirma la operación (resultCode REQUEST_SUCCESS).
 */

const SYNC_BATCH_SIZE = 100; // ≤ 100 para que /query/devices responda de forma síncrona

// La configuración se lee de forma diferida: index.js llama a dotenv.config() después de importar este módulo.
const env = {
    get defaultTenant() { return process.env.TRUSTONIC_DEFAULT_TENANT || 'bantos-msp'; },
    get prepaidUnlockDays() { return Number(process.env.TRUSTONIC_PREPAID_UNLOCK_DAYS) || 30; },
    get webhookUrl() { return process.env.TRUSTONIC_WEBHOOK_URL || 'https://bantos.cloud/datacenter-api/webhooks/trustonic'; },
    get tenantMap() {
        try {
            return process.env.TRUSTONIC_TENANT_MAP ? JSON.parse(process.env.TRUSTONIC_TENANT_MAP) : {};
        } catch (e) {
            console.error('[Trustonic API] TRUSTONIC_TENANT_MAP no es JSON válido; se ignora.');
            return {};
        }
    }
};

let _client = null;
let _clientKey = null;
function getClient() {
    const key = process.env.TRUSTONIC_API_KEY;
    if (!key) throw new TrustonicError('TRUSTONIC_API_KEY no está configurada', { context: 'config' });
    if (!_client || _clientKey !== key) {
        _client = new TrustonicClient(key, null, { baseURL: process.env.TRUSTONIC_BASE_URL || undefined });
        _clientKey = key;
    }
    return _client;
}

export { getClient as getTrustonicClient };

/** Traduce el tenant local al tenantId de Trustonic. */
export function resolveTenant(tenantId) {
    if (!tenantId) return env.defaultTenant;
    return env.tenantMap[tenantId] || tenantId;
}

// ── Mapeos ────────────────────────────────────────────────────────────────

/** transitionState (API) → etiqueta usada en trustonic_devices (la misma que mostraba el portal). */
const STATE_LABELS = {
    'idle': 'Inactivo',
    'ready for use': 'Listo para su uso',
    'readyforuse': 'Listo para su uso',
    'enrolled': 'Inscrito',
    'active': 'Activo',
    'locked': 'Bloqueado',
    'released': 'Liberado',
    'protected': 'Protegido',
    'delivered': 'Entregado'
};

export function stateLabel(state) {
    if (!state) return null;
    const key = String(state).trim().toLowerCase();
    return STATE_LABELS[key] || STATE_LABELS[key.replace(/\s+/g, '')] || String(state);
}

/**
 * Traduce el servicio local ('Prepago', 'Pospago', 'PREPAID', 'POSTPAID', 'Sim Control'…) al serviceList de Trustonic.
 */
export function toServiceSpec(service) {
    const s = String(service || '').toLowerCase().replace(/[\s_-]/g, '');
    if (s.includes('prepa') || s === 'payg') return { serviceName: 'deviceFinancing', paymentMethod: 'prepaid' };
    if (s.includes('pospa') || s.includes('postpa')) return { serviceName: 'deviceFinancing', paymentMethod: 'postpaid' };
    if (s.includes('simcontrol')) return { serviceName: 'simControl' };
    if (s.includes('theft')) return { serviceName: 'theftProtection' };
    if (s.includes('subsidy')) return { serviceName: 'subsidyProtection' };
    if (s.includes('supply')) return { serviceName: 'supplyChain' };
    return { serviceName: 'deviceFinancing', paymentMethod: 'postpaid' };
}

/** serviceDetails (API) → etiqueta de servicio local, alineada con el reporte del portal (PREPAID / POSTPAID / …). */
function serviceLabel(serviceDetails) {
    const list = Array.isArray(serviceDetails) ? serviceDetails : (serviceDetails ? [serviceDetails] : []);
    if (!list.length) return 'INVENTORY';
    return list.map((s) => {
        if (typeof s === 'string') return s;
        const name = s.serviceName || s.serviceType || '';
        const pm = (s.paymentMethod || '').toLowerCase();
        if (name === 'deviceFinancing' && pm) return pm === 'prepaid' ? 'PREPAID' : 'POSTPAID';
        return name || JSON.stringify(s);
    }).join(', ');
}

function isPrepaid(service) {
    return toServiceSpec(service).paymentMethod === 'prepaid';
}

// ── Utilidades ────────────────────────────────────────────────────────────

/** Ejecuta la acción y valida el resultado del dispositivo. Lanza TrustonicError si Trustonic la rechaza. */
async function runDeviceAction(context, imei, fn) {
    const response = await fn();
    const final = await getClient().waitForBatch(response);
    const result = TrustonicClient.assertSuccess(final, imei, context);
    return { response: final, result };
}

async function logOperation(pool, imei, tenantId, operationType, status, comment) {
    await pool.query(
        `INSERT INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment)
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [imei, tenantId || env.defaultTenant, operationType, status, comment]
    );
}

async function setLocalStatus(pool, imei, status) {
    await pool.query(
        `UPDATE trustonic_devices SET status = ?, last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [status, imei, imei]
    );
}

function parseTrustonicDate(value) {
    if (value === null || value === undefined || value === '' || value === '---') return null;
    try {
        if (typeof value === 'number' || /^\d{10,13}$/.test(String(value))) {
            const n = Number(value);
            return new Date(n < 1e12 ? n * 1000 : n);
        }
        const months = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };
        // Formato del portal: "may 13, 2026 15:28"
        const regex = /([a-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})/;
        const match = String(value).toLowerCase().match(regex);
        if (match) {
            const [, monthStr, day, year, hour, min] = match;
            return new Date(year, months[monthStr], day, hour, min);
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) {
        return null;
    }
}

// ── Consulta ──────────────────────────────────────────────────────────────

export async function getTrustonicToken() {
    return await getClient().authorize();
}

/** 5.4 Device Info para un IMEI. */
export async function validateDevice(imei, tenantId = null) {
    try {
        const response = await getClient().query.getDeviceInfo(imei, { tenantId: resolveTenant(tenantId) });
        const device = response?.deviceResponseList?.[0];
        if (!device) return { success: false, message: 'Dispositivo no encontrado en Trustonic.' };
        if (device.resultCode && device.resultCode !== 'REQUEST_SUCCESS') {
            if (device.resultCode === 'DEVICE_UID_NOT_FOUND') {
                return { success: false, message: 'El dispositivo no está registrado en Trustonic.' };
            }
            return { success: false, message: `Trustonic: ${device.resultCode} ${device.resultMessage || ''}`.trim() };
        }
        return { success: true, device };
    } catch (error) {
        if (error.resultCode === 'DEVICE_UID_NOT_FOUND' || error.status === 404) {
            return { success: false, message: 'El dispositivo no está registrado en Trustonic.' };
        }
        return { success: false, message: 'Error al consultar Trustonic: ' + error.message };
    }
}

/** Obtiene todos los dispositivos del tenant vía 5.8 (State Info) + 5.4 (Device Info) en lotes de 100. */
async function fetchDevicesFromApi(tenantId) {
    const tenant = resolveTenant(tenantId);
    const uids = await getClient().query.getAllDeviceUidsByState('all', { tenantId: tenant });
    const devices = [];
    for (let i = 0; i < uids.length; i += SYNC_BATCH_SIZE) {
        const batch = uids.slice(i, i + SYNC_BATCH_SIZE);
        const res = await getClient().query.getDeviceInfo(batch, { tenantId: tenant });
        for (const d of res?.deviceResponseList || []) {
            if (d.resultCode && d.resultCode !== 'REQUEST_SUCCESS') continue;
            devices.push({
                imei1: d.deviceUid,
                imei2: d.imei2 || null,
                scraped_tenant_id: d.tenantName || null,
                service: serviceLabel(d.serviceDetails),
                status: stateLabel(d.transitionState || d.stateInfo),
                brand: d.deviceManufacturer || null,
                model: d.deviceModel || null,
                lastChange: d.lastChanged,
                lastConnection: d.lastCheckIn
            });
        }
    }
    return devices;
}

// Función para sincronizar los movimientos en la base de datos
export async function syncMovements(pool, tenantId) {
    let devices = [];
    let source = 'API';

    try {
        devices = await fetchDevicesFromApi(tenantId);
    } catch (error) {
        console.warn('>>> [Trustonic API] Error en API, usando fallback de Scraping:', error.message);
        const { TRUSTONIC_PORTAL_USER, TRUSTONIC_PORTAL_PASSWORD, TRUSTONIC_PORTAL_DOMAIN } = process.env;
        if (!TRUSTONIC_PORTAL_USER || !TRUSTONIC_PORTAL_PASSWORD) {
            return { success: false, message: 'Error en API de Trustonic (sin credenciales de portal para fallback): ' + error.message };
        }
        try {
            devices = await scrapeTrustonic(TRUSTONIC_PORTAL_USER, TRUSTONIC_PORTAL_PASSWORD, TRUSTONIC_PORTAL_DOMAIN || env.defaultTenant);
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

// ── Webhooks (7) ──────────────────────────────────────────────────────────

/**
 * Registra (o confirma) una suscripción por evento. Consulta primero las existentes para no duplicar,
 * y un fallo en un evento no impide registrar los demás.
 */
export const registerTrustonicWebhook = async (tenantId = null) => {
    const tenant = resolveTenant(tenantId);
    const events = ['idle', 'readyForUse', 'enrolled', 'active', 'locked', 'released'];
    let existing = [];
    try {
        const res = await getClient().webhook.list({ tenantId: tenant });
        existing = res?.subscriptionList || [];
    } catch (error) {
        console.warn('[Trustonic API] No se pudieron consultar las suscripciones existentes:', error.message);
    }

    const results = [];
    for (const event of events) {
        if (existing.some((s) => s.eventType === event && s.url === env.webhookUrl)) {
            results.push({ event, status: 'already-registered' });
            continue;
        }
        try {
            await getClient().webhook.create(event, env.webhookUrl, { tenantId: tenant });
            console.log(`[Trustonic API] Webhook registered for event: ${event}`);
            results.push({ event, status: 'registered' });
        } catch (error) {
            const status = error.resultCode === 'WEBHOOK_DUPLICATE_SUBSCRIPTION' ? 'already-registered' : 'error';
            if (status === 'error') console.error(`[Trustonic API] Error registering webhook ${event}:`, error.message);
            results.push({ event, status, message: error.message });
        }
    }
    return results;
};

export const processTrustonicWebhook = async (payload) => {
    const { deviceUid, eventType, actionName, status, serviceType, failedReason } = payload;

    if (status !== 'actionCompleted') {
        console.log(`[Trustonic API] Ignorando evento ${eventType} para ${deviceUid} con status ${status}${failedReason ? ` (${failedReason})` : ''}`);
        return;
    }

    console.log(`[Trustonic API] Procesando webhook: ${actionName} -> ${eventType} para IMEI: ${deviceUid}`);

    const infoRes = await validateDevice(deviceUid);
    if (!infoRes.success) return;

    const info = infoRes.device;
    const tenant = info.tenantName || 'Unknown';
    const service = info.serviceDetails ? serviceLabel(info.serviceDetails) : (serviceType || 'Unknown');
    const tac = info.tac?.tacId || (typeof info.tac === 'string' ? info.tac : null);
    const brand = info.deviceManufacturer || null;
    const model = info.deviceModel || null;
    const state = stateLabel(info.transitionState || info.stateInfo || eventType);

    let expiration = null;
    const expDate = parseTrustonicDate(info.expirationTime);
    if (expDate) expiration = expDate.toISOString().split('T')[0];

    await poolDb.query(
        `INSERT INTO trustonic_inventory (imei, tenant, service, tac, brand, model, status, expiration_date, last_sync)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
         tenant=VALUES(tenant), service=VALUES(service), tac=VALUES(tac), brand=VALUES(brand), model=VALUES(model), status=VALUES(status), expiration_date=VALUES(expiration_date), last_sync=NOW()`,
        [deviceUid, tenant, service, tac, brand, model, state, expiration]
    );

    // Update tenant-specific trustonic_devices table
    let deviceTenant = tenant !== 'Unknown' ? tenant : null;
    if (!deviceTenant) {
        const [invRows] = await poolDb.query('SELECT tenant_id FROM inventory WHERE serial_number = ? LIMIT 1', [deviceUid]);
        deviceTenant = invRows.length > 0 ? invRows[0].tenant_id : 'c-romel'; // Fallback
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

// ── Acciones sobre dispositivos ───────────────────────────────────────────
// Todas lanzan TrustonicError si Trustonic rechaza la operación; en ese caso la base local no se modifica.

export async function getDeviceServiceType(pool, tenantId, imei) {
    if (!imei) return null;
    const [rows] = await pool.query(
        'SELECT service, status FROM trustonic_devices WHERE (imei1 = ? OR imei2 = ?) AND (tenant_id = ? OR ? IS NULL) LIMIT 1',
        [imei, imei, tenantId, tenantId]
    );
    return rows.length > 0 ? rows[0] : null;
}

/** 3.1 Activate. El dispositivo debe existir en el inventario de Trustonic. */
export async function activateDevice(pool, tenantId, imei, fallbackService = 'Pospago', options = {}) {
    console.log(`[Trustonic API] Solicitud de activación para IMEI: ${imei} (Tenant: ${tenantId})`);

    const deviceInfo = await getDeviceServiceType(pool, tenantId, imei);
    // Si el servicio local es INVENTORY (sin servicio) se usa el servicio solicitado.
    const localService = deviceInfo?.service && !/inventory/i.test(deviceInfo.service) ? deviceInfo.service : null;
    const serviceType = localService || fallbackService;
    const spec = toServiceSpec(serviceType);
    const serviceList = [{ ...spec, ...(options.serviceTenure ? { serviceTenure: String(options.serviceTenure) } : {}) }];
    const deviceFields = spec.paymentMethod === 'prepaid' && options.reloadDays ? { reloadDays: options.reloadDays } : {};

    const { response } = await runDeviceAction('service/activate', imei, () =>
        getClient().service.activate(imei, serviceList, { tenantId: resolveTenant(tenantId), ...deviceFields })
    );

    const status = 'Listo para su uso';
    await pool.query(
        `UPDATE trustonic_devices SET status = ?, service = ?, last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [status, serviceType, imei, imei]
    );
    await logOperation(pool, imei, tenantId, 'Activación', status,
        `Activado con servicio ${serviceType}. Orden Trustonic: ${response?.serviceOrderId ?? 'n/d'} (${response?.serviceOrderStatus ?? 'n/d'})`);

    return { success: true, imei, service: serviceType, status, serviceOrderId: response?.serviceOrderId, serviceOrderStatus: response?.serviceOrderStatus };
}

/** 3.2 Deactivate (retira el servicio; el equipo vuelve al inventario). */
export async function deactivateDevice(pool, tenantId, imei, { reason = 'other', remarks } = {}) {
    const deviceInfo = await getDeviceServiceType(pool, tenantId, imei);
    const spec = toServiceSpec(deviceInfo?.service);
    const serviceList = [{ ...spec, deactivateReason: reason, ...(remarks ? { additionalRemarks: remarks } : {}) }];

    await runDeviceAction('service/deactivate', imei, () =>
        getClient().service.deactivate(imei, serviceList, { tenantId: resolveTenant(tenantId) })
    );

    await setLocalStatus(pool, imei, 'Inactivo');
    await logOperation(pool, imei, tenantId, 'Desactivación', 'Inactivo', `Servicio ${spec.serviceName} retirado (${reason})`);
    return { success: true, imei, status: 'Inactivo' };
}

/** 4.6 Archive. Irreversible: el equipo ya no puede asignarse a servicios. */
export async function archiveDevice(pool, tenantId, imei) {
    await runDeviceAction('device/archive', imei, () => getClient().device.archive(imei, { tenantId: resolveTenant(tenantId) }));
    await setLocalStatus(pool, imei, 'Archivado');
    await logOperation(pool, imei, tenantId, 'Archivado', 'Archivado', 'Dispositivo archivado en Trustonic');
    return { success: true, imei, status: 'Archivado' };
}

/** 4.2 Lock. Para bloqueo temporal: options = { lockType: 'temporaryLock', lockDuration, lockDurationTimeUnit }. */
export async function lockDevice(pool, tenantId, imei, message = 'Dispositivo bloqueado por falta de pago', options = {}) {
    console.log(`[Trustonic API] Solicitud de bloqueo para IMEI: ${imei}`);
    await runDeviceAction('device/lock', imei, () =>
        getClient().device.lock(imei, {
            lockMsgTitle: options.title || 'Bantos',
            lockMsgContent: message,
            lockType: options.lockType,
            lockDuration: options.lockDuration,
            lockDurationTimeUnit: options.lockDurationTimeUnit,
            tenantId: resolveTenant(tenantId)
        })
    );

    await setLocalStatus(pool, imei, 'Bloqueado');
    await logOperation(pool, imei, tenantId, 'Bloqueo', 'Bloqueado', message);
    return { success: true, imei, status: 'Bloqueado' };
}

/** 4.11 Lock Message: cambia el mensaje mostrado en un equipo ya bloqueado. */
export async function sendLockMessage(pool, tenantId, imei, message, title = 'Bantos') {
    await runDeviceAction('device/lockMessage', imei, () =>
        getClient().device.lockMessage(imei, { messageTitle: title, messageContent: message, tenantId: resolveTenant(tenantId) })
    );
    await logOperation(pool, imei, tenantId, 'Mensaje de bloqueo', 'Bloqueado', message);
    return { success: true, imei, message };
}

/**
 * 4.3 Unlock. En prepago Trustonic exige validityDays o nextDue;
 * si no se indican se usa TRUSTONIC_PREPAID_UNLOCK_DAYS (default 30).
 */
export async function unlockDevice(pool, tenantId, imei, options = {}) {
    console.log(`[Trustonic API] Solicitud de desbloqueo para IMEI: ${imei}`);
    const deviceInfo = await getDeviceServiceType(pool, tenantId, imei);
    let { validityDays, nextDue } = options;
    if (!validityDays && !nextDue && isPrepaid(deviceInfo?.service)) validityDays = env.prepaidUnlockDays;

    await runDeviceAction('device/unlock', imei, () =>
        getClient().device.unlock(imei, { validityDays, nextDue, tenantId: resolveTenant(tenantId) })
    );

    await setLocalStatus(pool, imei, 'Listo para su uso');
    await logOperation(pool, imei, tenantId, 'Desbloqueo', 'Listo para su uso',
        validityDays ? `Desbloqueado tras pago (${validityDays} días)` : 'Desbloqueado tras pago');
    return { success: true, imei, status: 'Listo para su uso' };
}

/** 4.5 Release. Irreversible: el equipo no puede re-inscribirse en servicios. */
export async function releaseDevice(pool, tenantId, imei, reason = 'Liberación por fin de contrato') {
    await runDeviceAction('device/release', imei, () => getClient().device.release(imei, { reason, tenantId: resolveTenant(tenantId) }));
    await setLocalStatus(pool, imei, 'Liberado');
    await logOperation(pool, imei, tenantId, 'Liberación', 'Liberado', reason);
    return { success: true, imei, status: 'Liberado' };
}

/** 4.1 Message Device. type: 'HEADSUP' | 'FULLSCREEN' (se envía en minúsculas, como pide la especificación). */
export async function notifyDevice(pool, tenantId, imei, title, message, type = 'HEADSUP') {
    await runDeviceAction('device/notify', imei, () =>
        getClient().device.notify(imei, {
            notificationTitle: title,
            notificationContent: message,
            notificationType: String(type).toLowerCase() === 'fullscreen' ? 'fullscreen' : 'headsup',
            tenantId: resolveTenant(tenantId)
        })
    );
    await logOperation(pool, imei, tenantId, 'Notificación', 'Completado', `${title}: ${message}`);
    return { success: true, imei, message: 'Notificación enviada' };
}

/** 4.4 PIN Unlock. Regresa el PIN de desbloqueo offline. `challenge` es el código mostrado en el equipo (solo algunos OEM). */
export async function pinUnlockDevice(pool, tenantId, imei, options = {}) {
    const { result } = await runDeviceAction('device/pinunlock', imei, () =>
        getClient().device.pinUnlock(imei, { challenge: options.challenge, validity: options.validity, tenantId: resolveTenant(tenantId) })
    );
    await logOperation(pool, imei, tenantId, 'PIN Unlock', 'Completado', 'PIN de desbloqueo generado');
    return { success: true, imei, pin: result?.challengePin ?? null, message: 'PIN Unlock generado' };
}

/** 4.10 Report/Cancel Stolen. status: 'REPORT' | 'RESET'. */
export async function reportStolenDevice(pool, tenantId, imei, status = 'REPORT') {
    const action = String(status).toLowerCase() === 'reset' ? 'reset' : 'report';
    await runDeviceAction('device/theft', imei, () => getClient().device.theft(imei, action, { tenantId: resolveTenant(tenantId) }));
    const newStatus = action === 'report' ? 'Robado' : 'Protegido';
    await setLocalStatus(pool, imei, newStatus);
    await logOperation(pool, imei, tenantId, action === 'report' ? 'Reporte de robo' : 'Cancelación de robo', newStatus, null);
    return { success: true, imei, status: newStatus };
}

/** 2.3 Transfer Devices. Solo equipos en estado Idle; tenantId debe ser el tenant padre. */
export async function transferDevice(pool, tenantId, imei, targetTenantId) {
    if (!targetTenantId) throw new TrustonicError('targetTenantId es requerido para transferir', { context: 'inventory/transfer' });
    await runDeviceAction('inventory/transfer', imei, () =>
        getClient().inventory.transfer(imei, resolveTenant(targetTenantId), { tenantId: resolveTenant(tenantId) })
    );
    await pool.query(
        `UPDATE trustonic_devices SET tenant_id = ?, last_change = NOW() WHERE imei1 = ? OR imei2 = ?`,
        [targetTenantId, imei, imei]
    );
    await logOperation(pool, imei, targetTenantId, 'Transferencia', 'Inactivo', `Transferido desde ${tenantId || env.defaultTenant}`);
    return { success: true, imei, targetTenantId };
}
