import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const clientKey = process.env.DYNAMICORE_CLIENT_KEY;
const secretHash = process.env.DYNAMICORE_SECRET_HASH;

async function signAndRequest(fullUrl, method, body = '') {
    const timestamp = Date.now().toString();
    const secretKey = crypto.createHash('sha512').update(secretHash).digest('hex');
    const urlObj = new URL(fullUrl);
    
    // Aquí está el truco: el path DEBE incluir el prefijo si está en el URL
    const path = urlObj.pathname; 
    const query = urlObj.search ? urlObj.search.substring(1) : '';

    const bodyStr = body ? (typeof body === 'object' ? JSON.stringify(body) : JSON.stringify(JSON.parse(body))) : '';
    const requestData = timestamp + method.toUpperCase() + path + query + bodyStr;
    
    const hmacDigest = crypto.createHmac('sha256', secretKey).update(requestData).digest('hex');
    const authHeader = `DynamiCore ${clientKey}:${timestamp}:${hmacDigest}`;

    try {
        const config = {
            method,
            url: fullUrl,
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        };
        if (body) config.data = body;
        const res = await axios(config);
        return { success: true, data: res.data };
    } catch (e) {
        return { success: false, status: e.response?.status, data: e.response?.data, pathUsed: path };
    }
}

async function runTests() {
    // Estructura del PDF: status, pii.name, pii.phone, pii.email, client_type
    const payload = {
        "status": "Active",
        "client_type": 17,
        "pii": {
            "firstname": "Carlos",
            "lastname": "Garcia",
            "name": "Carlos Garcia PDF",
            "phone": "+525512345678",
            "email": `carlos_int_${Date.now()}@test.com`,
            "rfc": "XAXX010101000"
        }
    };
    
    console.log("--- TEST FIX SIGNATURE + PDF STRUCTURE ---");
    // Probamos con /private/clients que es lo que dice el PDF
    const result = await signAndRequest("https://api.dynamicore.io/private/clients", 'POST', payload);
    console.log(JSON.stringify(result, null, 2));
}

runTests();
