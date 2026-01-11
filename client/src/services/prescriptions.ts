import { apiFetch } from '@/lib/api';

export interface MedicationDto {
  id?: string;
  name: string;
  dosage?: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface PrescriptionDoc {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  date: string;
  medications: MedicationDto[];
  status: 'pending'|'dispensed'|'partially-dispensed';
  notes?: string;
}

export async function listPrescriptions(params: { q?: string; status?: string } = {}): Promise<PrescriptionDoc[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  const res = await apiFetch<{ items: PrescriptionDoc[] }>(`/api/prescriptions?${qs.toString()}`);
  return res.items || [];
}

export async function createPrescription(body: Omit<PrescriptionDoc, '_id'|'date'|'status'> & { status?: PrescriptionDoc['status'] }): Promise<PrescriptionDoc> {
  return apiFetch('/api/prescriptions', { method: 'POST', body: JSON.stringify(body) });
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionDoc['status']): Promise<PrescriptionDoc> {
  return apiFetch(`/api/prescriptions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
