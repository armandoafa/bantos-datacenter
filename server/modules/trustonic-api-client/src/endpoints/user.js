/** 6. User Management */
export default class UserEndpoints {
  constructor(client) {
    this.client = client;
  }

  /** 6.1 Add — POST api/v2/identity/users/add  ([{ username(email), firstName, lastName, userType, userRole, … }]) */
  async add(userList, { tenantId } = {}) {
    return this.client.request({ method: 'POST', url: '/identity/users/add', data: { userList }, tenantId });
  }

  /** 6.2 Deactivate — DELETE api/v2/identity/users/deactivate */
  async deactivate(usernames, { tenantId } = {}) {
    const userList = (Array.isArray(usernames) ? usernames : [usernames]).map((username) => ({ username }));
    return this.client.request({ method: 'DELETE', url: '/identity/users/deactivate', data: { userList }, tenantId });
  }

  /** 6.3 Modify — PATCH api/v2/identity/users/ */
  async modify(userList, { tenantId } = {}) {
    return this.client.request({ method: 'PATCH', url: '/identity/users/', data: { userList }, tenantId });
  }
}
