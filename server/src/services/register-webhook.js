import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const baseUrl = process.env.DYNAMICORE_BASE_URL || 'https://api.dynamicore.io';
const clientKey = process.env.DYNAMICORE_CLIENT_KEY;
const secretKey = process.env.DYNAMICORE_SECRET_HASH;
const authType = process.env.DYNAMICORE_AUTH_TYPE || 'DynamiCardPay';

function generateAuthHeader(method, urlPath, body, queryStr = '') {
    const timestamp = Date.now().toString();
    const secretKeyHex = crypto.createHash('sha512').update(secretKey).digest('hex');
    const bodyStr = body ? JSON.stringify(body) : '';
    const requestData = timestamp + method.toUpperCase() + urlPath + queryStr + bodyStr;
    const hmac = crypto.createHmac('sha256', secretKeyHex);
    hmac.update(requestData);
    const digest = hmac.digest('hex');
    return `${authType} ${clientKey}:${timestamp}:${digest}`;
}

async function main() {
    const payload = {
        name: 'Bantos Global Webhook',
        config: {
            url: 'https://bantos.cloud/datacenter-api/api/webhooks/dynamicore',
            params: [
                { key: "Content-Type", value: "application/json" }
            ]
        }
    };
    
    const urlPath = '/marketplace/apps/dynamicardpay/v2/tools/webhooks';
    const authHeader = generateAuthHeader('POST', urlPath, payload);
    
    try {
        console.log('Registrando webhook en Dynamicore...');
        const response = await axios({
            method: 'POST',
            url: `${baseUrl}${urlPath}`,
            headers: { 
                'Authorization': authHeader, 
                'Content-Type': 'application/json' 
            },
            data: payload
        });
        console.log('Webhook registrado con éxito:', response.data);
    } catch (e) {
        console.error('Error al registrar webhook:', e.response?.data || e.message);
    }
}

main();
