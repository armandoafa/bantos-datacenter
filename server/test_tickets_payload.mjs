import axios from 'axios';

const username = 'armando.afa';
const password = '123456!';
const auth = { username, password };

async function test() {
  try {
    const payload = {
      query: { status: "Active" },
      userId: "699769844fcc170012801ec3",
      limit: 100
    };
    
    // Test public API data endpoints with the userId payload
    const collections = ['tickets', 'actions', 'tasks'];
    for (const coll of collections) {
      console.log(`Testing /data/search/${coll}`);
      const res = await axios.post(`https://api.upya.io/data/search/${coll}`, payload, { auth });
      const data = res.data;
      const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
      console.log(`Found ${count} items`);
    }

  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data);
  }
}

test();
