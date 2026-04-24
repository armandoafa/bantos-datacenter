import UpyaManageClient from './modules/upya-api-client/src/index.js';

const username = 'armando.afa';
const password = '123456!';

async function test() {
  try {
    const upya = new UpyaManageClient(username, password);
    // Forzamos el uso de dataClient y el path correcto
    const res = await upya.dataClient.post('/data/deals/search', { query: {}, options: { limit: 10 } });
    const deals = res.data;
    
    console.log(`Searching in ${deals.length} deals...`);
    
    for (const d of deals) {
      console.log('--- DEAL:', d.dealName, '---');
      for (const [key, value] of Object.entries(d)) {
        if (typeof value === 'string' && value.length > 30) {
          console.log(`  [${key}]: ${value.substring(0, 100)}...`);
        }
        if (typeof value === 'object' && value !== null) {
          for (const [subKey, subValue] of Object.entries(value)) {
            if (typeof subValue === 'string' && subValue.length > 30) {
              console.log(`  [${key}.${subKey}]: ${subValue.substring(0, 100)}...`);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
