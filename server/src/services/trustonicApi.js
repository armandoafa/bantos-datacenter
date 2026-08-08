import { TrustonicClient } from '../../modules/trustonic-api-client/index.js';
import { scrapeTrustonic } from './trustonic.js';

const DEFAULT_API_KEY = 'CMPltSM90eh05BMA99cLACoKVkxSLBls0z1A335Mv6YKxjUOOi+eTGHZLHw4o0DazdEBlXhMgA2A/dwk9xW+dw==';
const defaultClient = new TrustonicClient(DEFAULT_API_KEY);

export async function getTrustonicClientInfo(pool, tenantId) {
    if (!tenantId || !pool) return { client: defaultClient, hasCustomKey: false, domain: 'default' };
    try {
        const [rows] = await pool.query('SELECT trustonic_api_key, trustonic_domain FROM tenants WHERE tenant_id = ?', [tenantId]);
        if (rows.length > 0 && rows[0].trustonic_api_key && rows[0].trustonic_api_key.trim()) {
            const apiKey = rows[0].trustonic_api_key.trim();
            const domain = rows[0].trustonic_domain ? rows[0].trustonic_domain.trim() : tenantId;
            return { client: new TrustonicClient(apiKey, domain), hasCustomKey: true, domain };
        }
    } catch (e) {
        console.warn(`>>> [Trustonic] Fallback a cliente default para tenant ${tenantId}:`, e.message);
    }
    return { client: defaultClient, hasCustomKey: false, domain: 'default' };
}

export async function getTrustonicClientForTenant(pool, tenantId) {
    const info = await getTrustonicClientInfo(pool, tenantId);
    return info.client;
}

export async function getTrustonicToken(pool = null, tenantId = null) {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.authorize();
}

export async function validateDevice(imei, pool = null, tenantId = null) {
    try {
        const c = await getTrustonicClientForTenant(pool, tenantId);
        const response = await c.query.getDeviceInfo(imei);
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
        const regex = /([a-z]{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})/;
        const match = dateStr.toLowerCase().match(regex);
        if (match) {
            const [_, monthStr, day, year, hour, min] = match;
            const month = months[monthStr];
            return new Date(year, month, day, hour, min);
        }
        return new Date(dateStr);
    } catch (e) {
        return null;
    }
}

// Función para sincronizar los movimientos y dispositivos en la base de datos
export async function syncMovements(pool, tenantId) {
    let devices = [];
    let source = 'API Oficial Trustonic (Tenant API-Key)';
    const info = await getTrustonicClientInfo(pool, tenantId);
    const c = info.client;

    try {
        console.log(`>>> [Trustonic Sync] Consultando API con ${info.hasCustomKey ? 'API-Key del Tenant (' + info.domain + ')' : 'API-Key Default'}...`);
        const res = await c.query.getServiceInfo('deviceFinancing').catch(() => c.request({ method: 'GET', url: '/query/service?serviceName=deviceFinancing' }));
        devices = res.deviceResponseList || res.items || [];
        if (!Array.isArray(devices) || devices.length === 0) {
            throw new Error('ServiceInfo devolvió resumen o estructura sin lista directa de dispositivos');
        }
    } catch (error) {
        console.warn('>>> [Trustonic API] Usando captura ultrarrápida multipágina de portal:', error.message);
        try {
            devices = await scrapeTrustonic('itdevelopment', 'Alika2012.', info.domain || 'bantos-msp', false);
            source = 'Portal Web (Multipágina)';
        } catch (scrapeError) {
            return { success: false, message: 'Error en sincronización: ' + scrapeError.message };
        }
    }

    if (devices.length === 0) {
        return { success: true, count: 0, message: 'No se encontraron dispositivos para sincronizar.', source };
    }

    let syncedCount = 0;
    for (const d of devices) {
        const imei1 = d.imei1 || d.imei || d.deviceUid;
        if (!imei1) continue;
        const imei2 = d.imei2 || null;
        const status = d.status || d.deviceStatus || 'Activo';
        const service = d.service || d.serviceName || 'Prepago';
        const brand = d.brand || d.make || '—';
        const model = d.model || '—';
        const lastChange = parseTrustonicDate(d.lastChange || d.last_change || d.lastChangeDate);
        const lastConn = parseTrustonicDate(d.lastConnection || d.last_connection || d.lastConnectionDate);
        const deviceTenant = d.scraped_tenant_id || tenantId;
        
        await pool.query(
            `INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             service=VALUES(service), status=VALUES(status), brand=VALUES(brand), model=VALUES(model), last_change=VALUES(last_change), last_connection=VALUES(last_connection)`,
            [imei1, imei2, deviceTenant, service, status, brand, model, lastChange, lastConn]
        );

        await pool.query(
            `INSERT IGNORE INTO trustonic_logs (imei1, tenant_id, operation_date, operation_type, status, comment) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                imei1, 
                deviceTenant, 
                lastChange || new Date(), 
                d.operation_type || 'Actualización de Estado (Sync API)', 
                status, 
                d.comment || d.cause || `Sincronizado vía ${source}`
            ]
        );
        syncedCount++;
    }

    return { success: true, count: syncedCount, source: info.hasCustomKey ? `API-Key del Tenant (${info.domain})` : source };
}

export async function lockDevice(pool, tenantId, imei, lockMessage = '') {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.lock(imei, lockMessage);
}

export async function unlockDevice(pool, tenantId, imei) {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.unlock(imei);
}

export async function archiveDevice(pool, tenantId, imei) {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.archive(imei);
}

export async function releaseDevice(pool, tenantId, imei, reason = 'End of Tenure') {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.release(imei, reason);
}

export async function notifyDevice(pool, tenantId, imei, title = '', message = '', type = 'HEADSUP') {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.notify(imei, title, message, type);
}

export async function pinUnlockDevice(pool, tenantId, imei) {
    const c = await getTrustonicClientForTenant(pool, tenantId);
    return await c.device.pinUnlock(imei);
}
