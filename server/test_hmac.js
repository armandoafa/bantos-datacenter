import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const clientKey = process.env.DYNAMICORE_CLIENT_KEY;
const secretHash = process.env.DYNAMICORE_SECRET_HASH;
const baseUrl = 'https://api.dynamicore.io';

async function signAndRequest(path, method, body = '', useSHA512 = true) {
    const timestamp = Date.now().toString();
    const secretKey = useSHA512 
        ? crypto.createHash('sha512').update(secretHash).digest('hex')
        : secretHash;
    
    const requestData = timestamp + method + path + '' + body;
    const hmacDigest = crypto.createHmac('sha256', secretKey).update(requestData).digest('hex');
    const authHeader = `DynamiCore ${clientKey}:${timestamp}:${hmacDigest}`;

    try {
        const config = {
            method,
            url: baseUrl + path,
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
    console.log("--- TEST 1: Path Belvo with SHA512 ---");
    console.log(await signAndRequest('/marketplace/apps/belvo/customers', 'GET', '', true));

    console.log("\n--- TEST 2: Path Belvo WITHOUT SHA512 ---");
    console.log(await signAndRequest('/marketplace/apps/belvo/customers', 'GET', '', false));
}

runTests();
