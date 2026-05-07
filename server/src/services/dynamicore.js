import axios from 'axios';
import crypto from 'crypto';

class BantosGatewayService {
    constructor() {
        this.baseUrl = 'https://api.dynamicore.io/private'; 
    }

    get config() {
        return {
            clientKey: process.env.DYNAMICORE_CLIENT_KEY,
            secret: process.env.DYNAMICORE_SECRET_HASH,
            authType: process.env.DYNAMICORE_AUTH_TYPE || 'DynamiCore'
        };
    }

    generateAuthHeader(method, path, body = '', query = '') {
        const { clientKey, secret, authType } = this.config;
        const timestamp = Date.now().toString();
        
        const secretKey = crypto.createHash('sha512').update(secret).digest('hex');
        
        let bodyStr = '';
        if (body && method !== 'GET') {
            bodyStr = typeof body === 'object' ? JSON.stringify(body) : JSON.stringify(JSON.parse(body));
        }

        const requestData = timestamp + method.toUpperCase() + path + query + bodyStr;
        
        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(requestData);
        const digest = hmac.digest('hex');

        return `${authType} ${clientKey}:${timestamp}:${digest}`;
    }

    async request(method, path, data = null, params = {}) {
        const queryString = Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
        const authHeader = this.generateAuthHeader(method, path, data, queryString);
        try {
            const config = {
                method,
                url: `${this.baseUrl}${path}${queryString}`,
                headers: { 
                    'Authorization': authHeader, 
                    'Content-Type': 'application/json' 
                }
            };
            if (data && method !== 'GET') config.data = data;

            console.log(`>>> [Gateway Request] ${method} ${path}`, JSON.stringify(data));
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`[Gateway Error] ${method} ${path}:`, error.response?.data || error.message);
            if (error.response?.data) console.error('Full Error Response:', JSON.stringify(error.response.data));
            throw error;
        }
    }

    // --- DYNAMICORE (Wallets) ---
    async createClient(clientData) {
        const nameParts = (clientData.name || '').split(' ');
        const firstname = nameParts[0] || 'Cliente';
        const lastname = nameParts.slice(1).join(' ') || 'Bantos';
        
        const payload = {
            client_type: "17",
            status: "Active",
            pii: {
                firstname: firstname,
                lastname: lastname,
                name: clientData.name || `${firstname} ${lastname}`,
                rfc: "XAXX010101000",
                email: clientData.email || `bantos_test_${Date.now()}@example.com`,
                phone: "+525500000000"
            }
        };
        // Path corregido segun descubrimiento (marketplace/apps)
        return this.request('POST', '/marketplace/apps/dynamicore/clients', payload);
    }

    async createAccount(clientId, product = 'STP_WALLET') {
        const payload = { product, client: clientId, currency: 'MXN', enabled: true };
        return this.request('POST', '/marketplace/apps/dynamicore/accounts', payload);
    }

    async getAccount(accountId) {
        return this.request('GET', `/marketplace/apps/dynamicore/accounts/${accountId}`);
    }

    // --- CONEKTA (Payments) ---
    async createConektaSpeiPayment(orderData) {
        const payload = {
            currency: orderData.currency || "MXN",
            line_items: [{ name: orderData.description || "Pago Bantos", unit_price: Math.round((orderData.amount || 0) * 100), quantity: 1 }],
            customer_info: { name: orderData.customerName, email: orderData.customerEmail, phone: orderData.customerPhone || "+525500000000" }
        };
        // Path corregido segun descubrimiento (marketplace/apps)
        return this.request('POST', '/marketplace/apps/conekta/payments/spei', payload);
    }
}

export default new BantosGatewayService();
