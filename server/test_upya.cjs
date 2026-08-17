const axios = require('axios');
(async () => {
  const upya = axios.create({
    baseURL: 'https://api.upya.io/api/v1',
    auth: { username: 'armando.bantoshub', password: '123456!' }
  });
  const upyaData = axios.create({
    baseURL: 'https://data.upya.io/api/v1',
    auth: { username: 'armando.bantoshub', password: '123456!' }
  });

  const testEndpoints = [
    { client: upyaData, method: 'post', url: '/data/search/shops', data: { query: {}, limit: 10 } },
    { client: upya, method: 'get', url: '/shops' },
    { client: upya, method: 'get', url: '/settings/shops' },
    { client: upyaData, method: 'post', url: '/data/search/branches', data: { query: {}, limit: 10 } },
    { client: upya, method: 'get', url: '/branches' },
  ];

  for (const t of testEndpoints) {
    try {
      const res = await t.client[t.method](t.url, t.data || {});
      console.log(`✅ Success for ${t.method.toUpperCase()} ${t.url}:`, res.data.length || res.data?.data?.length || res.data?.results?.length || 'Some data');
    } catch (e) {
      console.log(`❌ Failed for ${t.method.toUpperCase()} ${t.url}:`, e.response?.status);
    }
  }
})();
