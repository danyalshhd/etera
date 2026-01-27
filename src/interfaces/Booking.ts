import { BookingStatus } from '../types/BookingStatus';

export interface Booking {
  id: string;
  user_id: string;
  vendor_reference: string | null;
  amount: number;
  status: BookingStatus;
  idempotency_key: string;
  retries: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookingInput {
  userId: string;
  amount: number;
  idempotencyKey: string;
}

export interface VendorResponse {
  ok: boolean;
  vendor_reference: string | null;
  message?: string;
}
