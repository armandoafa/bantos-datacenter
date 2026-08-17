export const optionalsEndpoints = (client) => ({
  searchPenalties: (query, options) => client.dataClient.post('/data/search/penalties', { query, ...options }),
  searchCommissions: (query, options) => client.dataClient.post('/data/search/commissions', { query, ...options }),
});
