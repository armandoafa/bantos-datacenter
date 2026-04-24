export const productsEndpoints = (client) => ({
  create: async (productData) => {
    const response = await client.dataClient.post('/data/products/create', productData);
    return response.data;
  },
  update: async (id, productData) => {
    const response = await client.dataClient.put(`/data/products/${id}`, productData);
    return response.data;
  },
  search: async (query, options) => {
    const response = await client.dataClient.post('/data/products/search', { query, ...options });
    return response.data;
  },
});

export const dealsEndpoints = (client) => ({
  create: async (dealData) => {
    const response = await client.dataClient.post('/data/deals/create', dealData);
    return response.data;
  },
  search: (query, options) => client.apiClient.post('/data/search/deals', { query, ...options }),
});
