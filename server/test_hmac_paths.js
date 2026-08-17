import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const clientKey = process.env.DYNAMICORE_CLIENT_KEY;
const secretHash = process.env.DYNAMICORE_SECRET_HASH;

async function signAndRequest(fullUrl, method, hmacPath, body = '') {
    const timestamp = Date.now().toString();
    const secretKey = crypto.createHash('sha512').update(secretHash).digest('hex');
    
    const requestData = timestamp + method.toUpperCase() + hmacPath + '' + body;
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
    const payload = JSON.stringify({
        status: "Active",
        pii: { name: "Carlos Garcia", phone: "+525500000000", email: `carlos_${Date.now()}@test.com` },
        client_type: "17"
    });

    const realUrl = "https://api.dynamicore.io/private/marketplace/apps/dynamicore/clients";

    console.log("--- TEST A: URL con /private, Firma CON /private ---");
    console.log(await signAndRequest(realUrl, 'POST', "/private/marketplace/apps/dynamicore/clients", payload));

    console.log("\n--- TEST B: URL con /private, Firma SIN /private ---");
    console.log(await signAndRequest(realUrl, 'POST', "/marketplace/apps/dynamicore/clients", payload));
}

runTests();
