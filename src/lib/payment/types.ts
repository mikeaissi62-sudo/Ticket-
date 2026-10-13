export type PaymentProvider = 'mtn_momo' | 'moov_money' | 'card';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface PaymentInitiateRequest {
  booking_id: string;
  provider: PaymentProvider;
  phone: string;
  amount: number;
  otp?: string; // Requis pour Moov Money
}

export interface PaymentInitiateResponse {
  success: boolean;
  payment_id: string;
  transaction_id: string;
  booking_reference: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  phone: string;
  ussd_prompt?: string;
  instructions: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment_id: string;
  booking_id: string;
  booking_reference: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  paid_at?: string;
  qr_code_data?: string;
  ticket_id?: string;
}

export interface WebhookNotification {
  transaction_id: string;
  reference_id: string;
  provider: PaymentProvider;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  payer_phone?: string;
  operator_transaction_id?: string;
  timestamp: string;
  signature?: string;
}

export interface RefundRequest {
  booking_id?: string;
  booking_reference?: string;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  booking_reference: string;
  refund_amount: number;
  penalty_fee: number;
  refunded_to: string;
  payment_status: 'refunded';
  booking_status: 'cancelled';
  message: string;
}
