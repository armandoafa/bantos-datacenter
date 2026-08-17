export const eventsEndpoints = (client) => ({
  searchContractEvents: (query, options) => client.dataClient.post('/data/search/contract-events', { query, ...options }),
  searchAssetEvents: (query, options) => client.dataClient.post('/data/search/asset-events', { query, ...options }),
});
