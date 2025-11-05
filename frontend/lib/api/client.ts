import { getAzureApiUrl, getGcpAgentUrl } from '@/lib/config';

const joinUrl = (base: string, path: string) => {
  if (!path) return base;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
};

const request = async (url: string, init: RequestInit = {}) => {
  const response = await fetch(url, init);
  const raw = await response.text();
  let payload: any = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`Request to ${url} failed (${response.status} ${response.statusText})${detail ? ` - ${detail}` : ''}`);
  }

  return payload;
};

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

const api = {
  get: (url: string, options: RequestInit = {}) =>
    request(url, { ...options, method: 'GET' }),
  post: (url: string, body: any, options: RequestInit = {}) =>
    request(url, {
      ...options,
      method: 'POST',
      headers: { ...jsonHeaders, ...options.headers },
      body: JSON.stringify(body),
    }),
  put: (url: string, body: any, options: RequestInit = {}) =>
    request(url, {
      ...options,
      method: 'PUT',
      headers: { ...jsonHeaders, ...options.headers },
      body: JSON.stringify(body),
    }),
};


// 1. Client for talking to the Azure Admin API
export const azureApi = {
  get: (path: string, options?: RequestInit) =>
    api.get(joinUrl(getAzureApiUrl(), path), options),
  post: (path: string, body: any, options?: RequestInit) =>
    api.post(joinUrl(getAzureApiUrl(), path), body, options),
  put: (path: string, body: any, options?: RequestInit) =>
    api.put(joinUrl(getAzureApiUrl(), path), body, options),
};

// 2. Client for talking to our GCP Agent API (for non-chat stuff)
export const gcpApi = {
  get: (path: string, options?: RequestInit) =>
    api.get(joinUrl(getGcpAgentUrl(), path), options),
  post: (path: string, body: any, options?: RequestInit) =>
    api.post(joinUrl(getGcpAgentUrl(), path), body, options),
  put: (path: string, body: any, options?: RequestInit) =>
    api.put(joinUrl(getGcpAgentUrl(), path), body, options),
};