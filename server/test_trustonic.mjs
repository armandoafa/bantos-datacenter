import { scrapeTrustonic } from './src/services/trustonic.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const username = 'itdevelopment';
    const password = 'Alika2012.';
    const domain = 'bantos-msp';
    
    try {
        console.log('Testing Trustonic Scraping...');
        const devices = await scrapeTrustonic(username, password, domain);
        console.log('Devices found:', devices.length);
        console.log('Sample device:', JSON.stringify(devices[0], null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
