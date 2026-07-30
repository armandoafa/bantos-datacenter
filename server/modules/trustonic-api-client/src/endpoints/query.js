export default class QueryEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 5.1 Tenant Info
   * GET api/v2/query/tenant/
   */
  async getTenantInfo() {
    return this.client.request({
      method: 'GET',
      url: '/query/tenant/'
    });
  }

  /**
   * 5.2 Inventory Info / Service Query
   * GET api/v2/query/service?serviceName={serviceName}&deviceType={deviceType}
   */
  async getServiceInfo(serviceName = 'DeviceFinancing', deviceType = '') {
    const query = deviceType 
      ? `/query/service?serviceName=${encodeURIComponent(serviceName)}&deviceType=${encodeURIComponent(deviceType)}`
      : `/query/service?serviceName=${encodeURIComponent(serviceName)}`;
    return this.client.request({
      method: 'GET',
      url: query
    });
  }

  /**
   * 5.4 Device Info - Obtiene información detallada de los dispositivos
   * POST api/v2/query/devices
   * @param {Array|String} imeis - IMEI, deviceUid o arreglo de IMEIs/deviceUids
   */
  async getDeviceInfo(imeis) {
    const list = Array.isArray(imeis) ? imeis : [imeis];
    const deviceList = list.map(item => (typeof item === 'object' ? item : { deviceUid: item }));
    
    return this.client.request({
      method: 'POST',
      url: '/query/devices',
      data: { deviceList }
    });
  }

  /**
   * 2.2 Upload Status - Revisa el estatus de carga de dispositivos
   * GET api/v2/inventory?uploadId={uploadId}
   * @param {String} uploadId
   */
  async getUploadStatus(uploadId) {
    return this.client.request({
      method: 'GET',
      url: `/inventory?uploadId=${encodeURIComponent(uploadId)}`
    });
  }

  /**
   * 2.4 Transfer Status - Revisa el estatus de transferencia
   * GET api/v2/inventory/transfer?transferId={transferId}
   * @param {String} transferId
   */
  async getTransferStatus(transferId) {
    return this.client.request({
      method: 'GET',
      url: `/inventory/transfer?transferId=${encodeURIComponent(transferId)}`
    });
  }

  /**
   * 5.10 Batch Action Status
   * GET api/v2/query/batchAction?batchActionId={batchActionId}
   */
  async getBatchActionStatus(batchActionId) {
    return this.client.request({
      method: 'GET',
      url: `/query/batchAction${batchActionId ? `?batchActionId=${encodeURIComponent(batchActionId)}` : ''}`
    });
  }
}
