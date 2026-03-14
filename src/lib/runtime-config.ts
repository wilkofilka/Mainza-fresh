const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof window !== 'undefined') {
    return trimTrailingSlash(window.location.origin);
  }

  return 'http://localhost:8000';
};

const resolveWsBaseUrl = () => {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }

  return 'ws://localhost:8000';
};

export const runtimeConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  wsBaseUrl: resolveWsBaseUrl(),
  livekitUrl: import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880',
  openAiBaseUrl: trimTrailingSlash(import.meta.env.VITE_OPENAI_BASE_URL || '/v1'),
  openAiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  openAiModel: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
  useNativeOpenAi: import.meta.env.VITE_USE_OPENAI_NATIVE === 'true',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
};

export const apiUrl = (path: string) => `${runtimeConfig.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
export const wsUrl = (path: string) => `${runtimeConfig.wsBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
