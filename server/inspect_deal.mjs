import UpyaManageClient from './modules/upya-api-client/src/index.js';

const username = 'armando.afa';
const password = '123456!';

async function test() {
  try {
    const upya = new UpyaManageClient(username, password);
    const res = await upya.search('deals', {}, { limit: 1 });
    const deals = Array.isArray(res) ? res : (res.data || []);
    
    if (deals.length === 0) {
        console.log('No deals found');
        return;
    }

    const d = deals[0];
    console.log('--- DEAL STRUCTURE ---');
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
