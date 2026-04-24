export const assetsEndpoints = (client) => ({
  search: (query, options) => client.dataClient.post('/data/search/assets', { query, ...options }),
  create: async (assets) => {
    const response = await client.dataClient.post('/data/assets', Array.isArray(assets) ? assets : [assets]);
    return response.data;
  },
  edit: async (data) => {
    const response = await client.dataClient.put('/data/assets', data);
    return response.data;
  },
  get: async (serialNumber) => {
    const response = await client.apiClient.get(`/data/assets/${serialNumber}`);
    return response.data;
  },
  transfer: async (transferData) => {
    const response = await client.dataClient.post('/data/assets/transfer', transferData);
    return response.data;
  },
});
