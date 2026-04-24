export const paymentsEndpoints = (client) => ({
  search: (query, options) => client.dataClient.post('/data/search/payments', { query, ...options }),
  manual: async (paymentData) => {
    const response = await client.apiClient.post('/data/payments/manual', paymentData);
    return response.data;
  },
  external: async (paymentData) => {
    const response = await client.apiClient.post('/data/payments/external', paymentData);
    return response.data;
  },
  post: async (paymentData) => {
    const response = await client.apiClient.post('/data/payments/post', paymentData);
    return response.data;
  },
  searchDues: async (query, options) => {
    const response = await client.apiClient.post('/data/search/dues', { query, ...options });
    return response.data;
  },
  commissions: async (query) => {
    const response = await client.apiClient.post('/data/commissions/details', query);
    return response.data;
  },
});
