import axios from 'axios';
import AuthorizationEndpoints from './endpoints/authorization.js';
import InventoryEndpoints from './endpoints/inventory.js';
import ServiceEndpoints from './endpoints/service.js';
import DeviceEndpoints from './endpoints/device.js';
import QueryEndpoints from './endpoints/query.js';
import UserEndpoints from './endpoints/user.js';
import WebhookEndpoints from './endpoints/webhook.js';
import ContractEndpoints from './endpoints/contract.js';
import WorkflowEndpoints from './endpoints/workflow.js';

/**
 * Cliente para Trustonic Telecom Platform API v2
 * (especificación "Telecoms Platform API v2", versión 2.3, 16-oct-2026).
 *
 * - Base URL: {baseURL}/api/v2
 * - Autenticación: header `apiKey` → token Bearer con `expireTime`.
 * - Tenant: header `tenantId` por petición (si se omite, Trustonic usa el tenant por defecto del usuario).
 * - Rate limit: 100 llamadas/minuto por token → reintento automático ante 429.
 * - Lotes: listas de más de 100 elementos se procesan de forma asíncrona y regresan `batchActionId`.
 */

export const SUCCESS_CODE = 'REQUEST_SUCCESS';
const DEFAULT_BASE_URL = 'https://api.cloud.trustonic.com';
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
const MAX_RATE_LIMIT_RETRIES = 3;

export class TrustonicError extends Error {
  constructor(message, { status = null, resultCode = null, resultMessage = null, context = null, data = null } = {}) {
    super(message);
    this.name = 'TrustonicError';
    this.status = status;
    this.resultCode = resultCode;
    this.resultMessage = resultMessage;
    this.context = context;
    this.data = data;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class TrustonicClient {
  /**
   * @param {String} apiKey - API-Key del usuario en Telecoms Platform
   * @param {String|null} tenantId - Tenant por defecto para las peticiones (opcional)
   * @param {Object} options - { baseURL, timeout, maxRateLimitRetries }
   */
  constructor(apiKey, tenantId = null, options = {}) {
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    const root = (options.baseURL || DEFAULT_BASE_URL).replace(/\/+$/, '').replace(/\/api\/v\d+$/, '');
    this.baseURL = `${root}/api/v2`;
    this.maxRateLimitRetries = options.maxRateLimitRetries ?? MAX_RATE_LIMIT_RETRIES;

    this.token = null;
    this.tokenExpiresAt = 0;
    this._authPromise = null;

    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: options.timeout ?? 60000,
      headers: { 'Content-Type': 'application/json' }
    });

    this.authorization = new AuthorizationEndpoints(this);
    this.inventory = new InventoryEndpoints(this);
    this.service = new ServiceEndpoints(this);
    this.device = new DeviceEndpoints(this);
    this.query = new QueryEndpoints(this);
    this.user = new UserEndpoints(this);
    this.webhook = new WebhookEndpoints(this);
    this.contract = new ContractEndpoints(this);
    this.workflow = new WorkflowEndpoints(this);
  }

  // ── Autenticación (1.1) ──────────────────────────────────────────────────

  /** Obtiene un token nuevo. POST api/v2/authorization/token */
  async authorize() {
    if (!this.apiKey) throw new TrustonicError('Trustonic API Key is required (TRUSTONIC_API_KEY)', { context: 'authorization' });
    if (this._authPromise) return this._authPromise;

    this._authPromise = (async () => {
      try {
        const res = await this.http.post('/authorization/token', {}, { headers: { apiKey: this.apiKey } });
        const { token, expireTime } = res.data || {};
        if (!token) throw new TrustonicError('Trustonic authorization response did not include a token', { context: 'authorization', data: res.data });
        this.token = token;
        const exp = expireTime ? Date.parse(expireTime) : NaN;
        // Si no viene expireTime válido, asumimos 50 minutos.
        this.tokenExpiresAt = Number.isFinite(exp) ? exp : Date.now() + 50 * 60 * 1000;
        return token;
      } catch (error) {
        throw this._toError(error, 'authorization');
      } finally {
        this._authPromise = null;
      }
    })();
    return this._authPromise;
  }

  async ensureAuthorized() {
    if (!this.token || Date.now() >= this.tokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
      await this.authorize();
    }
  }

  // ── Petición genérica ────────────────────────────────────────────────────

  /**
   * @param {Object} config - { method, url, data, params, tenantId, headers }
   *   `tenantId` explícito tiene prioridad; `null` lo omite; `undefined` usa el del constructor.
   */
  async request(config) {
    const { tenantId, ...axiosConfig } = config;
    const effectiveTenant = tenantId === undefined ? this.tenantId : tenantId;

    let authRetried = false;
    let rateRetries = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.ensureAuthorized();
      const headers = { ...(axiosConfig.headers || {}), Authorization: `Bearer ${this.token}` };
      if (effectiveTenant) headers.tenantId = effectiveTenant;

      try {
        const res = await this.http.request({ ...axiosConfig, headers });
        return res.data;
      } catch (error) {
        const status = error.response?.status;
        const code = error.response?.data?.resultCode;

        if (status === 401 && !authRetried && code !== 'AUTHENTICATION_INVALID_APIKEY') {
          authRetried = true;
          this.token = null;
          continue;
        }
        if (status === 429 && rateRetries < this.maxRateLimitRetries) {
          rateRetries++;
          const retryAfter = Number(error.response.headers?.['retry-after']);
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 * 2 ** (rateRetries - 1);
          await sleep(waitMs);
          continue;
        }
        throw this._toError(error, `${(axiosConfig.method || 'GET').toUpperCase()} ${axiosConfig.url}`);
      }
    }
  }

  // ── Lotes asíncronos (> 100 elementos) ───────────────────────────────────

  /**
   * Si la respuesta trae batchActionId en curso, consulta GET /query/batchAction hasta que termine.
   * Devuelve la respuesta final (o la original si no era un lote asíncrono).
   */
  async waitForBatch(response, { tenantId, intervalMs = 5000, timeoutMs = 5 * 60 * 1000 } = {}) {
    if (!response?.batchActionId || response.batchActionStatus !== 'INPROGRESS') return response;
    const deadline = Date.now() + timeoutMs;
    let last = response;
    while (Date.now() < deadline) {
      await sleep(intervalMs);
      last = await this.query.batchActionStatus(response.batchActionId, { tenantId });
      if (last?.batchActionStatus && last.batchActionStatus !== 'INPROGRESS') return last;
    }
    return last;
  }

  // ── Utilidades de resultados por dispositivo ─────────────────────────────

  /** Encuentra la lista de resultados por dispositivo en una respuesta (…ResponseList, deviceList, etc.). */
  static deviceResults(response) {
    if (!response || typeof response !== 'object') return [];
    for (const value of Object.values(response)) {
      if (Array.isArray(value) && value.length && typeof value[0] === 'object' && value[0] && 'deviceUid' in value[0]) {
        return value;
      }
    }
    return [];
  }

  /**
   * Lanza TrustonicError si el resultado del dispositivo (o el de la respuesta) no es REQUEST_SUCCESS.
   * Devuelve el resultado del dispositivo si existe.
   */
  static assertSuccess(response, deviceUid = null, context = null) {
    const results = TrustonicClient.deviceResults(response);
    const item = deviceUid ? results.find((r) => String(r.deviceUid) === String(deviceUid)) : results[0];
    // En Service Management el resultado viene por servicio: deviceList[].serviceList[].resultCode
    const failedService = Array.isArray(item?.serviceList)
      ? item.serviceList.find((s) => s && s.resultCode && s.resultCode !== SUCCESS_CODE)
      : null;
    const target = failedService || item || response || {};
    const code = target.resultCode;
    if (code && code !== SUCCESS_CODE) {
      throw new TrustonicError(`Trustonic [${context || 'request'}] ${code}: ${target.resultMessage || ''}`.trim(), {
        resultCode: code, resultMessage: target.resultMessage, context, data: response
      });
    }
    return item || null;
  }

  _toError(error, context) {
    if (error instanceof TrustonicError) return error;
    if (error.response) {
      const data = error.response.data || {};
      const resultCode = data.resultCode || null;
      const resultMessage = data.resultMessage || data.message || null;
      const detail = resultCode ? `${resultCode}: ${resultMessage || ''}` : (resultMessage || JSON.stringify(data));
      return new TrustonicError(`Trustonic API Error [${context}] (${error.response.status}) ${detail}`.trim(), {
        status: error.response.status, resultCode, resultMessage, context, data
      });
    }
    if (error.request) {
      return new TrustonicError(`Trustonic API No Response [${context}]: ${error.message}`, { context });
    }
    return new TrustonicError(`Trustonic API Request Error [${context}]: ${error.message}`, { context });
  }
}
