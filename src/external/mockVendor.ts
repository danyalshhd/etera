export interface MockVendorResponse {
  success: boolean;
  reference?: string;
  error?: string;
}

const successResponses = [
  { success: true, reference: 'VENDOR-A1B2C3D4-1738056789-1234' },
  { success: true, reference: 'BOOK-E5F6G7H8-1738056790-5678' },
  { success: true, reference: 'TXN-I9J0K1L2-1738056791-9012' },
  { success: true, reference: 'REF-M3N4O5P6-1738056792-3456' },
  { success: true, reference: 'ORD-Q7R8S9T0-1738056793-7890' },
];

const errorResponses = [
  { success: false, error: 'Vendor temporarily unavailable' },
  { success: false, error: 'Connection timeout' },
  { success: false, error: 'Service maintenance' },
  { success: false, error: 'Rate limit exceeded' },
  { success: false, error: 'Invalid booking parameters' },
];

export const mockVendorApi = (bookingId: string, attempt: number): MockVendorResponse => {
  const allResponses = [...successResponses, ...errorResponses];
  const randomIndex = Math.floor(Math.random() * allResponses.length);
  return allResponses[randomIndex];
};
