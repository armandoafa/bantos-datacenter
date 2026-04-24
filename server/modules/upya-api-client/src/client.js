import axios from 'axios';

class UpyaClient {
  constructor(username, password) {
    this.auth = {
      username,
      password,
    };

    const baseUrl = process.env.UPYA_BASE_URL || 'https://api.upya.io';
    const dataUrl = baseUrl.replace('api.', 'data.');
    const tokenUrl = baseUrl.replace('api.', 'tokenmgmt.api.');

    this.apiClient = axios.create({
      baseURL: baseUrl,
      auth: this.auth,
    });

    this.dataClient = axios.create({
      baseURL: dataUrl,
      auth: this.auth,
    });

    this.tokenMgmtClient = axios.create({
      baseURL: tokenUrl + '/api',
      auth: this.auth,
    });
  }

  // Helper to handle search/count which often use the api.upya.io URL
  async search(collection, query = {}, options = {}) {
    const response = await this.apiClient.post(`/data/search/${collection}`, {
      query,
      ...options,
    });
    return response.data;
  }

  async count(collection, query = {}) {
    const response = await this.apiClient.post(`/data/count/${collection}`, {
      query,
    });
    return response.data;
  }
}

export default UpyaClient;
