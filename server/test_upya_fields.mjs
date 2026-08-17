import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const username = process.env.UPYA_USER || 'itdevelopment';
    const password = process.env.UPYA_PASS || 'Alika2012.';
    
    const upya = new UpyaManageClient(username, password);
    
    try {
        console.log('Fetching 1 client with NO filter...');
        const res = await upya.dataClient.post('/data/search/clients', { query: {}, limit: 1 });
        const client = res.data?.[0] || res.data?.results?.[0];
        console.log('Sample client fields:', Object.keys(client || {}));
        console.log('Full sample client:', JSON.stringify(client, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
