export const dataCollectionsEndpoints = (client) => ({
  /**
   * Search for data collection forms (questionnaires)
   * @param {object} query - MongoDB-like query
   * @param {object} options - skip, limit, sort
   */
  search: async (query = {}, options = {}) => {
    // Note: Data collection in Upya often lives under /data/search/forms or /data/questionnaires/search
    // Based on exploration, /data/search/forms is the documentation standard.
    const response = await client.dataClient.post('/data/search/forms', { query, ...options });
    return response.data;
  },

  /**
   * Get a specific form by ID
   */
  get: async (id) => {
    const response = await client.dataClient.get(`/data/forms/${id}`);
    return response.data;
  },

  /**
   * Create a new data collection form
   */
  create: async (formData) => {
    const response = await client.dataClient.post('/data/forms', formData);
    return response.data;
  },

  /**
   * Update an existing data collection form
   */
  update: async (id, formData) => {
    const response = await client.dataClient.put(`/data/forms/${id}`, formData);
    return response.data;
  }
});
