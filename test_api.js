const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('https://bantos.cloud/datacenter-api/backoffice/settings/smtp', {
      tenantId: 'c-romel',
      whitelabel_name: 'My Custom Tenant',
      whitelabel_logo: 'https://example.com/logo.png',
      smtp_host: 'test'
    });
    console.log("POST Success");
    
    const res2 = await axios.get('https://bantos.cloud/datacenter-api/backoffice/settings/smtp?tenantId=c-romel');
    console.log("GET Result:", res2.data);
  } catch (e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
}
test();
