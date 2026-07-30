export default class QueryEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 5. Device Info - Obtiene información detallada de los dispositivos
   * POST api/v2/query/devices
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de IMEIs/deviceUids
   */
  async getDeviceInfo(imeis) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceList = list.map(item => (typeof item === 'object' ? item : { deviceUid: item }));
    
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
      this.client.client.defaults.baseURL = originalBase;
    }
  }

  /**
   * 4. Upload Status - Revisa el estatus de carga de dispositivos
   * GET api/v1/inventory?uploadid={uploadID}
   * @param {String} uploadID
   */
  async getUploadStatus(uploadID) {
    return this.client.request({
      method: 'GET',
      url: `/inventory?uploadid=${encodeURIComponent(uploadID)}`
    });
  }
}
