export const communicationEndpoints = (client) => ({
  sendNotification: async (data) => {
    const response = await client.dataClient.post('/data/communication/notification', data);
    return response.data;
  },
  sendChat: async (data) => {
    const response = await client.dataClient.post('/data/communication/chat', data);
    return response.data;
  },
  sendSms: async (data) => {
    const response = await client.dataClient.post('/data/communication/sms', data);
    return response.data;
  },
  sendTextMessage: async (data) => {
    const response = await client.dataClient.post('/data/communication/message', data);
    return response.data;
  },
});
