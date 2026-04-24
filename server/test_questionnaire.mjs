import axios from 'axios';

const username = 'armando.afa';
const password = '123456!';
const auth = { username, password };

async function test() {
  try {
    const res = await axios.post(`https://api.upya.io/data/search/questionnaires`, {
      query: { _id: "69b0266ffc4ced0012e66083" }
    }, { auth });
    
    console.log(JSON.stringify(res.data[0]?.pages || res.data.data?.[0]?.pages || res.data[0]?.elements || res.data, null, 2));
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data);
  }
}

test();
