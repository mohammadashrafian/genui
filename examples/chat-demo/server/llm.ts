import type { DemoProvider } from '../src/lib/contracts.js';
import { getServerConfig } from './env.js';

export interface ModelConversationMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface ModelGenerationResult {
  readonly provider: DemoProvider;
  readonly model: string;
  readonly text: string;
}

interface GenerationRequest {
  readonly provider: DemoProvider;
  readonly systemPrompt: string;
  readonly messages: ModelConversationMessage[];
}

export async function generateModelResponse(
  request: GenerationRequest,
): Promise<ModelGenerationResult> {
  if (request.provider === 'anthropic') {
    return callAnthropic(request);
  }

  return callOpenAI(request);
}

async function callOpenAI(request: GenerationRequest): Promise<ModelGenerationResult> {
  const config = getServerConfig();
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.openaiModel,
      max_output_tokens: 1_200,
      input: [
        { role: 'developer', content: request.systemPrompt },
        ...request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      text: {
        format: { type: 'json_object' },
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(readProviderError(payload, 'OpenAI request failed.'));
  }

  return {
    provider: 'openai',
    model: config.openaiModel,
    text: extractOpenAIText(payload),
  };
}

async function callAnthropic(request: GenerationRequest): Promise<ModelGenerationResult> {
  const config = getServerConfig();
  if (!config.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: 1_200,
      system: request.systemPrompt,
      messages: request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(readProviderError(payload, 'Anthropic request failed.'));
  }

  return {
    provider: 'anthropic',
    model: config.anthropicModel,
    text: extractAnthropicText(payload),
  };
}

function extractOpenAIText(payload: unknown): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'output_text' in payload &&
    typeof payload.output_text === 'string'
  ) {
    return payload.output_text;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'output' in payload &&
    Array.isArray(payload.output)
  ) {
    const segments: string[] = [];

    for (const item of payload.output) {
      if (
        typeof item === 'object' &&
        item !== null &&
        'content' in item &&
        Array.isArray(item.content)
      ) {
        for (const content of item.content) {
          if (
            typeof content === 'object' &&
            content !== null &&
            'text' in content &&
            typeof content.text === 'string'
          ) {
            segments.push(content.text);
          }
        }
      }
    }

    if (segments.length > 0) {
      return segments.join('\n').trim();
    }
  }

  throw new Error('OpenAI response did not contain any text output.');
}

function extractAnthropicText(payload: unknown): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'content' in payload &&
    Array.isArray(payload.content)
  ) {
    const segments = payload.content
      .filter(
        (item): item is { text: string } =>
          typeof item === 'object' &&
          item !== null &&
          'text' in item &&
          typeof item.text === 'string',
      )
      .map((item) => item.text);

    if (segments.length > 0) {
      return segments.join('\n').trim();
    }
  }

  throw new Error('Anthropic response did not contain any text output.');
}

function readProviderError(payload: unknown, fallback: string): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'object' &&
    payload.error !== null &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message;
  }

  return fallback;
}
