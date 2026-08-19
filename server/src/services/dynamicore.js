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

    generateAuthHeader(method, path, body = '', query = '', baseUrl = null) {
        const { clientKey, secret, authType } = this.config;
        const timestamp = Date.now().toString();
        
        const secretKey = crypto.createHash('sha512').update(secret).digest('hex');
        
        let bodyStr = '';
        if (body && method !== 'GET') {
            bodyStr = typeof body === 'object' ? JSON.stringify(body) : JSON.stringify(JSON.parse(body));
        }

        const effectiveBaseUrl = baseUrl || this.baseUrl;
        const urlObj = new URL(`${effectiveBaseUrl}${path}`);
        const fullPath = urlObj.pathname;
        const requestData = timestamp + method.toUpperCase() + fullPath + query + bodyStr;
        
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
            status: "Active",
            client_type: "17",
            pii: {
                firstname: firstname,
                lastname: lastname,
                name: clientData.name || `${firstname} ${lastname}`,
                email: clientData.email || `bantos_test_${Date.now()}@example.com`,
                phone: clientData.phone || "+525500000000",
                rfc: clientData.rfc || "XAXX010101000"
            }
        };
        // Cambiado a ruta directa segun Documentacion_Tecnica_Clientes_Wallet_CLABE.pdf
        return this.request('POST', '/clients', payload);
    }

    async createAccount(clientId, product = 2352) {
        const payload = { product, client: clientId, currency: '484', enabled: '1' };
        // Cambiado a ruta directa segun Documentacion_Tecnica_Clientes_Wallet_CLABE.pdf
        return this.request('POST', '/accounts', payload);
    }

    async getAccount(accountId) {
        // Cambiado a ruta directa segun Documentacion_Tecnica_Clientes_Wallet_CLABE.pdf
        return this.request('GET', `/accounts/${accountId}`);
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

    // --- DYNAMICARDPAY v2 (Cobro con tarjeta tokenizada via iFrame) ---
    // URL base diferente a la API privada: https://api.dynamicore.io/marketplace/apps/dynamicardpay/v2
    get cardPayBaseUrl() {
        return 'https://api.dynamicore.io/marketplace/apps/dynamicardpay/v2';
    }

    /**
     * Paso 1: Registrar cliente en DynamiCardPay
     * POST https://api.dynamicore.io/marketplace/apps/dynamicardpay/v2/customer/create
     * @param {object} customerData - { first_name, last_name, address_one, city, state, zipcode,
     *   email, country, date_of_birth (DD/MM), last4ssn, phone, username }
     * @returns {Promise} { status, message: { id (customer_id), first_name, last_name, email,
     *   phone, status, created_at, ... } }
     */
    async createCardPayCustomer(customerData) {
        const payload = {
            first_name:    customerData.first_name,
            last_name:     customerData.last_name,
            address_one:   customerData.address_one   || '',
            city:          customerData.city           || '',
            state:         customerData.state          || '',
            zipcode:       customerData.zipcode        || '',
            email:         customerData.email,
            country:       customerData.country        || 'Mexico',
            date_of_birth: customerData.date_of_birth  || '',
            last4ssn:      customerData.last4ssn        || '',
            phone:         customerData.phone,
            username:      customerData.username
        };
        return this.requestCardPay('POST', '/customer/create', payload);
    }

    async requestCardPay(method, path, data = null, params = {}) {
        const baseUrl = this.cardPayBaseUrl;
        const queryString = Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
        const authHeader = this.generateAuthHeader(method, path, data, queryString, baseUrl);
        try {
            const config = {
                method,
                url: `${baseUrl}${path}${queryString}`,
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            };
            if (data && method !== 'GET') config.data = data;
            console.log(`>>> [DynamiCardPay Request] ${method} ${config.url}`, JSON.stringify(data));
            const response = await axios(config);
            const resData = response.data;

            // Interceptar "falsos positivos" HTTP 200 que contienen errores en el JSON
            if (resData?.status === 'error' || resData?.message?.status === 'error' || resData?.data?.status === 'error') {
                const nestedMsg = resData?.message?.message?.message || resData?.message?.message || resData?.data?.message?.message || resData?.message || 'Error interno reportado por Dynamicore';
                const errString = typeof nestedMsg === 'string' ? nestedMsg : JSON.stringify(nestedMsg);
                throw new Error(errString);
            }

            return resData;
        } catch (error) {
            console.error(`[DynamiCardPay Error] ${method} ${baseUrl}${path}:`, error.response?.data || error.message);
            if (error.response?.data) console.error('Full Error Response:', JSON.stringify(error.response.data));
            throw error;
        }
    }

    /**
     * Paso 3: Asociar tarjeta tokenizada a un cliente
     * POST https://api.dynamicore.io/marketplace/apps/dynamicardpay/v2/card/assignToCustomer
     * @param {string} customerId - customer_id del cliente (message.id del Paso 1)
     * @param {string} tokenId - token_id generado por el iFrame (Paso 2)
     * @returns {Promise} { status, message: { id (payment_method), token, default, client, created_at } }
     */
    async assignCardToCustomer(customerId, tokenId) {
        const payload = {
            customer_id: customerId,
            token_id: tokenId
        };
        return this.requestCardPay('POST', '/card/assignToCustomer', payload);
    }

    /**
     * Paso 4: Ejecutar cargo
     * POST https://api.dynamicore.io/marketplace/apps/dynamicardpay/v2/transactions/ccTransaction
     * @param {Object} payload - { payment_method, customer_id, amount, sc, accept_url, cancel_url }
     * @returns {Promise} { status, message: { external_id, date, client, message, redirection_url } }
     */
    async directCharge(payload) {
        // En base a la arquitectura actual (donde el cliente se crea como app de marketplace),
        // este endpoint también DEBE usar el prefijo base del marketplace, al igual que los demás pasos.
        return this.requestCardPay('POST', '/transactions/ccTransaction', payload);
    }
}

export default new BantosGatewayService();
