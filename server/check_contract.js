import { UpyaManageClient } from './src/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const upya = new UpyaManageClient('armando.bantoshub', '123456!');
  const res = await upya.dataClient.post('/data/search/contracts', { query: {}, limit: 1 });
  console.log(JSON.stringify(res.data, null, 2));
}
test();
