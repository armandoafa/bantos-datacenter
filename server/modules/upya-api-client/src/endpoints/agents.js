export const agentsEndpoints = (client) => ({
  create: async (agents) => {
    const response = await client.dataClient.post('/data/agents', Array.isArray(agents) ? agents : [agents]);
    return response.data;
  },
  search: (query, options) => client.dataClient.post('/data/search/agents', { query, ...options }),
  edit: async (agentNumberOrData, data = {}) => {
    let body;
    if (typeof agentNumberOrData === 'object' && agentNumberOrData !== null) {
      body = agentNumberOrData;
    } else {
      body = { agentNumber: agentNumberOrData, ...data };
    }
    const response = await client.dataClient.put('/data/agents', body);
    return response.data;
  },
  update: async (agentNumberOrData, data = {}) => {
    return client.agents.edit(agentNumberOrData, data);
  },
});
