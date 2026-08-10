/**
 * Types TypeScript pour l'intégration GeniusPay
 * Documentation: https://geniuspay.ci/docs/api
 */

export interface GeniusPayInitiateResponse {
  success: boolean;
  data?: {
    id: number;
    reference: string;
    amount: number;
    fees: number;
    net_amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    payment_url?: string;
    checkout_url?: string;
    gateway?: string;
    environment: 'sandbox' | 'production';
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

export interface GeniusPayVerifyResponse {
  success: boolean;
  data?: {
    id: number;
    reference: string;
    amount: number;
    fees: number;
    net_amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    payment_method?: string;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
    created_at: string;
    completed_at?: string;
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

export interface GeniusPayWebhookPayload {
  event: string;
  timestamp: string;
  data?: {
    transaction: {
      id: number;
      reference: string;
      amount: number;
      status: string;
      customer?: {
        name?: string;
        phone?: string;
      };
      metadata?: Record<string, unknown>;
    };
    merchant?: {
      id: string;
      name: string;
    };
    environment: 'sandbox' | 'production';
  };
  [key: string]: unknown;
}

export interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  reference: string;
}

export interface ConfirmPaymentResponse {
  tickets: Array<{
    id: string;
    ticket_code: string;
    buyer_name: string;
    buyer_email: string;
    category_id: string;
    ticket_number: number;
  }>;
}
