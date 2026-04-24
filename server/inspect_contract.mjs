import UpyaManageClient from './modules/upya-api-client/src/index.js';

const username = 'armando.afa';
const password = '123456!';

async function test() {
  try {
    const upya = new UpyaManageClient(username, password);
    const res = await upya.search('contracts', {}, { limit: 1 });
    const contracts = Array.isArray(res) ? res : (res.data || []);
    
    if (contracts.length === 0) {
        console.log('No contracts found');
        return;
    }

    const con = contracts[0];
    console.log('--- CONTRACT STRUCTURE ---');
    console.log(JSON.stringify(con, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
