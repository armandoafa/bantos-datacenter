import { TrustonicClient } from './server/modules/trustonic-api-client/index.js';

const API_KEY = 'qjF+s7/rxVffo3Fnzm20PdIlFGDDpYOredEsRvl3wYYUAh2vhnmeHoQuUQNkKdoyOQCQN6oDcAZ7166n59orHQ==';
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
