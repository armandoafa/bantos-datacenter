import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.UPYA_USER;
const password = process.env.UPYA_PASS;

async function test() {
  const upya = new UpyaManageClient(username, password);
  const collections = ['countries', 'organisations', 'branches', 'shops'];
  
  for (const coll of collections) {
    try {
      const res = await upya.dataClient.post(`/data/search/${coll}`, { query: {}, limit: 1 });
      console.log(`Coll: ${coll}, Data:`, typeof res.data, Array.isArray(res.data) ? `Array(${res.data.length})` : 'Not Array');
      if (res.data.message) console.log('Message:', res.data.message);
      if (Array.isArray(res.data) && res.data.length > 0) {
          console.log('Sample:', JSON.stringify(res.data[0], null, 2));
      }
    } catch (e) {
      console.log(`Coll: ${coll}, Error: ${e.message}`);
    }
  }
}

test();
