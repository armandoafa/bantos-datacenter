import { TrustonicClient } from './modules/trustonic-api-client/index.js';
import { createRequire } from 'module';

import 'dotenv/config';
const API_KEY = process.env.TRUSTONIC_API_KEY;
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
