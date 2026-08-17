/**
 * @typedef {import('../types').Upya.Contract} Contract
 * @typedef {import('../types').Upya.SearchOptions} SearchOptions
 */

export const contractsEndpoints = (client) => ({
  /**
   * Create a new contract
   * @param {Partial<Contract>} contractData 
   */
  create: async (contractData) => {
    const response = await client.dataClient.post('/data/contracts/create', contractData);
    return response.data;
  },

  /**
   * Search for contracts
   * @param {object} query 
   * @param {SearchOptions} options 
   */
  search: (query, options) => client.search('contracts', query, options),

  /**
   * Get a contract by contract number
   * @param {string} contractNumber 
   * @returns {Promise<Contract>}
   */
  get: async (contractNumber) => {
    const response = await client.apiClient.get(`/data/contracts/${contractNumber}`);
    return response.data;
  },

  /**
   * Update contract details (updateOne / hard reset)
   * @param {object} data - { contractNumber, totalPaid, status, nextStatusUpdate, ... }
   */
  updateOne: async (data) => {
    const response = await client.dataClient.put('/data/contracts/updateOne', data);
    return response.data;
  },

  /**
   * Update contract details (alias for updateOne)
   * @param {object} data
   */
  update: async (data) => {
    return client.contracts.updateOne(data);
  },

  /**
   * Bulk approve contracts
   * @param {string[]} contractNumbers 
   */
  approve: async (contractNumbers) => {
    const response = await client.dataClient.put('/data/contracts/approve', { contractNumbers });
    return response.data;
  },

  /**
   * Bulk reject contracts
   * @param {string[]} contractNumbers 
   */
  reject: async (contractNumbers) => {
    const response = await client.dataClient.put('/data/contracts/reject', { contractNumbers });
    return response.data;
  },

  /**
   * Sign one or multiple contracts
   * @param {object} data - { contractNumber, paygNumber, signingDate, ... } or { data: [...] }
   */
  sign: async (data) => {
    const response = await client.dataClient.put('/data/contracts/sign', data);
    return response.data;
  },

  /**
   * Change deal (pricing terms) of an existing contract
   * @param {object} data - { contractNumber, dealNumber, ... } or { data: [...] }
   */
  changeDeal: async (data) => {
    const response = await client.dataClient.put('/data/contracts/changedeal', data);
    return response.data;
  },

  /**
   * Edit specific terms of an existing contract
   * @param {object} data - { contractNumber, edits: { totalCost, pricingSchedule } }
   */
  editTerms: async (data) => {
    const response = await client.dataClient.put('/data/contracts/editterms', data);
    return response.data;
  },

  /**
   * Add unit to contract
   * @param {object} data - { contractNumber, paygNumber, ... }
   */
  addUnit: async (data) => {
    const response = await client.dataClient.put('/data/contracts/addUnit', data);
    return response.data;
  },

  /**
   * Pay off contracts / unlock
   * @param {object} data - { contractNumbers, sendCodeToClients }
   */
  unlock: async (data) => {
    const response = await client.dataClient.put('/data/contracts/unlock', data);
    return response.data;
  },

  /**
   * Write off contracts
   * @param {object} data - { contractNumbers }
   */
  writeoff: async (data) => {
    const response = await client.dataClient.put('/data/contracts/writeoff', data);
    return response.data;
  },

  /**
   * Send bonus code to a unit/contract
   * @param {object} data - { contractNumber, days, ... }
   */
  sendBonus: async (data) => {
    const response = await client.dataClient.post('/data/codes/send-bonus', data);
    return response.data;
  },

  /**
   * Synchronize unit state
   * @param {object} data - { contractNumber, ... }
   */
  syncUnit: async (data) => {
    const response = await client.dataClient.post('/data/codes/syncUnit', data);
    return response.data;
  },
});
