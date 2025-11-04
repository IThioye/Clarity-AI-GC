export const AZURE_API_URL = process.env.NEXT_PUBLIC_AZURE_API_URL;

if (!AZURE_API_URL) {
  console.warn("Missing NEXT_PUBLIC_AZURE_API_URL env variable");
}

export const GCP_AGENT_URL = process.env.NEXT_PUBLIC_GCP_AGENT_URL;

if (!GCP_AGENT_URL) {
  console.warn("Missing NEXT_PUBLIC_GCP_AGENT_URL env variable");
}

export const GCP_AGENT_WS_URL = GCP_AGENT_URL
  ? GCP_AGENT_URL.replace(/^http/, 'ws')
  : undefined;