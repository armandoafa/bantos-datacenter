export default class DeviceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 2.1 Upload Devices - Cargar dispositivos a inventario y/o activar servicio
   * POST api/v2/inventory/upload
   * @param {Array} deviceList - Arreglo de objetos de dispositivos segun especificacion v2
   */
  async uploadDevices(deviceList) {
    const list = Array.isArray(deviceList) ? deviceList : [deviceList];
    return this.client.request({
      method: 'POST',
      url: '/inventory/upload',
      data: { deviceList: list }
    });
  }

  /**
   * 2.3 Transfer Devices - Transferir dispositivos a otro tenant
   * POST api/v2/inventory/transfer
   * @param {String} targetTenantId - ID del tenant destino
   * @param {Array} deviceList - Arreglo de objetos [{ deviceUid }]
   */
  async transferDevices(targetTenantId, deviceList) {
    const list = Array.isArray(deviceList) ? deviceList : [deviceList];
    const formattedList = list.map(item => (typeof item === 'object' ? item : { deviceUid: item }));
    return this.client.request({
      method: 'POST',
      url: '/inventory/transfer',
      data: {
        targetTenantId,
        deviceList: formattedList
      }
    });
  }

  /**
   * 4.1 Message Device - Enviar mensaje / notificación al dispositivo
   * POST api/v2/device/notify/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos
   * @param {String} notificationTitle - Título de la notificación
   * @param {String} notificationMessage - Mensaje a mostrar
   * @param {String} notificationType - 'HEADSUP' o 'FULLSCREEN'
   */
  async notify(imeis, notificationTitle = '', notificationMessage = '', notificationType = 'HEADSUP') {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const messageList = list.map(item => {
      if (typeof item === 'object') return item;
      return {
        deviceUid: item,
        notificationType,
        notificationTitle,
        notificationMessage
      };
    });

    return this.client.request({
      method: 'POST',
      url: '/device/notify/',
      data: { messageList }
    });
  }

  /**
   * 4.2 Lock Device - Bloquear dispositivo (Permanente o Temporal con expirationTime)
   * POST api/v2/device/lock/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos lock
   * @param {String} lockMessage - Mensaje de pantalla (opcional)
   * @param {String} expirationTime - Expiración en ISO 8601 en UTC (opcional para bloqueo temporal)
   */
  async lock(imeis, lockMessage = '', expirationTime = null) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceLockList = list.map(item => {
      if (typeof item === 'object') return item;
      const obj = { deviceUid: item };
      if (lockMessage) obj.lockMessage = lockMessage;
      if (expirationTime) obj.expirationTime = expirationTime;
      return obj;
    });

    return this.client.request({
      method: 'POST',
      url: '/device/lock/',
      data: { deviceLockList }
    });
  }

  /**
   * 4.3 Unlock Device - Desbloquear dispositivo tras pago
   * POST api/v2/device/unlock/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos unlock
   */
  async unlock(imeis) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceUnlockList = list.map(item => {
      if (typeof item === 'object') return item;
      return { deviceUid: item };
    });

    return this.client.request({
      method: 'POST',
      url: '/device/unlock/',
      data: { deviceUnlockList }
    });
  }

  /**
   * 4.4 PIN Unlock - Solicitud de PIN de desbloqueo en modo offline
   * POST api/v2/device/pinunlock/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos
   */
  async pinUnlock(imeis) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const pinUnlockList = list.map(item => {
      if (typeof item === 'object') return item;
      return { deviceUid: item };
    });

    return this.client.request({
      method: 'POST',
      url: '/device/pinunlock/',
      data: { pinUnlockList }
    });
  }

  /**
   * 4.5 Release Device - Liberar dispositivo definitivamente de la plataforma
   * PUT api/v2/device/release/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos
   * @param {String} reason - Razón de liberación (ej: 'End of Tenure')
   */
  async release(imeis, reason = 'End of Tenure') {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceReleaseList = list.map(item => {
      if (typeof item === 'object') return item;
      return { deviceUid: item, reason };
    });

    return this.client.request({
      method: 'PUT',
      url: '/device/release/',
      data: { deviceReleaseList }
    });
  }

  /**
   * 4.6 Archive Device - Archivar dispositivo del inventario (ej. vendido al contado)
   * POST api/v2/device/archive/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos
   */
  async archive(imeis) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const archiveList = list.map(item => {
      if (typeof item === 'object') return item;
      return { deviceUid: item };
    });

    return this.client.request({
      method: 'POST',
      url: '/device/archive/',
      data: { archiveList }
    });
  }

  /**
   * 4.10 Report / Cancel Stolen - Reportar o cancelar reporte de robo
   * POST api/v2/device/theft/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos
   * @param {String} actionType - 'REPORT' o 'CANCEL'
   */
  async reportStolen(imeis, actionType = 'REPORT') {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceTheftList = list.map(item => {
      if (typeof item === 'object') return item;
      return { deviceUid: item, actionType };
    });

    return this.client.request({
      method: 'POST',
      url: '/device/theft/',
      data: { deviceTheftList }
    });
  }

  /**
   * 4.15 Update Expiration Time - Actualizar fecha de vencimiento de pago
   * POST api/v2/device/updateExpiration
   * @param {Array} updateExpirationList - [{ deviceUid, expirationTime }]
   */
  async updateExpirationTime(updateExpirationList) {
    const list = Array.isArray(updateExpirationList) ? updateExpirationList : [updateExpirationList];
    return this.client.request({
      method: 'POST',
      url: '/device/updateExpiration',
      data: { updateExpirationList: list }
    });
  }
}
