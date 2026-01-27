export const BOOKING_VENDOR_ENDPOINT = (bookingId: string) => `${process.env.VENDOR_URL || 'https://mock-vendor.test'}/bookings/${bookingId}`;
export const BOOKING_RETRY_LIMIT = Number(process.env.BOOKING_RETRY_LIMIT || 3);
export const POSTGRES_URL = process.env.DATABASE_URL || '';