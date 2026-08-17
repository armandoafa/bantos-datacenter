import dotenv from 'dotenv';
dotenv.config();
import dynamicore from './src/services/dynamicore.js';

async function test() {
    try {
        console.log("Checking GET /marketplace/apps/belvo/customers");
        const res = await dynamicore.request('GET', '/marketplace/apps/belvo/customers');
        console.log("Success:", JSON.stringify(res));
    } catch (e) {
        console.log("Failed:", e.response?.status, JSON.stringify(e.response?.data));
    }
}

test();
