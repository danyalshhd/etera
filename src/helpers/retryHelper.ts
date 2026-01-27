import { BOOKING_RETRY_LIMIT } from '../config';

export interface RetryOptions {
  maxAttempts: number;
  onAttempt: (attempt: number) => Promise<{ ok: boolean; vendor_reference?: string | null; message?: string }>;
  onRetry?: (error: string, attempt: number) => void;
}

export const executeRetryLogic = async (options: RetryOptions): Promise<{ 
  confirmed: boolean; 
  vendor_reference: string | null; 
  lastError: string;
}> => {
  let lastError = '';
  let vendor_reference: string | null = null;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const vendorResult = await options.onAttempt(attempt);

      if (vendorResult.ok) {
        vendor_reference = vendorResult.vendor_reference || null;
        return { confirmed: true, vendor_reference, lastError: '' };
      }

      lastError = vendorResult.message || 'vendor error';
      
      if (options.onRetry) {
        options.onRetry(lastError, attempt);
      }
    } catch (err: any) {
      lastError = err?.message || 'vendor error';
      
      if (options.onRetry) {
        options.onRetry(lastError, attempt);
      }
    }
  }

  return { confirmed: false, vendor_reference: null, lastError };
};
