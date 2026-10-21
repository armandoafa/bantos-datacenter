import { toDeviceList, clean, assertNoRestricted } from './_utils.js';

/**
 * 4. Device Management
 * Todas las acciones aceptan uno o varios dispositivos. Con más de 100, Trustonic procesa de forma
 * asíncrona y regresa batchActionId (usar client.waitForBatch).
 */
export default class DeviceEndpoints {
  constructor(client) {
    this.client = client;
  }

  _post(url, data, tenantId, method = 'POST') {
    return this.client.request({ method, url, data, tenantId });
  }

  /**
   * 4.1 Message Device — POST api/v2/device/notify
   * @param {Object} msg - { notificationTitle | messageTemplateId, notificationContent?, notificationType?: 'headsup'|'fullscreen' }
   */
  async notify(devices, { notificationTitle, notificationContent, messageTemplateId, notificationType = 'headsup', tenantId } = {}) {
    if (!notificationTitle && !messageTemplateId) throw new Error('Trustonic: se requiere notificationTitle o messageTemplateId');
    assertNoRestricted(notificationTitle, 'notificationTitle');
    assertNoRestricted(notificationContent, 'notificationContent');
    const messageList = toDeviceList(devices, clean({ notificationType, notificationTitle, notificationContent, messageTemplateId }));
    return this._post('/device/notify/', { messageList }, tenantId);
  }

  /**
   * 4.2 Lock Device — POST api/v2/device/lock
   * Bloqueo temporal: { lockType: 'temporaryLock', lockDuration, lockDurationTimeUnit: 'minute'|'hour' } (solo Postpaid).
   */
  async lock(devices, { lockMsgTitle, lockMsgContent, lockType = 'lock', lockDuration, lockDurationTimeUnit, tenantId } = {}) {
    assertNoRestricted(lockMsgTitle, 'lockMsgTitle');
    assertNoRestricted(lockMsgContent, 'lockMsgContent');
    if (lockType === 'temporaryLock' && !lockDuration) throw new Error('Trustonic: lockDuration es requerido para temporaryLock');
    const lockList = toDeviceList(devices, clean({
      lockType, lockMsgTitle, lockMsgContent,
      lockDuration: lockType === 'temporaryLock' ? lockDuration : undefined,
      lockDurationTimeUnit: lockType === 'temporaryLock' ? (lockDurationTimeUnit || 'minute') : undefined
    }));
    return this._post('/device/lock/', { lockList }, tenantId);
  }

  /**
   * 4.3 Unlock Device — POST api/v2/device/unlock
   * Para PAYG/prepago es obligatorio validityDays o nextDue (timestamp UNIX).
   */
  async unlock(devices, { validityDays, nextDue, tenantId } = {}) {
    const unLockList = toDeviceList(devices, clean({ validityDays, nextDue }));
    return this._post('/device/unlock/', { unLockList }, tenantId);
  }

  /** 4.4 PIN Unlock — POST api/v2/device/pinunlock (regresa challengePin por dispositivo) */
  async pinUnlock(devices, { challenge, validity, userSerial, tenantId } = {}) {
    const pinUnlockList = toDeviceList(devices, clean({ challenge, validity, userSerial }));
    return this._post('/device/pinunlock/', { pinUnlockList }, tenantId);
  }

  /** 4.5 Release Device — PUT api/v2/device/release (irreversible: el equipo no puede re-inscribirse) */
  async release(devices, { reason, tenantId } = {}) {
    const deviceReleaseList = toDeviceList(devices, clean({ reason }));
    return this._post('/device/release/', { deviceReleaseList }, tenantId, 'PUT');
  }

  /** 4.6 Archive Device — POST api/v2/device/archive (el equipo ya no puede asignarse a servicios) */
  async archive(devices, { tenantId } = {}) {
    return this._post('/device/archive/', { archiveList: toDeviceList(devices) }, tenantId);
  }

  /** 4.7 Reload Device — POST api/v2/device/reload (requiere nextDue o reloadDays) */
  async reload(devices, { nextDue, reloadDays, tenantId } = {}) {
    if (!nextDue && !reloadDays) throw new Error('Trustonic: se requiere nextDue o reloadDays para reload');
    return this._post('/device/reload/', { reloadList: toDeviceList(devices, clean({ nextDue, reloadDays })) }, tenantId);
  }

  /** 4.8 Update Custom Property — PUT api/v2/device/customproperty */
  async updateCustomProperty(devices, customProperty, { tenantId } = {}) {
    for (const [k, v] of Object.entries(customProperty || {})) assertNoRestricted(v, `customProperty.${k}`);
    return this._post('/device/customproperty/', { customList: toDeviceList(devices, { customProperty }) }, tenantId, 'PUT');
  }

  /** 4.9 Update Device IMEI2 — PUT api/v2/device/info  ([{ deviceUid, imei2 }]) */
  async updateImei2(deviceList, { tenantId } = {}) {
    return this._post('/device/info/', { deviceList: toDeviceList(deviceList) }, tenantId, 'PUT');
  }

  /** 4.10 Report/Cancel Stolen — POST api/v2/device/theft  (action: 'report' | 'reset') */
  async theft(devices, action = 'report', { tenantId } = {}) {
    if (!['report', 'reset'].includes(action)) throw new Error("Trustonic: action debe ser 'report' o 'reset'");
    return this._post('/device/theft/', { theftDeviceList: toDeviceList(devices, { action }) }, tenantId);
  }

  /** 4.11 Lock Message — POST api/v2/device/lockMessage */
  async lockMessage(devices, { messageTitle, messageContent, messageTemplateId, tenantId } = {}) {
    if (!messageTitle && !messageTemplateId) throw new Error('Trustonic: se requiere messageTitle o messageTemplateId');
    assertNoRestricted(messageTitle, 'messageTitle');
    assertNoRestricted(messageContent, 'messageContent');
    const lockMessageList = toDeviceList(devices, clean({ messageTitle, messageContent, messageTemplateId }));
    return this._post('/device/lockMessage/', { lockMessageList }, tenantId);
  }

  /** 4.12 Disable Sim Control — POST api/v2/device/disableSimControlRule */
  async disableSimControl(devices, { tenantId } = {}) {
    return this._post('/device/disableSimControlRule', { deviceList: toDeviceList(devices) }, tenantId);
  }

  /** 4.13 Assign Sim Control — POST api/v2/device/assignSimControlRule */
  async assignSimControl(devices, simControlRuleId, { tenantId } = {}) {
    if (!simControlRuleId) throw new Error('Trustonic: simControlRuleId es requerido');
    return this._post('/device/assignSimControlRule', { deviceList: toDeviceList(devices, { simControlRuleId }) }, tenantId);
  }

  /** 4.14 IMSI Swap — POST api/v2/device/imsiSwap */
  async imsiSwap(devices, { tenantId } = {}) {
    return this._post('/device/imsiSwap', { imsiSwapList: toDeviceList(devices) }, tenantId);
  }

  /**
   * 4.15 Update Expiration Time — POST api/v2/device/updateExpiration
   * @param {Number|String|Date} expiration - timestamp UNIX (segundos) o fecha ISO 8601
   */
  async updateExpiration(devices, expiration, { customProperty, tenantId } = {}) {
    if (expiration === undefined || expiration === null) throw new Error('Trustonic: expiration es requerido');
    const value = expiration instanceof Date ? Math.floor(expiration.getTime() / 1000) : expiration;
    const updateExpirationList = toDeviceList(devices, clean({ expiration: value, customProperty }));
    return this._post('/device/updateExpiration', { updateExpirationList }, tenantId);
  }

  /** 4.16 Block ADB Command (solo Knox Guard) — POST api/v2/device/blockADB */
  async blockAdb(devices, blockADB = true, { tenantId } = {}) {
    return this._post('/device/blockADB', { ADBPropertyList: toDeviceList(devices, { blockADB: !!blockADB }) }, tenantId);
  }

  /** 4.17 Block AE Provision (solo Knox Guard) — POST api/v2/device/blockAEProvision */
  async blockAeProvision(devices, blockAEProvision = true, { tenantId } = {}) {
    return this._post('/device/blockAEProvision', { aeProvisionPropertyList: toDeviceList(devices, { blockAEProvision: !!blockAEProvision }) }, tenantId);
  }

  /** 4.18 Block Factory Reset (solo Knox Guard) — POST api/v2/device/blockFactoryReset */
  async blockFactoryReset(devices, blockFactoryReset = true, { tenantId } = {}) {
    return this._post('/device/blockFactoryReset', { factoryResetPropertyList: toDeviceList(devices, { blockFactoryReset: !!blockFactoryReset }) }, tenantId);
  }

  /**
   * 4.19 Blink Reminder — POST api/v2/device/blinkReminder
   * @param {Object} opts - { interval (segundos, 3..86400), title, message, timeLimit?: [h1,h2], dayLimit?: [d1,d2] }
   *   timeLimit desactiva el recordatorio en ese rango horario; dayLimit (con timeLimit) en ese rango de días.
   */
  async blinkReminder(devices, { interval, title, message, timeLimit, dayLimit, tenantId } = {}) {
    if (!Number.isInteger(interval) || interval < 3 || interval > 86400) throw new Error('Trustonic: interval debe ser un entero entre 3 y 86400 segundos');
    if (!title || !message) throw new Error('Trustonic: title y message son requeridos para blinkReminder');
    if (title.length > 200 || message.length > 200) throw new Error('Trustonic: title y message tienen un límite de 200 caracteres');
    assertNoRestricted(title, 'title');
    assertNoRestricted(message, 'message');
    const dayLimitEnable = Array.isArray(dayLimit);
    const timeLimitEnable = Array.isArray(timeLimit) && !dayLimitEnable;
    if (dayLimitEnable && !Array.isArray(timeLimit)) throw new Error('Trustonic: dayLimit requiere también timeLimit');
    const blinkReminderList = toDeviceList(devices, clean({
      interval, title, message,
      timeLimit: Array.isArray(timeLimit) ? timeLimit : undefined,
      dayLimit: dayLimitEnable ? dayLimit : undefined,
      // La especificación usa ambos nombres (…Enable / …Enabled); se envían los del ejemplo.
      timeLimitEnable,
      dayLimitEnable
    }));
    return this._post('/device/blinkReminder', { blinkReminderList }, tenantId);
  }
}
