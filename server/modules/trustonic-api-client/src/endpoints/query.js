export default class QueryEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * Obtiene la información detallada de uno o más dispositivos (5.4 Device Info)
   * NOTA: Utiliza v2 de la API según especificación
   * @param {Array|String} imeis - IMEI o arreglo de IMEIs
   */
  async getDeviceInfo(imeis) {
    const deviceList = Array.isArray(imeis) ? imeis.map(imei => ({ deviceUid: imei })) : [{ deviceUid: imeis }];
    
    // Sobrescribimos el baseURL localmente para usar v2
    const originalBase = this.client.client.defaults.baseURL;
    this.client.client.defaults.baseURL = originalBase.replace('/api/v1', '/api/v2');
    
    try {
      const response = await this.client.request({
        method: 'POST',
        url: '/query/devices',
        data: { deviceList }
      });
      return response;
    } finally {
      // Restauramos la URL base a v1
      this.client.client.defaults.baseURL = originalBase;
    }
  }

  /**
   * Obtiene la información del tenant (5.1 Tenant Info)
   */
  async getTenantInfo() {
    return this.client.request({
      method: 'GET',
      url: '/query/tenant'
    });
  }

  /**
   * Obtiene la información de inventario (5.2 Inventory Info)
   */
  async getInventoryInfo() {
    return this.client.request({
      method: 'GET',
      url: '/query/inventory'
    });
  }
}
