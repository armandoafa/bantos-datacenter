const axios = require('axios');
(async () => {
  const targetTenant = 'c-romel';
  const dataClient = axios.create({
    baseURL: 'https://data.upya.io/api/v1',
    headers: { 'Content-Type': 'application/json', 'tenant': targetTenant }
  });
  
  const apiClient = axios.create({
    baseURL: 'https://api.upya.io/api/v1',
    headers: { 'Content-Type': 'application/json', 'tenant': targetTenant }
  });
  
  try {
    const tokenRes = await dataClient.post('/auth/token', {
      username: 'armando.bantoshub',
      password: '123456!'
    });
    const token = tokenRes.data.token;
    console.log('✅ Token acquired');
    
    dataClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const collections = ['countries', 'organisations', 'branches', 'shops', 'agents'];
    for (const c of collections) {
      try {
        const res = await dataClient.post(`/data/search/${c}`, { query: {}, limit: 10, skip: 0 });
        console.log(`✅ dataClient /data/search/${c} ->`, res.data.length || res.data?.data?.length || res.data?.results?.length || 0, 'items');
      } catch (e) {
        console.log(`❌ dataClient /data/search/${c} -> Error:`, e.response?.status || e.message);
      }
      
      try {
        const res = await apiClient.get(`/${c}`);
        console.log(`✅ apiClient /${c} ->`, res.data.length || res.data?.data?.length || res.data?.results?.length || 0, 'items');
      } catch (e) {
        console.log(`❌ apiClient /${c} -> Error:`, e.response?.status || e.message);
      }
    }
  } catch(e) {
     console.log('❌ Auth failed:', e.message, e.response?.data);
  }
})();
