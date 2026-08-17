export default class DeviceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * Envía un mensaje a uno o más dispositivos (4.1 Message Device)
   * @param {Array|String} imeis - IMEI del dispositivo o arreglo de IMEIs
   * @param {String} message - Mensaje a mostrar
   */
  async message(imeis, message) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/devices/message',
      data: {
        devices,
        message
      }
    });
  }

  /**
   * Bloquea uno o más dispositivos (4.2 Lock Device)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   * @param {String} lockMessage - Mensaje de bloqueo en pantalla (Opcional)
   * @param {Number} lockTime - Tiempo de bloqueo en horas (0 para bloqueo indefinido)
   */
  async lock(imeis, lockMessage = '', lockTime = 0) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    const data = { devices };
    if (lockMessage) data.lockMessage = lockMessage;
    if (lockTime > 0) data.lockTime = lockTime;

    return this.client.request({
      method: 'POST',
      url: '/devices/lock',
      data
    });
  }

  /**
   * Desbloquea uno o más dispositivos (4.3 Unlock Device)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   */
  async unlock(imeis) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/devices/unlock',
      data: { devices }
    });
  }

  /**
   * Libera definitivamente un dispositivo de la plataforma (4.5 Release Device)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   */
  async release(imeis) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/devices/release',
      data: { devices }
    });
  }

  /**
   * Actualiza el tiempo de expiración de uno o más dispositivos (4.15 Update Expiration Time)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   * @param {String} date - Fecha en formato 'YYYY-MM-DDTHH:MM:SS' o número de horas si `timeUnit` es 'HOUR'
   * @param {String} timeUnit - 'HOUR' o 'DATE'
   */
  async updateExpirationTime(imeis, date, timeUnit = 'DATE') {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/devices/updateExpirationTime',
      data: {
        devices,
        date,
        timeUnit
      }
    });
  }

  /**
   * Genera un recordatorio visual (parpadeo) en el dispositivo (4.19 Blink Reminder)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   * @param {Number} blinkInterval - Intervalo en milisegundos
   * @param {Number} blinkCount - Número de parpadeos
   */
  async blinkReminder(imeis, blinkInterval = 1000, blinkCount = 5) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/devices/blink',
      data: {
        devices,
        blinkInterval,
        blinkCount
      }
    });
  }
}
