/** 1. Authorization */
export default class AuthorizationEndpoints {
  constructor(client) {
    this.client = client;
  }

  /** 1.1 Get Access Token — POST api/v2/authorization/token */
  async getToken() {
    await this.client.authorize();
    return { token: this.client.token, expireTime: new Date(this.client.tokenExpiresAt).toISOString() };
  }
}
