import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.UPYA_USER || 'armando.bantoshub';
const password = process.env.UPYA_PASS || '123456!';

async function inspectContract() {
    const upya = new UpyaManageClient(username, password);
    const clientId = '69ff4ce4dfdd3600127f1f0c';

    console.log(`Searching events for client ID: ${clientId}`);
    try {
        const eventsRes = await upya.dataClient.post('/data/search/client-events', { query: { clientId: clientId }, limit: 50 });
        console.log('Response Keys:', Object.keys(eventsRes));
        console.log('Response Data Type:', typeof eventsRes.data);
        if (Array.isArray(eventsRes.data)) {
            console.log('Response Data Length:', eventsRes.data.length);
            console.log('First event:', JSON.stringify(eventsRes.data[0], null, 2));
        } else {
            console.log('Response Data:', JSON.stringify(eventsRes.data, null, 2));
        }
    } catch (e) {
        console.error('Error fetching client events:', e.message);
    }
}

inspectContract();
