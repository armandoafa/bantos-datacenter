# Upya API Client (Upya Manage & Device Gateway)

This module provides a clean interface for interacting with the Upya Manage and Device Gateway APIs.

## Installation

```bash
# From the project root
npm install ./upya-api-client
```

## Usage

```javascript
import UpyaManageClient from 'upya-api-client';

const client = new UpyaManageClient('your_username', 'your_password');

// Example: Search clients
const clients = await client.clients.search({ name: { $regex: 'Juan', $options: 'i' } });

// Example: Device Gateway - Search tokens
const tokens = await client.deviceGateway.searchTokens({
  query: { serialNumbers: ["01-61-00000002"] }
});
```

## Implemented Resource Managers

### Upya Manage
- `client.clients`: Management of clients.
- `client.contracts`: Management of contracts and approvals.
- `client.assets`: Asset tracking and transfers.
- `client.payments`: Payment posting and search.
- `client.agents`: Field agent management.
- `client.products`: Product configuration.
- `client.deals`: Deal configuration.
- `client.tickets`: Support tickets.
- `client.tasks`: Agent tasks.
- `client.communication`: Notifications, chat, and text messages.
- `client.events`: Search contract and asset events.
- `client.users`: User management for the platform.
- `client.messages`: System message search and count.
- `client.loans`: Schedule search, closing balance, and terms editing.
- `client.slices`: Edit slice credentials.
- `client.optionals`: Search penalties and commissions.
- `client.genericSearch(collection, query, options)`: Search any collection.

### Device Gateway
- `client.deviceGateway`: Management of activation tokens (add, modify, search, analyze).

## Multiple Base URLs
The client automatically routes requests to the appropriate Upya infrastructure:
- `api.upya.io`: Retrieval and search.
- `data.upya.io`: Creation and bulk updates.
- `tokenmgmt.api.upya.io`: Token management for devices.
