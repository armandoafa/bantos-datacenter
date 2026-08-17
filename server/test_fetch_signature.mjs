import UpyaManageClient from './modules/upya-api-client/src/index.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.UPYA_USER || 'armando.bantoshub';
const password = process.env.UPYA_PASS || '123456!';

async function fetchSignature() {
    const upya = new UpyaManageClient(username, password);
    
    // Attempt 1: Using the _id of the answer item
    const answerId = '69ff4ea2dfdd3600127f4247'; 
    console.log(`Trying with answerId: ${answerId}`);
    try {
        const signedRes = await upya.dataClient.post('/data/forms/signedUrls', { 
            listOfIds: [answerId] 
        });
        console.log('Response:', JSON.stringify(signedRes.data, null, 2));
    } catch (e) {
        console.log(`Failed: ${e.response?.data || e.message}`);
    }

    // Attempt 2: Using the questionId/reportNumber path
    const questionId = '69383112ccc44400123ffa37';
    const reportNumber = '1778339044786';
    const path = `Bantos/Webapp/Data/${questionId}/${reportNumber}`;
    console.log(`Trying with path: ${path}`);
    try {
        const signedRes = await upya.dataClient.post('/data/forms/signedUrls', { 
            listOfIds: [path] 
        });
        console.log('Response:', JSON.stringify(signedRes.data, null, 2));
    } catch (e) {
        console.log(`Failed: ${e.response?.data || e.message}`);
    }
}

fetchSignature();
