import UpyaManageClient from './modules/upya-api-client/src/index.js';

async function test() {
  try {
    const upya = new UpyaManageClient('judithmoralesplay', 'JuD13.@');
    console.log("Instantiated client. Fetching agents...");
    const res = await upya.apiClient.post('/data/search/agents', { query: {}, limit: 10, skip: 0 });
    console.log("Agents response:", res.data);
    
    console.log("Fetching clients...");
    const res2 = await upya.dataClient.post('/data/search/clients', { query: {}, limit: 10, skip: 0 });
    console.log("Clients response:", res2.data);
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}
test();
