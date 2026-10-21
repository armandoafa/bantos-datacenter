import { toDeviceList } from './_utils.js';

export const SERVICE_NAMES = ['supplyChain', 'deviceFinancing', 'simControl', 'theftProtection', 'subsidyProtection'];
export const DEACTIVATE_REASONS = ['tenureEnd', 'soldForCash', 'cancel', 'lost', 'stolen', 'other'];

/** 3. Service Management */
export default class ServiceEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 3.1 Activate — POST api/v2/service/activate
   * @param {String|Array} devices - IMEI(s) o [{ deviceUid, reloadDays?, contractId?, … }]
   * @param {Array<Object>} serviceList - [{ serviceName, serviceTenure?, paymentMethod?: 'prepaid'|'postpaid' }]
   * @param {Object} options - campos por dispositivo comunes (reloadDays, contractId, workflowId, simControlRuleId…) y tenantId
   */
  async activate(devices, serviceList, { tenantId, ...deviceFields } = {}) {
    if (!Array.isArray(serviceList) || !serviceList.length) throw new Error('Trustonic: serviceList es requerido para activar');
    return this.client.request({
      method: 'POST', url: '/service/activate', tenantId,
      data: { deviceList: toDeviceList(devices, { ...deviceFields, serviceList }) }
    });
  }

  /**
   * 3.2 Deactivate — DELETE api/v2/service
   * @param {Array<Object>} serviceList - [{ serviceName, deactivateReason, paymentMethod?, additionalRemarks? }]
   */
  async deactivate(devices, serviceList, { tenantId } = {}) {
    if (!Array.isArray(serviceList) || !serviceList.length) throw new Error('Trustonic: serviceList es requerido para desactivar');
    for (const s of serviceList) {
      if (!DEACTIVATE_REASONS.includes(s.deactivateReason)) {
        throw new Error(`Trustonic: deactivateReason debe ser uno de ${DEACTIVATE_REASONS.join(', ')}`);
      }
    }
    return this.client.request({
      method: 'DELETE', url: '/service', tenantId,
      data: { deviceList: toDeviceList(devices, { serviceList }) }
    });
  }

  /**
   * 3.3 Update — PATCH api/v2/service/
   * @param {Array<Object>} serviceList - [{ serviceName, serviceTenure?, paymentMethod? }]
   * @param {Object} options - { reloadDays?, additionalInfo?, tenantId }
   */
  async update(devices, serviceList, { tenantId, ...deviceFields } = {}) {
    return this.client.request({
      method: 'PATCH', url: '/service/', tenantId,
      data: { deviceList: toDeviceList(devices, { ...deviceFields, serviceList }) }
    });
  }

  /** 3.4 Status — GET api/v2/service?serviceOrderId= (estado de una orden de servicio) */
  async status(serviceOrderId, { pageNum, pageSize, tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/service', params: { serviceOrderId, pageNum, pageSize }, tenantId });
  }
}
