async function testUrls() {
    const urls = [
        'https://portal.cloud.trustonic.com/api/v1/authorization/token',
        'https://api.cloud.trustonic.com/api/v1/authorization/token',
        'https://api.trustonic.com/api/v1/authorization/token',
        'https://cloud.trustonic.com/api/v1/authorization/token'
    ];
    const apiKey = '/duzcO1Yu2rZxTHGDgeGn1P2aH+X9m7NxDluBz43Gg9CzqfCjvso9Lb+q4cypw9jB1i0DEPvFQeFj1mzNWRP7g==';

    for (const url of urls) {
        console.log(`Testing URL: ${url}`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({})
            });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            if (res.status === 200 && !text.includes('<!DOCTYPE html>')) {
                console.log('SUCCESS on URL:', url);
                console.log('Response:', text);
                return;
            }
        } catch (e) {
            console.log(`Error on ${url}: ${e.message}`);
        }
    }
}

testUrls();
