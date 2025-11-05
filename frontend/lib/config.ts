declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Record<string, string | null>;
  }
}

type RuntimeKey = 'NEXT_PUBLIC_GCP_AGENT_URL' | 'NEXT_PUBLIC_AZURE_API_URL';

const readRuntimeEnv = (key: RuntimeKey): string | undefined => {
  if (typeof window !== 'undefined') {
    const runtimeValue = window.__RUNTIME_CONFIG__?.[key];
    if (runtimeValue != null) {
      return runtimeValue;
    }
  }

  const envValue = process.env?.[key];
  return envValue ?? undefined;
};

const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return undefined;
  return value.replace(/\/+$/, '');
};

const defaultAgentUrl = 'http://localhost:8080';
const isDevLike = process.env.NODE_ENV !== 'production';
const warnedKeys = new Set<RuntimeKey>();

const warnOnce = (key: RuntimeKey, message: string) => {
  if (!isDevLike || warnedKeys.has(key)) {
    return;
  }

  console.warn(message);
  warnedKeys.add(key);
};

export const getGcpAgentUrl = (): string => {
  const configured = sanitizeBaseUrl(readRuntimeEnv('NEXT_PUBLIC_GCP_AGENT_URL'));

  if (configured) {
    return configured;
  }

  warnOnce(
    'NEXT_PUBLIC_GCP_AGENT_URL',
    `Missing NEXT_PUBLIC_GCP_AGENT_URL env variable. Falling back to ${defaultAgentUrl}`
  );

  return defaultAgentUrl;
};

export const getAzureApiUrl = (): string => {
  const configured = sanitizeBaseUrl(readRuntimeEnv('NEXT_PUBLIC_AZURE_API_URL'));

  if (configured) {
    return configured;
  }

  warnOnce(
    'NEXT_PUBLIC_AZURE_API_URL',
    'Missing NEXT_PUBLIC_AZURE_API_URL env variable. Using GCP agent URL as fallback.'
  );

  return getGcpAgentUrl();
};

export const getGcpAgentWsUrl = (): string =>
  getGcpAgentUrl().replace(/^http(s?):\/\//, (_, secure) =>
    secure ? 'wss://' : 'ws://'
  );
