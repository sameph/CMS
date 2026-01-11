import { apiFetch } from '@/lib/api';

export interface ConsultationDoc {
  _id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  vitals?: {
    temperature?: string;
    pulse?: string;
    bloodPressure?: string;
    respiratoryRate?: string;
    spo2?: string;
    weight?: string;
  };
  examination?: string;
  diagnosis?: string;
  plan?: string;
  medicationsText?: string;
  labsText?: string;
}

export async function listConsultations(params: { patientId?: string; q?: string } = {}): Promise<ConsultationDoc[]> {
  const qs = new URLSearchParams();
  if (params.patientId) qs.set('patientId', params.patientId);
  if (params.q) qs.set('q', params.q);
  const res = await apiFetch<{ items: ConsultationDoc[] }>(`/api/consultations?${qs.toString()}`);
  return res.items || [];
}

export async function createConsultation(body: Partial<ConsultationDoc>): Promise<ConsultationDoc> {
  return apiFetch<ConsultationDoc>('/api/consultations', { method: 'POST', body: JSON.stringify(body) });
}
