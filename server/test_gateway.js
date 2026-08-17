import dynamicore from './src/services/dynamicore.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing Create Customer (Belvo Schema)...");
        const payload = {
            "firstname": "Carlos",
            "lastname": "Garcia",
            "email": `carlos_${Date.now()}@test.com`,
            "documentType": "mx_curp",
            "documentNumber": "1212323242",
            "phoneNumber": "+525500000000"
        };
        // Usamos el path que SÍ responde success en GET
        const res = await dynamicore.request('POST', '/marketplace/apps/belvo/customers', payload);
        console.log("Result:", res);
    } catch (e) {
        console.error("Test Failed Error:", e.response?.data || e.message);
    }
}

test();
