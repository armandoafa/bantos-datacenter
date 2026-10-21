import { toDeviceList, clean } from './_utils.js';

/** 9. Workflow Management */
export default class WorkflowEndpoints {
  constructor(client) {
    this.client = client;
  }

  /** 9.1 Add Workflow — POST api/v2/workflow/addWorkflow */
  async add(devices, workflowId, { assignedWorkflowDate, tenantId } = {}) {
    if (!workflowId) throw new Error('Trustonic: workflowId es requerido');
    const addWorkflowList = toDeviceList(devices, clean({ workflowId, assignedWorkflowDate }));
    return this.client.request({ method: 'POST', url: '/workflow/addWorkflow/', data: { addWorkflowList }, tenantId });
  }

  /** 9.2 Exit Workflow — PUT api/v2/workflow/exitWorkflow */
  async exit(devices, exitReason, { tenantId } = {}) {
    if (!exitReason) throw new Error('Trustonic: exitReason es requerido');
    return this.client.request({ method: 'PUT', url: '/workflow/exitWorkflow/', data: { exitWorkflowList: toDeviceList(devices, { exitReason }) }, tenantId });
  }

  /** 9.3 Get Workflow List — GET api/v2/workflow/workflows?serviceType= */
  async list(serviceType, { tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/workflow/workflows', params: { serviceType }, tenantId });
  }
}
