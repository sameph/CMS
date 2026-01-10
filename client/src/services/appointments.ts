import { apiFetch } from '@/lib/api';
import type { Appointment } from '@/types/clinic';

export async function listAppointments(params: { date?: string; status?: string; doctorId?: string } = {}): Promise<Appointment[]> {
  const qs = new URLSearchParams();
  if (params.date) qs.set('date', params.date); else qs.set('date', 'today');
  if (params.status) qs.set('status', params.status);
  if (params.doctorId) qs.set('doctorId', params.doctorId);
  const res = await apiFetch<{ items: any[] }>(`/api/appointments?${qs.toString()}`);
  return (res.items || []).map(mapAppointment);
}

export async function listWaiting(params: { doctorId?: string } = {}): Promise<Appointment[]> {
  const qs = new URLSearchParams();
  if (params.doctorId) qs.set('doctorId', params.doctorId);
  const res = await apiFetch<{ items: any[] }>(`/api/appointments/waiting?${qs.toString()}`);
  return (res.items || []).map(mapAppointment);
}

export async function createAppointment(body: {
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  date: string; // ISO date
  time: string; // HH:mm
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
}): Promise<Appointment> {
  const res = await apiFetch<any>('/api/appointments', { method: 'POST', body: JSON.stringify(body) });
  return mapAppointment(res);
}

export async function checkInAppointment(id: string): Promise<Appointment> {
  const res = await apiFetch<any>(`/api/appointments/${id}/check-in`, { method: 'PATCH' });
  return mapAppointment(res);
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
  const res = await apiFetch<any>(`/api/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  return mapAppointment(res);
}

export async function callNext(params: { doctorId?: string } = {}): Promise<Appointment> {
  const qs = new URLSearchParams();
  if (params.doctorId) qs.set('doctorId', params.doctorId);
  const res = await apiFetch<any>(`/api/appointments/next?${qs.toString()}`, { method: 'POST' });
  return mapAppointment(res);
}

function mapAppointment(doc: any): Appointment {
  return {
    id: doc._id || doc.id,
    patientId: String(doc.patientId),
    patientName: doc.patientName,
    doctorId: String(doc.doctorId),
    doctorName: doc.doctorName,
    date: new Date(doc.date).toISOString(),
    time: doc.time,
    status: doc.status,
    type: doc.type,
    notes: doc.notes,
  };
}
