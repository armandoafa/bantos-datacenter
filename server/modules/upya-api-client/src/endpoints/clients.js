/**
 * @typedef {import('../types').Upya.Client} Client
 * @typedef {import('../types').Upya.SearchOptions} SearchOptions
 */

export const clientsEndpoints = (client) => ({
  /**
   * Create one or more clients
   * @param {Client|Client[]} clients 
   */
  create: async (clients) => {
    const response = await client.dataClient.post('/data/clients', Array.isArray(clients) ? clients : [clients]);
    return response.data;
  },

  /**
   * Search for clients
   * @param {object} query - MongoDB-like query
   * @param {SearchOptions} options 
   */
  search: (query, options) => client.search('clients', query, options),

  /**
   * Count clients matching a query
   * @param {object} query 
   */
  count: (query) => client.count('clients', query),

  /**
   * Get a single client by ID
   * @param {string} clientId 
   * @returns {Promise<Client>}
   */
  get: async (clientId) => {
    const response = await client.apiClient.get(`/data/clients/${clientId}`);
    return response.data;
  },

  /**
   * Edit a client
   * @param {string} clientId 
   * @param {Partial<Client>} data 
   */
  edit: async (clientId, data) => {
    const response = await client.apiClient.put(`/data/clients/${clientId}`, data);
    return response.data;
  },
});
