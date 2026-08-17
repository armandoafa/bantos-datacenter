import dynamicore from '/home/armandoafa/Projects/bantos-frontend/bantos-cloud-services/server/src/services/dynamicore.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

async function test() {
    // Payload exacto como el PDF ( Rafael Lopez example )
    const payload = {
        "client_type": "17",
        "pii": {
            "firstname": "Rafael",
            "lastname": "Lopez",
            "rfc": "RALO101086GT4",
            "email": `rafael_${Date.now()}@example.com`
        }
    };

    try {
        console.log("--- TEST MINIMAL: /private/api/v1/dynamicore/clients ---");
        const res = await dynamicore.request('POST', '/api/v1/dynamicore/clients', payload);
        console.log("Success:", res);
    } catch (e) {
        console.error("Failed:", e.response?.data || e.message);
    }
}

test();
