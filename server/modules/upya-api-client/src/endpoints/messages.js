export const messagesEndpoints = (client) => ({
  search: (query, options) => client.dataClient.post('/data/search/messages', { query, ...options }),
  count: (query) => client.dataClient.post('/data/count/messages', { query }),
});
