import { toDeviceList, clean } from './_utils.js';

/** 8. Contract Management */
export default class ContractEndpoints {
  constructor(client) {
    this.client = client;
  }

  /**
   * 8.1 Add Contract — POST api/v2/contract/addContract
   * @param {String} assignedContractDate - 'YYYY-MM-DD HH:MM:SS', igual o posterior a la fecha actual
   */
  async add(devices, contractId, assignedContractDate, { reloadTime, reloadTimeUnit, tenantId } = {}) {
    if (!contractId || !assignedContractDate) throw new Error('Trustonic: contractId y assignedContractDate son requeridos');
    const addContractList = toDeviceList(devices, clean({ contractId: String(contractId), assignedContractDate, reloadTime, reloadTimeUnit }));
    return this.client.request({ method: 'POST', url: '/contract/addContract/', data: { addContractList }, tenantId });
  }

  /** 8.2 Exit Contract — PUT api/v2/contract/exitContract */
  async exit(devices, exitReason, { tenantId } = {}) {
    if (!exitReason) throw new Error('Trustonic: exitReason es requerido');
    return this.client.request({ method: 'PUT', url: '/contract/exitContract/', data: { exitContractList: toDeviceList(devices, { exitReason }) }, tenantId });
  }

  /** 8.3 Get Contract List — GET api/v2/contract/contracts?serviceType= (postpaid | prepaid | simcontrol) */
  async list(serviceType, { tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/contract/contracts/', params: { serviceType }, tenantId });
  }

  /**
   * 8.4 Get Device Billing Cycles — GET api/v2/contract/deviceBillingCycles
   * La especificación lista deviceUid junto a los headers; se envía como query param y header.
   */
  async billingCycles(deviceUid, { tenantId } = {}) {
    return this.client.request({
      method: 'GET', url: '/contract/deviceBillingCycles/', params: { deviceUid }, headers: { deviceUid: String(deviceUid) }, tenantId
    });
  }

  /** 8.5 Update Device Payment — PUT api/v2/contract/updatePayment  (cycleNumbers: [1, 2, …]) */
  async updatePayment(deviceUid, cycleNumbers, { reloadTime, reloadTimeUnit, tenantId } = {}) {
    const deviceBillingCycles = (Array.isArray(cycleNumbers) ? cycleNumbers : [cycleNumbers]).map((cycleNumber) => ({ cycleNumber }));
    const updatePaymentList = toDeviceList(deviceUid, clean({ deviceBillingCycles, reloadTime, reloadTimeUnit }));
    return this.client.request({ method: 'PUT', url: '/contract/updatePayment/', data: { updatePaymentList }, tenantId });
  }
}
