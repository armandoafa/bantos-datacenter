import dynamicore from './src/services/dynamicore.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const payload = {
        status: "Active",
        pii: {
            name: "Carlos Garcia",
            phone: "+525500000000",
            email: `carlos_${Date.now()}@test.com`
        },
        client_type: "17"
    };

    try {
        console.log("--- TEST 1: /private/marketplace/apps/dynamicore/clients ---");
        const res1 = await dynamicore.request('POST', '/marketplace/apps/dynamicore/clients', payload);
        console.log("Res 1:", res1);
    } catch (e) {
        console.error("Error 1:", e.response?.data || e.message);
    }

    try {
        console.log("\n--- TEST 2: /private/api/v1/dynamicore/clients ---");
        const res2 = await dynamicore.request('POST', '/api/v1/dynamicore/clients', payload);
        console.log("Res 2:", res2);
    } catch (e) {
        console.error("Error 2:", e.response?.data || e.message);
    }
}

test();
