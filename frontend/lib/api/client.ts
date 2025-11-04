import { AZURE_API_URL, GCP_AGENT_URL } from '@/lib/config';

// This is a simple wrapper for 'fetch'
const api = {
  get: async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      method: 'GET',
    }).then(res => res.json());
  },

  post: async (url: string, body: any, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    }).then(res => res.json());
  },

  put: async (url: string, body: any, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    }).then(res => res.json());
  },
};


// 1. Client for talking to the Azure Admin API
export const azureApi = {
  get: (path: string, options?: RequestInit) => 
    api.get(`${AZURE_API_URL}${path}`, options),
  post: (path: string, body: any, options?: RequestInit) => 
    api.post(`${AZURE_API_URL}${path}`, body, options),
  put: (path: string, body: any, options?: RequestInit) => 
    api.put(`${AZURE_API_URL}${path}`, body, options),
};

// 2. Client for talking to our GCP Agent API (for non-chat stuff)
export const gcpApi = {
  get: (path: string, options?: RequestInit) => 
    api.get(`${GCP_AGENT_URL}${path}`, options),
  post: (path: string, body: any, options?: RequestInit) => 
    api.post(`${GCP_AGENT_URL}${path}`, body, options),
  put: (path: string, body: any, options?: RequestInit) => 
    api.put(`${GCP_AGENT_URL}${path}`, body, options), 
};