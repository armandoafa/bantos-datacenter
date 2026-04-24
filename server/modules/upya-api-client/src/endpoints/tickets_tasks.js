export const ticketsEndpoints = (client) => ({
  create: async (ticketData) => {
    const response = await client.dataClient.post('/data/tickets/create', ticketData);
    return response.data;
  },
  search: (query, options) => client.apiClient.post('/data/search/tickets', { query, ...options }),
});

export const tasksEndpoints = (client) => ({
  create: async (taskData) => {
    const response = await client.dataClient.post('/data/tasks/create', taskData);
    return response.data;
  },
  search: (query, options) => client.apiClient.post('/data/search/tasks', { query, ...options }),
});
