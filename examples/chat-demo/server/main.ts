import { createServer } from 'node:http';
import {
  chatRequestSchema,
  type ChatErrorPayload,
  type ChatResponsePayload,
  type ProviderStatus,
} from '../src/lib/contracts.js';
import { generateAssistantReply } from './chat-service.js';
import { getProviderStatuses, getServerConfig, loadLocalEnv } from './env.js';

loadLocalEnv();

const config = getServerConfig();

const server = createServer(async (request, response) => {
  setCommonHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === 'GET' && request.url === '/api/providers') {
      return sendJson(response, 200, {
        providers: getProviderStatuses(),
        defaultProvider: config.defaultProvider,
      });
    }

    if (request.method === 'POST' && request.url === '/api/chat') {
      const body = await readJsonBody(request);
      const payload = chatRequestSchema.parse(body);
      const result: ChatResponsePayload = await generateAssistantReply(
        payload.provider,
        payload.messages,
      );
      return sendJson(response, 200, result);
    }

    return sendJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return sendJson(response, 400, { error: message } satisfies ChatErrorPayload);
  }
});

server.listen(config.port, () => {
  const providers = formatProviderList(getProviderStatuses());
  console.log(`GenUI chat demo API listening on http://localhost:${config.port}`);
  console.log(`Configured providers: ${providers}`);
});

function setCommonHeaders(response: import('node:http').ServerResponse): void {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
}

async function readJsonBody(request: import('node:http').IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody);
}

function sendJson(
  response: import('node:http').ServerResponse,
  statusCode: number,
  payload:
    | { error: string }
    | ChatResponsePayload
    | { providers: ProviderStatus[]; defaultProvider: string },
): void {
  response.writeHead(statusCode);
  response.end(JSON.stringify(payload));
}

function formatProviderList(providers: ProviderStatus[]): string {
  const configured = providers
    .filter((provider) => provider.configured)
    .map((provider) => `${provider.label} (${provider.model})`);

  return configured.length > 0 ? configured.join(', ') : 'none';
}
