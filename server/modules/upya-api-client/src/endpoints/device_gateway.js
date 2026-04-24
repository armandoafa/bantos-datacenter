/**
 * @typedef {import('../types').Upya.Token} Token
 * @typedef {import('../types').Upya.AddTokensRequest} AddTokensRequest
 */

export const deviceGatewayEndpoints = (client) => ({
  /**
   * Add tokens (Create units and assign activation codes)
   * @param {AddTokensRequest} data 
   */
  addTokens: async (data) => {
    const response = await client.tokenMgmtClient.post('/tokens', data);
    return response.data;
  },

  /**
   * Modify existing tokens
   * @param {Token[]} tokens - Array of token objects
   */
  modifyTokens: async (tokens) => {
    const response = await client.tokenMgmtClient.put('/tokens/modify-data', tokens);
    return response.data;
  },

  /**
   * Search for tokens
   * @param {object} query - { query: { serialNumbers: string[] }, includeFlags?: boolean }
   */
  searchTokens: async (query) => {
    const response = await client.tokenMgmtClient.post('/tokens/search', query);
    return response.data;
  },

  /**
   * Analyze tokens
   */
  analyzeTokens: async () => {
    const response = await client.tokenMgmtClient.post('/tokens/analyze');
    return response.data;
  },
});
