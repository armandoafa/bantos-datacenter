const axios = require('axios');
(async () => {
  const upya = axios.create({
    baseURL: 'https://api.upya.io/api/v1',
    auth: { username: 'armando.bantoshub', password: '123456!' }
  });
  
  try {
    const res = await upya.post('/data/search/agents', { query: {}, limit: 1 });
    const agent = res.data.length ? res.data[0] : (res.data.data ? res.data.data[0] : res.data.results[0]);
    console.log(JSON.stringify(agent, null, 2));
  } catch (e) {
    console.log('Error:', e.message);
  }
})();
