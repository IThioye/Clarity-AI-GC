const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return undefined
  return value.replace(/\/+$/, '')
}

const defaultAgentUrl = 'http://localhost:8080'

const configuredAgentUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_GCP_AGENT_URL)
if (!configuredAgentUrl) {
  console.warn(`Missing NEXT_PUBLIC_GCP_AGENT_URL env variable. Falling back to ${defaultAgentUrl}`)
}

export const GCP_AGENT_URL = configuredAgentUrl ?? defaultAgentUrl

const configuredAzureUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_AZURE_API_URL)
if (!configuredAzureUrl) {
  console.warn('Missing NEXT_PUBLIC_AZURE_API_URL env variable. Using GCP agent URL as fallback.')
}

export const AZURE_API_URL = configuredAzureUrl ?? GCP_AGENT_URL

export const GCP_AGENT_WS_URL = GCP_AGENT_URL
  ? GCP_AGENT_URL.replace(/^http(s?):\/\//, (_, secure) => (secure ? 'wss://' : 'ws://'))
  : undefined