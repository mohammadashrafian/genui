import type {
  ChatErrorPayload,
  ChatRequestPayload,
  ChatResponsePayload,
  DemoProvider,
  ProviderStatus,
} from './contracts.js';

export interface ProvidersResponse {
  readonly providers: ProviderStatus[];
  readonly defaultProvider: DemoProvider;
}

export async function fetchProviders(): Promise<ProvidersResponse> {
  const response = await fetch('/api/providers');
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(readError(payload, 'Could not load configured providers.'));
  }

  return payload as ProvidersResponse;
}

export async function sendChatRequest(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(readError(data, 'The model request failed.'));
  }

  return data as ChatResponsePayload;
}

function readError(payload: unknown, fallback: string): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as ChatErrorPayload).error === 'string'
  ) {
    return (payload as ChatErrorPayload).error;
  }

  return fallback;
}
