async function testApiCloud() {
    const url = 'https://api.cloud.trustonic.com/api/v1/authorization/token';
    const apiKey = '/duzcO1Yu2rZxTHGDgeGn1P2aH+X9m7NxDluBz43Gg9CzqfCjvso9Lb+q4cypw9jB1i0DEPvFQeFj1mzNWRP7g==';

    const scenarios = [
        { name: 'X-API-Key Header', headers: { 'X-API-Key': apiKey }, body: {} },
        { name: 'apikey Header', headers: { 'apikey': apiKey }, body: {} },
        { name: 'apiKey in Body', headers: {}, body: { apiKey: apiKey } },
        { name: 'key in Body', headers: {}, body: { key: apiKey } }
    ];

    for (const s of scenarios) {
        console.log(`Scenario: ${s.name}`);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...s.headers
                },
                body: JSON.stringify(s.body)
            });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            console.log(`Response: ${text}`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        console.log('---');
    }
}

testApiCloud();
