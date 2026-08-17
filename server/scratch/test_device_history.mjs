async function testDeviceHistory() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJjLXJvbWVsIiwidXNlcl9pZCI6MTY1OSwiZXhwIjoxNzc4ODkwNjEzfQ.mAPcEEmlzVenfWTkb6NhxYj8mSgHUaLWk0JKhjL4MkA';
    const imei = '352433395701870';
    const baseUrl = 'https://api.cloud.trustonic.com/api/v1';

    const urls = [
        `${baseUrl}/devices/${imei}/history`,
        `${baseUrl}/smartphones/${imei}/history`,
        `${baseUrl}/devices/${imei}/events`,
        `${baseUrl}/smartphones/${imei}/events`,
        `${baseUrl}/audit-logs?imei=${imei}`
    ];

    for (const url of urls) {
        console.log(`Testing URL: ${url}`);
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                const text = await res.text();
                console.log('Response:', text);
                return;
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

testDeviceHistory();
