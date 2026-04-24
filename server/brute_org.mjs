import axios from 'axios';

const username = 'armando.afa';
const password = '123456!';
const auth = { username, password };

const collections = [
  'countries', 'country', 'organisations', 'organisation', 'organizations', 'organization', 
  'branches', 'branch', 'shops', 'shop', 'locations', 'location', 'entities', 'entity'
];

const hosts = ['https://api.upya.io', 'https://data.upya.io'];

async function test() {
  for (const host of hosts) {
    console.log(`--- Testing Host: ${host} ---`);
    for (const coll of collections) {
      try {
        const res = await axios.post(`${host}/data/search/${coll}`, { query: {}, limit: 5 }, { auth });
        const data = res.data;
        const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
        if (count > 0) console.log(`[${coll}]: Found ${count} items`);
      } catch (e) {
        // console.log(`[${coll}]: Error ${e.response?.status || e.message}`);
      }
    }
  }
}

test();
