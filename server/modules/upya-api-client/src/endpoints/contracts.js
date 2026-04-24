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
   * Update contract details
   * @param {string} contractNumber 
   * @param {Partial<Contract>} data 
   */
  update: async (contractNumber, data) => {
    const response = await client.apiClient.put(`/data/contracts/${contractNumber}`, data);
    return response.data;
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
});
