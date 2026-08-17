
async function getTrustonicToken() {
    const url = 'https://portal.cloud.trustonic.com/api/v1/authorization/token';
    const apiKey = '/duzcO1Yu2rZxTHGDgeGn1P2aH+X9m7NxDluBz43Gg9CzqfCjvso9Lb+q4cypw9jB1i0DEPvFQeFj1mzNWRP7g==';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({}) // Usually token requests might need some body or just headers
        });
        
        const data = await response.json();
        console.log('Token Response:', JSON.stringify(data, null, 2));
        return data.token || data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error);
    }
}

getTrustonicToken();
