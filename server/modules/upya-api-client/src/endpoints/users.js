export const usersEndpoints = (client) => ({
  search: (query, options) => client.dataClient.post('/data/search/users', { query, ...options }),
  create: async (users) => {
    const response = await client.dataClient.post('/data/users', Array.isArray(users) ? users : [users]);
    return response.data;
  },
  edit: async (users) => {
    const response = await client.dataClient.put('/data/users', Array.isArray(users) ? users : [users]);
    return response.data;
  },
});
