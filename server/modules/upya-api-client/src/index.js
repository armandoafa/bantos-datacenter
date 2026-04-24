import UpyaClient from './client.js';
import { clientsEndpoints } from './endpoints/clients.js';
import { contractsEndpoints } from './endpoints/contracts.js';
import { assetsEndpoints } from './endpoints/assets.js';
import { paymentsEndpoints } from './endpoints/payments.js';
import { agentsEndpoints } from './endpoints/agents.js';
import { productsEndpoints, dealsEndpoints } from './endpoints/products_deals.js';
import { ticketsEndpoints, tasksEndpoints } from './endpoints/tickets_tasks.js';
import { communicationEndpoints } from './endpoints/communication.js';
import { eventsEndpoints } from './endpoints/events.js';
import { usersEndpoints } from './endpoints/users.js';
import { messagesEndpoints } from './endpoints/messages.js';
import { loansEndpoints } from './endpoints/loans.js';
import { slicesEndpoints } from './endpoints/slices.js';
import { optionalsEndpoints } from './endpoints/optionals.js';
import { deviceGatewayEndpoints } from './endpoints/device_gateway.js';
import { dataCollectionsEndpoints } from './endpoints/data_collections.js';

class UpyaManageClient extends UpyaClient {
  constructor(username, password) {
    super(username, password);

    this.clients = clientsEndpoints(this);
    this.contracts = contractsEndpoints(this);
    this.assets = assetsEndpoints(this);
    this.payments = paymentsEndpoints(this);
    this.agents = agentsEndpoints(this);
    this.products = productsEndpoints(this);
    this.deals = dealsEndpoints(this);
    this.tickets = ticketsEndpoints(this);
    this.tasks = tasksEndpoints(this);
    this.communication = communicationEndpoints(this);
    this.events = eventsEndpoints(this);
    this.users = usersEndpoints(this);
    this.messages = messagesEndpoints(this);
    this.loans = loansEndpoints(this);
    this.slices = slicesEndpoints(this);
    this.optionals = optionalsEndpoints(this);
    this.deviceGateway = deviceGatewayEndpoints(this);
    this.dataCollections = dataCollectionsEndpoints(this);
  }

  /**
   * General search for collections not covered by specific managers
   * @param {string} collection - The collection name (e.g., 'forms', 'events', 'users')
   * @param {object} query - MongoDB-like query
   * @param {object} options - Pagination, sorting, etc.
   */
  async genericSearch(collection, query, options) {
    return this.search(collection, query, options);
  }
}

export default UpyaManageClient;
export { UpyaManageClient };
