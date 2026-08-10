/**
 * Types TypeScript pour le système de checkout
 */

export interface CheckoutRequest {
  categoryId: string;
  quantity: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
}

export interface CheckoutResponse {
  orderId: string;
  amount: number;
  categoryName: string;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  transactionId: string;
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

export interface Order {
  id: string;
  category_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'failed';
  payment_transaction_id?: string;
  payment_raw_response?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
