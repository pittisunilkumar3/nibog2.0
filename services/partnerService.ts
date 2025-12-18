export interface Partner {
  id?: number;
  partner_name?: string;
  image_url: string;
  display_priority?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/** Get all partners via internal API route */
export async function getAllPartners(): Promise<Partner[]> {
  try {
    const res = await fetch('/api/partners/get-all', { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch partners: ${res.status}`);
    const data = await res.json();
    // data may be array or { success, data }
    return Array.isArray(data) ? data : (data.data || []);
  } catch (err) {
    console.error('Error fetching partners:', err);
    throw err;
  }
}

/** Create partner (requires auth) */
export async function createPartner(partner: Partner): Promise<any> {
  try {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/partners', { method: 'POST', headers, body: JSON.stringify(partner) });
    if (!res.ok) throw new Error(`Create partner failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error creating partner:', err);
    throw err;
  }
}

export async function getPartner(id: number): Promise<Partner> {
  try {
    const res = await fetch(`/api/partners/${id}`, { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch partner failed: ${res.status}`);
    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.error('Error fetching partner:', err);
    throw err;
  }
}

export async function updatePartner(id: number, payload: Partial<Partner>): Promise<any> {
  try {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/partners/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Update partner failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error updating partner:', err);
    throw err;
  }
}

export async function deletePartner(id: number): Promise<any> {
  try {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/partners/${id}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`Delete partner failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error deleting partner:', err);
    throw err;
  }
}