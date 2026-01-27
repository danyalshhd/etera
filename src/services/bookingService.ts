import { randomUUID } from 'crypto';
import { axiosInstance } from '../axiosInstance';
import { BOOKING_VENDOR_ENDPOINT, BOOKING_RETRY_LIMIT } from '../config';
import {
  createBooking,
  ensureSchema,
  findBookingById,
  findBookingByKey,
  updateBookingStatus,
} from '../db/booking';
import { Booking, CreateBookingInput, VendorResponse } from '../interfaces/Booking';
import { mockVendorApi } from '../external/mockVendor';
import { executeRetryLogic } from '../helpers/retryHelper';
import { BookingStatusEnum } from '../types/BookingStatus';

const talkToVendor = async (bookingId: string, attempt: number): Promise<VendorResponse> => {
  try {
    const result = mockVendorApi(bookingId, attempt);
    
    if (result.success) {
      return { ok: true, vendor_reference: result.reference || `vendor-${bookingId}-${attempt}` };
    }
    
    return { ok: false, vendor_reference: null, message: result.error || 'vendor error' };
  } catch (err: any) {
    return { ok: false, vendor_reference: null, message: err?.message || 'vendor error' };
  }
};

export const createBookingWithRetry = async (input: CreateBookingInput): Promise<{ booking: Booking; error?: string; isNew?: boolean }> => {
  const { userId, amount, idempotencyKey } = input;

  const existing = await findBookingByKey(idempotencyKey);
  if (existing) {
    return { booking: existing as Booking, isNew: false };
  }

  const bookingId = randomUUID();
  let pending;

  try {
    pending = await createBooking({
      id: bookingId,
      user_id: userId,
      vendor_reference: null,
      amount,
      status: BookingStatusEnum.PENDING,
      idempotency_key: idempotencyKey,
      retries: 0,
    });
  } catch (err: any) {
    if (err.code === '23505') {
      const duplicate = await findBookingByKey(idempotencyKey);
      if (duplicate) {
        return { booking: duplicate as Booking };
      }
    }
    throw err;
  }

  const retryResult = await executeRetryLogic({
    maxAttempts: BOOKING_RETRY_LIMIT,
    onAttempt: (attempt) => talkToVendor(bookingId, attempt),
    onRetry: async (error, attempt) => {
      await updateBookingStatus(bookingId, BookingStatusEnum.PENDING, null, attempt);
    },
  });

  if (retryResult.confirmed) {
    const updated = await updateBookingStatus(
      bookingId,
      BookingStatusEnum.CONFIRMED,
      retryResult.vendor_reference,
      BOOKING_RETRY_LIMIT - 1
    );
    return { booking: (updated as Booking) || pending, isNew: true };
  }

  const failed = await updateBookingStatus(bookingId, BookingStatusEnum.FAILED, null, BOOKING_RETRY_LIMIT);
  return { 
    booking: (failed as Booking) || pending, 
    error: retryResult.lastError || 'vendor failed', 
    isNew: true 
  };
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  const booking = await findBookingById(id);
  return booking as Booking | null;
};
