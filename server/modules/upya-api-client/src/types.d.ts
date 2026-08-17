/**
 * Upya API Type Definitions
 */

export namespace Upya {
  // --- Common Structures ---
  export interface SearchOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    project?: Record<string, 1 | 0>;
  }

  export interface SearchResponse<T> {
    results: T[];
    totalCount: number;
    limit: number;
    skip: number;
  }

  // --- Clients ---
  export interface Client {
    id?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    externalReference?: string;
    nationalId?: string;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      coordinates?: [number, number];
    };
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
  }

  // --- Contracts ---
  export interface Contract {
    contractNumber: string;
    clientId: string;
    productReference: string;
    dealReference: string;
    status: 'pending' | 'active' | 'closed' | 'rejected' | 'cancelled';
    startDate?: string;
    endDate?: string;
    pricing?: {
      totalPrice: number;
      downPayment: number;
      numberOfInstallments: number;
      installmentAmount: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'onDemand';
    };
    assets?: string[]; // Serial numbers
    agentNumber?: string;
    metadata?: Record<string, any>;
  }

  // --- Assets ---
  export interface Asset {
    serialNumber: string;
    productReference: string;
    status: 'in_stock' | 'deployed' | 'maintenance' | 'lost' | 'retired';
    assignedTo?: string; // Contract number or Agent number
    lastSync?: string;
    metadata?: Record<string, any>;
  }

  // --- Payments ---
  export interface Payment {
    id?: string;
    contractNumber: string;
    amount: number;
    currency: string;
    paymentDate: string;
    paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'external';
    externalReference?: string;
    status: 'processed' | 'pending' | 'failed' | 'reversed';
    recordedBy?: string;
  }

  // --- Agents ---
  export interface Agent {
    agentNumber: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
    status: 'active' | 'inactive';
    region?: string;
  }

  // --- Device Gateway (Tokens) ---
  export interface Token {
    serialNumber: string;
    activationCode: string;
    expiryDate?: string;
    tokenType?: string;
    isUsed: boolean;
    metadata?: Record<string, any>;
  }

  export interface AddTokensRequest {
    tokens: {
      serialNumber: string;
      activationCode: string;
    }[];
    productReference: string;
  }

  // --- Communication ---
  export interface NotificationRequest {
    target: string; // phone number or email
    title: string;
    body: string;
    data?: Record<string, any>;
  }
}
