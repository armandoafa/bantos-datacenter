export const loansEndpoints = (client) => ({
  searchSchedules: (query, options) => client.dataClient.post('/data/search/schedules', { query, ...options }),
  getClosingBalance: async (contractNumber) => {
    const response = await client.dataClient.post('/data/loans/getClosingBalance', { contractNumber });
    return response.data;
  },
  editTerms: async (data) => {
    const response = await client.dataClient.put('/data/loans/editTerms', data);
    return response.data;
  },
  convertToLoan: async (data) => {
    const response = await client.dataClient.put('/data/loans/convertToLoan', data);
    return response.data;
  },
});
