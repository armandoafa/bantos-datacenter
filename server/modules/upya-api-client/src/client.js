import axios from 'axios';

class UpyaClient {
  constructor(username, password, tenantId = null) {
    this.auth = {
      username,
      password,
    };
    this.tenantId = tenantId;

    let baseUrl = process.env.UPYA_BASE_URL || 'https://api.upya.io';
    if (!baseUrl.includes('/api/v1')) {
      baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1';
    }
    const dataUrl = baseUrl.replace('api.', 'data.');
    const tokenUrl = baseUrl.replace('api.', 'tokenmgmt.api.');

    const headers = { 'Content-Type': 'application/json' };
    if (tenantId) {
      headers['tenant'] = tenantId;
    }

    this.apiClient = axios.create({
      baseURL: baseUrl,
      auth: this.auth,
      headers,
    });

    this.dataClient = axios.create({
      baseURL: dataUrl,
      auth: this.auth,
      headers,
    });

    this.tokenMgmtClient = axios.create({
      baseURL: tokenUrl + '/api',
      auth: this.auth,
      headers,
    });
  }

  async authenticate() {
    try {
      const response = await this.dataClient.post('/auth/token', {
        username: this.auth.username,
        password: this.auth.password,
      });
      const token = response.data?.token;
      if (token) {
        this.token = token;
        const authHeader = `Bearer ${token}`;
        this.apiClient.defaults.headers.common['Authorization'] = authHeader;
        this.dataClient.defaults.headers.common['Authorization'] = authHeader;
        this.tokenMgmtClient.defaults.headers.common['Authorization'] = authHeader;
        console.log(`[UpyaClient] Token auth successful for tenant: ${this.tenantId || 'none'}`);
        return true;
      }
    } catch (e) {
      console.warn(`[UpyaClient] Token auth failed: ${e.response?.status || e.message}. Falling back to Basic Auth.`);
    }
    return false;
  }

  // Helper to handle search/count which use the data.upya.io URL
  async search(collection, query = {}, options = {}) {
    const response = await this.dataClient.post(`/data/search/${collection}`, {
      query,
      ...options,
    });
    return response.data;
  }

  async count(collection, query = {}) {
    const response = await this.dataClient.post(`/data/count/${collection}`, {
      query,
    });
    return response.data;
  }
}

export default UpyaClient;
