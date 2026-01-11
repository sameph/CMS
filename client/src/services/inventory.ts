import { apiFetch } from '@/lib/api';

export interface InventoryItemDoc {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  expiryDate?: string;
  reorderLevel?: number;
  location: 'central' | 'opd';
}

export async function listInventory(params: { location?: 'central'|'opd'; q?: string } = {}): Promise<InventoryItemDoc[]> {
  const qs = new URLSearchParams();
  if (params.location) qs.set('location', params.location);
  if (params.q) qs.set('q', params.q);
  const res = await apiFetch<{ items: InventoryItemDoc[] }>(`/api/inventory?${qs.toString()}`);
  return res.items || [];
}

export async function createInventoryItem(body: Partial<InventoryItemDoc>): Promise<InventoryItemDoc> {
  return apiFetch<InventoryItemDoc>('/api/inventory', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateInventoryItem(id: string, body: Partial<InventoryItemDoc>): Promise<InventoryItemDoc> {
  return apiFetch<InventoryItemDoc>(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function transferStock(body: { itemId: string; quantity: number; to: 'central'|'opd' }): Promise<any> {
  return apiFetch('/api/inventory/transfer', { method: 'POST', body: JSON.stringify(body) });
}
