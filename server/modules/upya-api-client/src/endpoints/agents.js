export const agentsEndpoints = (client) => ({
  create: async (agents) => {
    const response = await client.dataClient.post('/data/agents', Array.isArray(agents) ? agents : [agents]);
    return response.data;
  },
  search: (query, options) => client.dataClient.post('/data/search/agents', { query, ...options }),
  edit: async (agentNumber, data) => {
    const response = await client.dataClient.put(`/data/agents/${agentNumber}`, data);
    return response.data;
  },
});
