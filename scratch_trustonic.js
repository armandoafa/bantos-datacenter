import { TrustonicClient } from './server/modules/trustonic-api-client/index.js';

import 'dotenv/config';
const API_KEY = process.env.TRUSTONIC_API_KEY;
const client = new TrustonicClient(API_KEY);

async function test() {
    try {
        await client.authorize();
        console.log("Autorizado!");
        const response = await client.query.getDeviceInfo("357577948363276");
        console.log("RESPUESTA CRUDA:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("ERROR CRUDO:", e.message);
    }
}

test();
