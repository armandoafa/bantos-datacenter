export const WEBHOOK_EVENTS = ['idle', 'readyForUse', 'enrolled', 'active', 'locked', 'released'];

/** 7. Webhook Notification API */
export default class WebhookEndpoints {
  constructor(client) {
    this.client = client;
  }

  /** 7.1 Create Subscription — POST api/v2/webhook/subscription */
  async create(eventType, url, { tenantId } = {}) {
    if (!WEBHOOK_EVENTS.includes(eventType)) throw new Error(`Trustonic: eventType debe ser uno de ${WEBHOOK_EVENTS.join(', ')}`);
    return this.client.request({ method: 'POST', url: '/webhook/subscription', data: { eventType, url }, tenantId });
  }

  /** 7.2 GET Subscription — GET api/v2/webhook/subscription?subscriptionId= */
  async get(subscriptionId, { tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/webhook/subscription', params: { subscriptionId }, tenantId });
  }

  /** 7.3 GET ALL Subscriptions — GET api/v2/webhook/subscriptions/ */
  async list({ tenantId } = {}) {
    return this.client.request({ method: 'GET', url: '/webhook/subscriptions/', tenantId });
  }

  /** 7.4 Delete Subscription — DELETE api/v2/webhook/subscription?subscriptionId= */
  async delete(subscriptionId, { tenantId } = {}) {
    return this.client.request({ method: 'DELETE', url: '/webhook/subscription', params: { subscriptionId }, tenantId });
  }
}
