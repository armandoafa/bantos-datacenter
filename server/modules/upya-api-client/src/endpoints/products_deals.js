export const productsEndpoints = (client) => ({
  create: async (productData) => {
    const response = await client.dataClient.post('/data/products/create', productData);
    return response.data;
  },
  update: async (productData) => {
    const response = await client.dataClient.put('/data/products', productData);
    return response.data;
  },
  edit: async (productData) => {
    return client.products.update(productData);
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
  edit: async (dealData) => {
    const response = await client.dataClient.put('/data/deals', dealData);
    return response.data;
  },
  update: async (dealData) => {
    return client.deals.edit(dealData);
  },
  search: (query, options) => client.search('deals', query, options),
});
