import { TrustonicClient } from './modules/trustonic-api-client/index.js';
import { createRequire } from 'module';

const API_KEY = 'qjF+s7/rxVffo3Fnzm20PdIlFGDDpYOredEsRvl3wYYUAh2vhnmeHoQuUQNkKdoyOQCQN6oDcAZ7166n59orHQ==';
const client = new TrustonicClient(API_KEY);

async function test() {
    try {
        await client.authorize();
        const res = await client.request({ method: 'GET', url: '/smartphones' });
        console.log('Result length:', (res.items || res || []).length);
        console.log('Sample:', (res.items || res || [])[0]);
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}
test();
