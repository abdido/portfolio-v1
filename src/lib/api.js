let csrfToken = '';
export const setCsrfToken = value => { csrfToken = value || ''; };
const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const resolveApiUrl = path => /^https?:\/\//i.test(path) ? path : `${configuredApiBase}${path}`;
export async function api(path, { method = 'GET', body, signal } = {}) {
  const multipart = body instanceof FormData;
  const target = resolveApiUrl(path);
  const crossOrigin = /^https?:\/\//i.test(target) && new URL(target, window.location.origin).origin !== window.location.origin;
  const response = await fetch(target, { method, credentials: crossOrigin ? 'include' : 'same-origin', signal,
    headers: { ...(body && !multipart ? {'Content-Type':'application/json'} : {}),
      ...(!['GET','HEAD'].includes(method) && csrfToken ? {'X-CSRF-Token':csrfToken} : {}) },
    body: body ? (multipart ? body : JSON.stringify(body)) : undefined });
  const data = await response.json().catch(() => ({error:'Respons server tidak valid'}));
  if (!response.ok) {
    if(response.status===401 && !path.endsWith('/login')) window.dispatchEvent(new Event('portfolio-session-expired'));
    throw new Error(data.error || `Request gagal (${response.status})`);
  }
  return data;
}
