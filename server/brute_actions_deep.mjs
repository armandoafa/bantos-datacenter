import axios from 'axios';

const username = 'armando.afa';
const password = '123456!';
const auth = { username, password };

const endpoints = [
  { method: 'post', url: '/data/search/actions', data: { query: {}, limit: 100 } },
  { method: 'post', url: '/data/search/tasks', data: { query: {}, limit: 100 } },
  { method: 'post', url: '/data/search/tickets', data: { query: {}, limit: 100 } },
  { method: 'post', url: '/data/search/events', data: { query: {}, limit: 100 } },
  { method: 'get', url: '/api/v1/actions' },
  { method: 'get', url: '/v1/actions' },
  { method: 'get', url: '/actions' }
];

const hosts = ['https://api.upya.io', 'https://data.upya.io'];

async function test() {
  for (const host of hosts) {
    console.log(`--- Testing Host: ${host} ---`);
    for (const ep of endpoints) {
      try {
        let res;
        if (ep.method === 'post') {
          res = await axios.post(`${host}${ep.url}`, ep.data, { auth });
        } else {
          res = await axios.get(`${host}${ep.url}`, { auth });
        }
        
        const data = res.data;
        const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
        console.log(`[${ep.method.toUpperCase()} ${ep.url}]: Success. Found ${count} items. Data sample:`, count > 0 ? JSON.stringify(Array.isArray(data) ? data[0] : data.data[0]).slice(0, 100) : 'none');
      } catch (e) {
        // console.log(`[${ep.method.toUpperCase()} ${ep.url}]: Error ${e.response?.status}`);
      }
    }
  }
}

test();
