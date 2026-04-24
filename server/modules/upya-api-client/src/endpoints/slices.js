export const slicesEndpoints = (client) => ({
  edit: async (sliceNumber, data) => {
    const response = await client.dataClient.put('/data/slices/', { sliceNumber, ...data });
    return response.data;
  },
});
