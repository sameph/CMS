import { apiFetch } from '@/lib/api';
import type { Patient } from '@/types/clinic';

export async function listPatients(params: { q?: string; gender?: string; page?: number; limit?: number } = {}): Promise<Patient[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.gender) qs.set('gender', params.gender);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const res = await apiFetch<{ items: any[] }>(`/api/patients?${qs.toString()}`);
  return (res.items || []).map(mapPatient);
}

export async function createPatient(body: {
  name: string;
  dateOfBirth: string; // ISO date
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  email?: string;
  bloodType?: string;
  allergies?: string[];
}): Promise<Patient> {
  const res = await apiFetch<any>('/api/patients', { method: 'POST', body: JSON.stringify(body) });
  return mapPatient(res);
}

export async function updatePatient(id: string, body: Partial<{
  name: string;
  dateOfBirth: string; // ISO date
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  email?: string;
  bloodType?: string;
  allergies?: string[];
  lastVisit?: string;
}>): Promise<Patient> {
  const res = await apiFetch<any>(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  return mapPatient(res);
}

function mapPatient(doc: any): Patient {
  return {
    id: doc._id || doc.id,
    name: doc.name,
    dateOfBirth: new Date(doc.dateOfBirth).toISOString(),
    gender: doc.gender,
    phone: doc.phone,
    email: doc.email,
    address: doc.address,
    bloodType: doc.bloodType,
    allergies: doc.allergies || [],
    registrationDate: doc.createdAt || new Date().toISOString(),
    lastVisit: doc.lastVisit ? new Date(doc.lastVisit).toISOString() : undefined,
  };
}
