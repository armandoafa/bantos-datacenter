import { toDeviceList } from './_utils.js';

export const STATE_NAMES = ['idle', 'readyForUse', 'enrolled', 'active', 'locked', 'released', 'protected', 'delivered', 'all'];

/** 5. Query Management */
export default class QueryEndpoints {
  constructor(client) {
    this.client = client;
  }

  _get(url, params, tenantId) {
    return this.client.request({ method: 'GET', url, params, tenantId });
  }

  /** 5.1 Tenant Info — GET api/v2/query/tenant (tenants accesibles con la API key; no usa header tenantId) */
  async getTenantInfo() {
    return this._get('/query/tenant/', undefined, null);
  }

  /** 5.2 Inventory Info — GET api/v2/query/inventory */
  async getInventoryInfo({ deviceType, deviceManufacturer, deviceModel, tenantId } = {}) {
    return this._get('/query/inventory', { deviceType, deviceManufacturer, deviceModel }, tenantId);
  }

  /** 5.3 Service Summary Info — GET api/v2/query/service */
  async getServiceSummary(serviceName, { deviceType, paymentMethod, tenantId } = {}) {
    return this._get('/query/service', { serviceName, deviceType, paymentMethod }, tenantId);
  }

  /** 5.4 Device Info — POST api/v2/query/devices */
  async getDeviceInfo(devices, { tenantId } = {}) {
    return this.client.request({ method: 'POST', url: '/query/devices', data: { deviceList: toDeviceList(devices) }, tenantId });
  }

  /** 5.7 User Info — GET api/v2/query/users */
  async getUsers({ username, tenantId } = {}) {
    return this._get('/query/users', { username }, tenantId);
  }

  /** 5.8 State Info — GET api/v2/query/state?stateName= (paginado, máx. 1000 por página) */
  async getDevicesByState(stateName = 'all', { pageNum, pageSize, tenantId } = {}) {
    if (!STATE_NAMES.includes(stateName)) throw new Error(`Trustonic: stateName debe ser uno de ${STATE_NAMES.join(', ')}`);
    return this._get('/query/state', { stateName, pageNum, pageSize }, tenantId);
  }

  /** Recorre todas las páginas de 5.8 y devuelve la lista completa de deviceUid. */
  async getAllDeviceUidsByState(stateName = 'all', { pageSize = 1000, tenantId, maxPages = 100 } = {}) {
    const uids = [];
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const res = await this.getDevicesByState(stateName, { pageNum, pageSize, tenantId });
      const page = (res?.deviceObjectList || []).map((d) => (typeof d === 'object' ? d.deviceUid : d)).filter(Boolean);
      uids.push(...page);
      if (page.length < pageSize) break;
    }
    return uids;
  }

  /** 5.9 Message Template — GET api/v2/query/messageTemplate (messageType: 'lock' | 'notify') */
  async getMessageTemplates({ messageType, tenantId } = {}) {
    return this._get('/query/messageTemplate', { messageType }, tenantId);
  }

  /** 5.10 Batch Action Status — GET api/v2/query/batchAction */
  async batchActionStatus(batchActionId, { pageNum, pageSize, tenantId } = {}) {
    return this._get('/query/batchAction', { batchActionId, pageNum, pageSize }, tenantId);
  }

  /** 5.11 TAC Info (API interna según especificación) — GET api/v2/query/tac */
  async getTacInfo(tacId, { tenantId } = {}) {
    return this._get('/query/tac', { tacId }, tenantId);
  }

  /** 5.12 Sim Control Rule Info — GET api/v2/query/simControls */
  async getSimControlRules(serviceName, { tenantId } = {}) {
    return this._get('/query/simControls', { serviceName }, tenantId);
  }
}
