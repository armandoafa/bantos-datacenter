import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.UPYA_USER || 'armando.bantoshub';
const password = process.env.UPYA_PASS || '123456!';

async function inspectForms() {
    const upya = new UpyaManageClient(username, password);
    const formId = '69ff4ce4dfdd3600127f1efc'; 

    console.log(`Searching for form ID: ${formId}`);
    try {
        const formsRes = await upya.dataClient.post('/data/search/forms', { 
            query: { _id: formId }, 
            limit: 1 
        });
        if (formsRes.data.length > 0) {
            console.log('Form Data:', JSON.stringify(formsRes.data[0], null, 2));
        } else {
            console.log('Form not found');
        }
    } catch (e) {
        console.error('Error fetching form:', e.message);
    }
}

inspectForms();
