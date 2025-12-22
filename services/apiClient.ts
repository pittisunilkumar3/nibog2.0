export const isServer = typeof window === 'undefined';

export function apiUrl(path: string) {
  if (isServer) {
    const base = process.env.BACKEND_URL || 'http://localhost:3004';
    // Ensure path begins with /
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }
  return path; // client should call internal API routes
}
