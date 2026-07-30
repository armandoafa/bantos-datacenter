import axios from 'axios';
import DeviceEndpoints from './endpoints/device.js';
import ServiceEndpoints from './endpoints/service.js';
import QueryEndpoints from './endpoints/query.js';

export class TrustonicClient {
  constructor(apiKey, tenantId = null) {
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    this.baseURL = 'https://api.cloud.trustonic.com/api/v2';
    this.token = null;

    // Inicializar axios default
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Módulos
    this.device = new DeviceEndpoints(this);
    this.service = new ServiceEndpoints(this);
    this.query = new QueryEndpoints(this);
  }

  async authorize() {
    if (!this.apiKey) throw new Error('Trustonic API Key is required');
    try {
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey
      };
      if (this.tenantId) {
        headers['tenantId'] = this.tenantId;
      }
      const response = await axios.post(`${this.baseURL}/authorization/token`, {}, { headers });
      this.token = response.data.token;
      
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      if (this.tenantId) {
        this.client.defaults.headers.common['tenantId'] = this.tenantId;
      }
      return this.token;
    } catch (error) {
      this._handleError(error, 'Authorization');
    }
  }

  async ensureAuthorized() {
    if (!this.token) {
      await this.authorize();
    }
  }

  // Wrapper para manejar peticiones de forma estandarizada
  async request(config) {
    await this.ensureAuthorized();
    
    // Inject tenantId if available and the endpoint doesn't already have it
    if (this.tenantId && config.data && !config.data.tenantId) {
       // Only inject if it's not explicitly omitted or it's a specific endpoint that needs it
       // Trustonic typically requires tenantId in some calls, but we let endpoints pass it if needed
    }

    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      // Si el error es 401 Unauthorized, el token expiró. Intentar renovar 1 vez.
      if (error.response && error.response.status === 401 && !config._retry) {
        config._retry = true;
        await this.authorize();
        return this.client(config).then(res => res.data).catch(err => this._handleError(err, config.url));
      }
      this._handleError(error, config.url);
    }
  }

  _handleError(error, context) {
    if (error.response) {
      const errData = error.response.data;
      throw new Error(`Trustonic API Error [${context}] (${error.response.status}): ${errData.message || JSON.stringify(errData)}`);
    } else if (error.request) {
      throw new Error(`Trustonic API No Response [${context}]: ${error.message}`);
    } else {
      throw new Error(`Trustonic API Request Error [${context}]: ${error.message}`);
    }
  }
}
