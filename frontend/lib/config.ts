declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Record<string, string | null>;
  }
}

const readRuntimeEnv = (key: string): string | null | undefined => {
  if (typeof window === 'undefined') {
    return process.env?.[key];
  }

  return window.__RUNTIME_CONFIG__?.[key] ?? null;
};

const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return undefined;
  return value.replace(/\/+$/, '');
};

const defaultAgentUrl = 'http://localhost:8080';
const isDevLike = process.env.NODE_ENV !== 'production';

const configuredAgentUrl = sanitizeBaseUrl(
  readRuntimeEnv('NEXT_PUBLIC_GCP_AGENT_URL') ?? null
);
export const GCP_AGENT_URL = configuredAgentUrl ?? defaultAgentUrl;

if (!configuredAgentUrl && isDevLike) {
  console.warn(
    `Missing NEXT_PUBLIC_GCP_AGENT_URL env variable. Falling back to ${defaultAgentUrl}`
  );
}

const configuredAzureUrl = sanitizeBaseUrl(
  readRuntimeEnv('NEXT_PUBLIC_AZURE_API_URL') ?? null
);
export const AZURE_API_URL = configuredAzureUrl ?? GCP_AGENT_URL;

if (!configuredAzureUrl && isDevLike) {
  console.warn(
    'Missing NEXT_PUBLIC_AZURE_API_URL env variable. Using GCP agent URL as fallback.'
  );
}

export const GCP_AGENT_WS_URL = GCP_AGENT_URL.replace(
  /^http(s?):\/\//,
  (_, secure) => (secure ? 'wss://' : 'ws://')
);
