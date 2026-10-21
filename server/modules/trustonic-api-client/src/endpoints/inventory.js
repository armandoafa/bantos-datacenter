import { toDeviceList } from './_utils.js';

/** 2. Inventory Management */
export default class InventoryEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 2.1 Upload Devices — POST api/v2/inventory/upload
   * @param {Array<Object>} deviceList - [{ deviceUid, idType: 'imei'|'serialNo', deviceType: 'smartphone'|'tablet',
   *   additionalInfo?, reloadDays?, contractId?, assignedContractDate?, workflowId?, reloadTime?, reloadTimeUnit?,
   *   simControlRuleId?, serviceList?: [{ serviceName, serviceTenure?, paymentMethod? }] }]  (1..10,000)
   */
  async upload(deviceList, { tenantId } = {}) {
    return this.client.request({
      method: 'POST', url: '/inventory/upload', tenantId,
      data: { deviceList: toDeviceList(deviceList, { idType: 'imei', deviceType: 'smartphone' }) }
    });
  }

  /** 2.2 Upload Status — GET api/v2/inventory?uploadId= */
  async uploadStatus(uploadId, { pageNum, pageSize, tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/inventory', params: { uploadId, pageNum, pageSize }, tenantId });
  }

  /**
   * 2.3 Transfer Devices — POST api/v2/inventory/transfer
   * Solo dispositivos en estado Idle; `tenantId` debe ser el tenant padre.
   */
  async transfer(devices, targetTenantId, { tenantId } = {}) {
    if (!targetTenantId) throw new Error('Trustonic: targetTenantId es requerido para transferir');
    return this.client.request({
      method: 'POST', url: '/inventory/transfer', tenantId,
      data: { targetTenantId, transferDeviceList: toDeviceList(devices) }
    });
  }

  /** 2.4 Transfer Status — GET api/v2/inventory/transfer?transferId= */
  async transferStatus(transferId, { tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/inventory/transfer', params: { transferId }, tenantId });
  }
}
