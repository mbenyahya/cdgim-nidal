/** API First - base URL via Vite proxy or env */
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function getToken() {
  return localStorage.getItem('cgdim-token');
}

export function setToken(token) {
  if (token) localStorage.setItem('cgdim-token', token);
  else localStorage.removeItem('cgdim-token');
}

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error('Session expirée');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return;
  return res.json();
}

export const ROLES_LABELS = { admin: 'Administrateur', expert: 'Expert', user: 'Utilisateur' };
