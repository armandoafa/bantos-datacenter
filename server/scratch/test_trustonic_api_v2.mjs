async function getTrustonicToken() {
    const url = 'https://portal.cloud.trustonic.com/api/v1/authorization/token';
    const apiKey = '/duzcO1Yu2rZxTHGDgeGn1P2aH+X9m7NxDluBz43Gg9CzqfCjvso9Lb+q4cypw9jB1i0DEPvFQeFj1mzNWRP7g==';
    
    const headersToTry = [
        { 'X-API-Key': apiKey },
        { 'Authorization': `Api-Key ${apiKey}` },
        { 'apikey': apiKey },
        { 'x-api-key': apiKey },
        { 'Authorization': `Bearer ${apiKey}` }
    ];

    for (const headers of headersToTry) {
        console.log(`Trying headers: ${JSON.stringify(headers)}`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify({})
            });
            
            const text = await response.text();
            console.log(`Status: ${response.status}`);
            try {
                const data = JSON.parse(text);
                console.log('Response JSON:', JSON.stringify(data, null, 2));
                if (data.token || data.access_token) {
                    console.log('SUCCESS!');
                    return;
                }
            } catch (e) {
                console.log('Response Text (first 100 chars):', text.substring(0, 100));
            }
        } catch (error) {
            console.error('Fetch error:', error.message);
        }
        console.log('---');
    }
}

getTrustonicToken();
