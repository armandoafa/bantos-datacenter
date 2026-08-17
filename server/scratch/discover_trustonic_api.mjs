async function discoverEndpoints() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjLXJvbWVsIiwidXNlcl9pZCI6MTY1OSwiZXhwIjoxNzc4ODkwNjEzfQ.mAPcEEmlzVenfWTkb6NhxYj8mSgHUaLWk0JKhjL4MkA';
    const baseUrl = 'https://api.cloud.trustonic.com/api/v1';

    const endpoints = [
        '/smartphones',
        '/devices',
        '/history',
        '/events',
        '/logs',
        '/audit',
        '/smartphone/history',
        '/device/history'
    ];

    for (const ep of endpoints) {
        console.log(`Testing Endpoint: ${ep}`);
        try {
            const res = await fetch(`${baseUrl}${ep}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                const text = await res.text();
                console.log(`Response snippet: ${text.substring(0, 200)}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        console.log('---');
    }
}

discoverEndpoints();
