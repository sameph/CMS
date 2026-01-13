import { apiFetch } from '../lib/api';

export interface PaymentItem {
  id: string;
  type: 'laboratory' | 'medication' | 'consultation' | 'injection';
  patientName: string;
  amount: number;
  date: string;
  details: string;
  refId: string;
}

export const paymentsKey = {
  all: ['payments'] as const,
  pending: () => [...paymentsKey.all, 'pending'] as const,
};

export async function fetchPendingPayments(): Promise<PaymentItem[]> {
  return apiFetch('/api/payments/pending');
}

export async function confirmPayment(
  id: string,
  type: string,
  opts?: { method?: 'cash' | 'card'; reference?: string }
) {
  return apiFetch('/api/payments/confirm', {
    method: 'POST',
    body: JSON.stringify({ id, type, paymentMethod: opts?.method, reference: opts?.reference }),
  });
}
