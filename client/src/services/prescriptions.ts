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

export async function listPrescriptions(params: { q?: string; status?: string; patientId?: string } = {}): Promise<(PrescriptionDoc & { id: string })[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  if (params.patientId) qs.set('patientId', params.patientId);
  const res = await apiFetch<{ items: PrescriptionDoc[] }>(`/api/prescriptions?${qs.toString()}`);
  const items = res.items || [];
  return items.map((it) => ({ ...it, id: (it as any)._id || (it as any).id }));
}

export async function createPrescription(body: Omit<PrescriptionDoc, '_id'|'date'|'status'> & { status?: PrescriptionDoc['status'] }): Promise<PrescriptionDoc> {
  return apiFetch('/api/prescriptions', { method: 'POST', body: JSON.stringify(body) });
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionDoc['status']): Promise<PrescriptionDoc> {
  return apiFetch(`/api/prescriptions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
