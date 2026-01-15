export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const BASE_URL = (import.meta as any).env?.API_URL as string | undefined;
  const isAbsolute = /^https?:\/\//i.test(path);
  const base = (BASE_URL || '').replace(/\/$/, '');
  const url = isAbsolute ? path : path.startsWith('/api') && base ? `${base}${path}` : path;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  // @ts-ignore
  return undefined;
}
