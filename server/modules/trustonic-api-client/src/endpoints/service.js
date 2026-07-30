export default class ServiceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 3. Activate Service - Activar servicio DeviceFinancing postpaid para dispositivo en inventario
   * POST api/v1/service/activate
   * @param {Array} deviceList - Arreglo de objetos de dispositivos segun especificacion
   */
  async activate(deviceList) {
    const list = Array.isArray(deviceList) ? deviceList : [deviceList];
    return this.client.request({
      method: 'POST',
      url: '/service/activate',
      data: { deviceList: list }
    });
  }

  /**
   * 11. Deactivate Service - Desactivar servicio y remover dispositivo del financiamiento
   * DELETE api/v1/service
   * @param {Array} deviceList - Arreglo de objetos de dispositivos segun especificacion
   */
  async deactivate(deviceList) {
    const list = Array.isArray(deviceList) ? deviceList : [deviceList];
    return this.client.request({
      method: 'DELETE',
      url: '/service',
      data: { deviceList: list }
    });
  }
}
