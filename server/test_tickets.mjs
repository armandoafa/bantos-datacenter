import axios from 'axios';

const username = 'armando.afa';
const password = '123456!';
const auth = { username, password };

async function test() {
  try {
    const res = await axios.post('https://api.upya.io/api/tickets/search/', { query: {} }, { auth });
    console.log('Result:', JSON.stringify(res.data).slice(0, 500));
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data);
  }
}

test();
