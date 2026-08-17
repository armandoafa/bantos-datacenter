const axios = require('axios');
(async () => {
  const upya = axios.create({
    baseURL: 'https://api.upya.io/api/v1',
    auth: { username: 'armando.bantoshub', password: '123456!' }
  });
  const testEndpoints = [
    '/data/search/countries',
    '/data/search/organisations',
    '/countries',
    '/organisations',
    '/agents'
  ];

  for (const url of testEndpoints) {
    try {
      const res = await upya.get(url);
      console.log(`✅ GET ${url} ->`, res.status);
    } catch (e) {
      console.log(`❌ GET ${url} ->`, e.response?.status);
    }
  }
})();
