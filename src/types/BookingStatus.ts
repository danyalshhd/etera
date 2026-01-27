export type BookingStatus = 'pending' | 'confirmed' | 'failed';

export const BookingStatusEnum = {
  PENDING: 'pending' as BookingStatus,
  CONFIRMED: 'confirmed' as BookingStatus,
  FAILED: 'failed' as BookingStatus,
};
