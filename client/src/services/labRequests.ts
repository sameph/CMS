import { apiFetch } from '@/lib/api';
import type { LabRequestListItem, LabRequestStatus } from '@/types/clinic';

export type Catalog = {
  categories: {
    hematology: string[];
    urinalysis: string[];
    chemistry: string[];
    serology: string[];
  };
  labels?: {
    hematology: { key: string; label: string }[];
    urinalysis: { key: string; label: string }[];
    chemistry: { key: string; label: string }[];
    serology: { key: string; label: string }[];
  };
};

export type PatientOption = { id: string; name: string };

function statusMap(serverStatus: string): LabRequestStatus {
  switch (serverStatus) {
    case 'requested':
      return 'pending';
    case 'in_progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

// Convert UI selected tests by label to server requested booleans by key
export function packRequestedFromSelected(selected: Record<string, string[]>, catalog: Catalog) {
  const { byLabel } = buildLabelMaps(catalog);
  const out = {
    hematology: {} as Record<string, boolean>,
    urinalysis: {} as Record<string, boolean>,
    chemistry: {} as Record<string, boolean>,
    serology: {} as Record<string, boolean>,
  };
  const mapCat = (catName: 'Hematology'|'Urinalysis'|'Chemistry'|'Serology', target: keyof typeof out) => {
    const labels = selected[catName] || [];
    labels.forEach(label => {
      const key = (byLabel[catName] && byLabel[catName][label]) || label;
      out[target][key] = true;
    });
  };
  mapCat('Hematology','hematology');
  mapCat('Urinalysis','urinalysis');
  mapCat('Chemistry','chemistry');
  mapCat('Serology','serology');
  return out;
}

// Convert UI results keyed by "Category-Label" to server nested results/normals by keys
export function packResultsForUpdate(results: Record<string, any>, catalog: Catalog) {
  const { byLabel } = buildLabelMaps(catalog);
  const out = {
    results: { hematology: {} as Record<string, string>, urinalysis: {}, chemistry: {}, serology: {} },
    normals: { hematology: {} as Record<string, string>, urinalysis: {}, chemistry: {}, serology: {} },
  };
  const catKeyMap: Record<string, keyof typeof out.results> = {
    Hematology: 'hematology', Urinalysis: 'urinalysis', Chemistry: 'chemistry', Serology: 'serology'
  };
  Object.entries(results).forEach(([k, v]) => {
    const [catLabel, testLabel] = k.split('-');
    const catTarget = catKeyMap[catLabel];
    if (!catTarget) return;
    const key = (byLabel[catLabel as keyof typeof byLabel] && byLabel[catLabel as keyof typeof byLabel][testLabel]) || testLabel;
    if (v?.result) out.results[catTarget][key] = v.result;
    if (v?.normalValue) out.normals[catTarget][key] = v.normalValue;
  });
  return out;
}

export function buildLabelMaps(catalog?: Catalog) {
  const byKey: Record<string, Record<string, string>> = {
    Hematology: {}, Urinalysis: {}, Chemistry: {}, Serology: {},
  };
  const byLabel: Record<string, Record<string, string>> = {
    Hematology: {}, Urinalysis: {}, Chemistry: {}, Serology: {},
  };
  if (!catalog?.labels) return { byKey, byLabel };
  const fill = (cat: keyof Catalog['labels'], catName: keyof typeof byKey) => {
    const arr = catalog.labels![cat] || [];
    arr.forEach(({ key, label }) => {
      byKey[catName][key] = label;
      byLabel[catName][label] = key;
    });
  };
  fill('hematology', 'Hematology');
  fill('urinalysis', 'Urinalysis');
  fill('chemistry', 'Chemistry');
  fill('serology', 'Serology');
  return { byKey, byLabel };
}

// Map a backend LabRequest document to a UI list item
export function mapLabRequestToListItem(doc: any, catalog?: Catalog): LabRequestListItem {
  const { byKey } = buildLabelMaps(catalog);
  const tests: LabRequestListItem['tests'] = [];
  const pushCat = (catKey: 'hematology'|'urinalysis'|'chemistry'|'serology', catName: 'Hematology'|'Urinalysis'|'Chemistry'|'Serology') => {
    const flags = doc?.requested?.[catKey] || {};
    const items: string[] = [];
    for (const k of Object.keys(flags)) {
      if (flags[k]) items.push(byKey[catName][k] || k);
    }
    if (items.length) tests.push({ category: catName, items });
  };
  pushCat('hematology','Hematology');
  pushCat('urinalysis','Urinalysis');
  pushCat('chemistry','Chemistry');
  pushCat('serology','Serology');

  return {
    id: doc._id,
    patientId: doc.patientId,
    patientName: doc.patientName,
    requestedBy: doc.requestedBy?.name,
    requestDate: doc.createdAt,
    clinicalNotes: doc.notes,
    status: statusMap(doc.status),
    tests,
  };
}

export async function getOpdCatalog(): Promise<Catalog> {
  return apiFetch('/api/opd/lab-requests/catalog');
}

export async function getLabCatalog(): Promise<Catalog> {
  return apiFetch('/api/lab-requests/catalog');
}

export async function listOpdRequests(): Promise<any[]> {
  return apiFetch('/api/opd/lab-requests');
}

export async function listLabRequests(): Promise<any[]> {
  return apiFetch('/api/lab-requests');
}

export async function getOpdRequest(id: string): Promise<any> {
  return apiFetch(`/api/opd/lab-requests/${id}`);
}

export async function getLabRequest(id: string): Promise<any> {
  return apiFetch(`/api/lab-requests/${id}`);
}

export async function createOpdRequest(payload: {
  patientName: string;
  patientId?: string;
  notes?: string;
  requested: any; // per-category booleans keyed by server keys
}): Promise<any> {
  return apiFetch('/api/opd/lab-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLabRequest(id: string, body: any): Promise<any> {
  return apiFetch(`/api/lab-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getPatients(): Promise<PatientOption[]> {
  const res = await apiFetch<{ items: any[] }>('/api/patients?limit=1000');
  return (res.items || []).map((p: any) => ({ id: p._id || p.id, name: p.name }));
}
