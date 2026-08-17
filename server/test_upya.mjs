import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const username = process.env.UPYA_USER || 'itdevelopment';
    const password = process.env.UPYA_PASS || 'Alika2012.';
    console.log('Testing Upya Search for c-romel with Token Auth...');
    try {
        const upya = new UpyaManageClient(username, password, 'c-romel');
        const authOk = await upya.authenticate();
        console.log('Authentication status:', authOk);
        
        const res = await upya.clients.search({}, { limit: 5 });
        console.log('Clients fetched:', Array.isArray(res) ? res.length : res.data?.length || 0);
        console.log('Sample client:', JSON.stringify(Array.isArray(res) ? res[0] : res.data?.[0], null, 2));
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

test();
