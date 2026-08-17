import UpyaManageClient from './modules/upya-api-client/src/index.js';
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.UPYA_USER || 'armando.bantoshub';
const password = process.env.UPYA_PASS || '123456!';

async function inspectForms() {
    const upya = new UpyaManageClient(username, password);
    const clientId = '69ff4ce4dfdd3600127f1f0c'; 

    console.log(`Searching forms for client ID: ${clientId}`);
    try {
        const formsRes = await upya.dataClient.post('/data/search/forms', { 
            query: { clientId: clientId }, 
            limit: 50 
        });
        for (const form of formsRes.data) {
            console.log(`Form ID: ${form._id}, Name: ${form.questionnaire?.name}, Date: ${form.date}`);
            const signItem = form.creditItems?.find(i => i.code === 'Sign');
            if (signItem) {
                console.log('Found Sign Item in form:', form._id);
                console.log(JSON.stringify(signItem, null, 2));
            }
        }
    } catch (e) {
        console.error('Error fetching forms:', e.message);
    }
}

inspectForms();
