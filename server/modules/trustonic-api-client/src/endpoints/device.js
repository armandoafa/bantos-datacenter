export default class DeviceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 2. Upload Devices - Cargar dispositivos a inventario y/o activar servicio
   * POST api/v1/inventory/upload
   * @param {Array} deviceList - Arreglo de objetos de dispositivos segun especificacion v2.0.1
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
   * 6. Message Device - Enviar mensaje / notificación al dispositivo
   * POST api/v1/device/notify/
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
   * 7. Lock Device - Bloquear dispositivo
   * POST api/v1/device/lock/
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de objetos lock
   * @param {String} lockMessage - Mensaje de pantalla (opcional)
   */
  async lock(imeis, lockMessage = '') {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceLockList = list.map(item => {
      if (typeof item === 'object') return item;
      const obj = { deviceUid: item };
      if (lockMessage) obj.lockMessage = lockMessage;
      return obj;
    });

    return this.client.request({
      method: 'POST',
      url: '/device/lock/',
      data: { deviceLockList }
    });
  }

  /**
   * 8. Unlock Device - Desbloquear dispositivo tras pago
   * POST api/v1/device/unlock/
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
   * 9. PIN Unlock - Solicitud de PIN de desbloqueo en modo offline
   * POST api/v1/device/pinunlock/
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
   * 10. Release Device - Liberar dispositivo definitivamente de la plataforma
   * PUT api/v1/device/release/
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
   * 12. Archive - Archivar dispositivo del inventario (ej. vendido al contado)
   * POST api/v1/device/archive/
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
}
