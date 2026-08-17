import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const clientKey = process.env.DYNAMICORE_CLIENT_KEY;
const secretHash = process.env.DYNAMICORE_SECRET_HASH;

async function signAndRequest(fullUrl, method, body = '') {
    const timestamp = Date.now().toString();
    const secretKey = crypto.createHash('sha512').update(secretHash).digest('hex');
    
    // Extraer path del URL (todo lo que va después del host)
    const urlObj = new URL(fullUrl);
    const path = urlObj.pathname;
    const query = urlObj.search ? urlObj.search.substring(1) : '';

    const requestData = timestamp + method.toUpperCase() + path + query + body;
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
        return { success: false, status: e.response?.status, data: e.response?.data };
    }
}

async function runTests() {
    const testPath = '/marketplace/apps/belvo/customers';
    
    console.log("--- TEST A: https://api.dynamicore.io" + testPath + " ---");
    console.log(await signAndRequest("https://api.dynamicore.io" + testPath, 'GET'));

    console.log("\n--- TEST B: https://api.dynamicore.io/private" + testPath + " ---");
    console.log(await signAndRequest("https://api.dynamicore.io/private" + testPath, 'GET'));
}

runTests();
