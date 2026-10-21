export default class ServiceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * Activa el servicio en los dispositivos especificados (3.1 Activate)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   * @param {Number} cycleDays - Días del ciclo de facturación
   */
  async activate(imeis, cycleDays = 30) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/services/activate',
      data: {
        devices,
        cycleDays
      }
    });
  }

  /**
   * Desactiva el servicio de los dispositivos (3.2 Deactivate)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   */
  async deactivate(imeis) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/services/deactivate',
      data: { devices }
    });
  }

  /**
   * Actualiza parámetros del servicio como días del ciclo (3.3 Update)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   * @param {Number} reloadDays - Días a recargar
   */
  async update(imeis, reloadDays) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/services/update',
      data: {
        devices,
        reloadDays
      }
    });
  }

  /**
   * Consulta el estado del servicio de los dispositivos (3.4 Status)
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   */
  async status(imeis) {
    const devices = Array.isArray(imeis) ? imeis.map(imei => ({ imei1: imei })) : [{ imei1: imeis }];
    return this.client.request({
      method: 'POST',
      url: '/services/status',
      data: { devices }
    });
  }
}
