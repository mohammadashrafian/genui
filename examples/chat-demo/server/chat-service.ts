import type {
  ChatResponsePayload,
  ChatHistoryEntry,
  AssistantEnvelope,
  DemoProvider,
  ValidationRetryTrace,
} from '../src/lib/contracts.js';
import { assistantEnvelopeSchema } from '../src/lib/contracts.js';
import { buildCorrectionPrompt, buildSystemPrompt } from '../src/lib/prompting.js';
import { demoComponentNames, demoRegistry } from '../src/lib/registry.js';
import { generateModelResponse, type ModelConversationMessage } from './llm.js';

const MAX_VALIDATION_RETRIES = 2;

export async function generateAssistantReply(
  provider: DemoProvider,
  history: ChatHistoryEntry[],
): Promise<ChatResponsePayload> {
  const systemPrompt = buildSystemPrompt();
  const conversation = history.map(toModelMessage);
  const traces: ValidationRetryTrace[] = [];
  let lastModel = '';

  for (let attempt = 0; attempt <= MAX_VALIDATION_RETRIES; attempt++) {
    const generation = await generateModelResponse({
      provider,
      systemPrompt,
      messages: conversation,
    });
    lastModel = generation.model;

    let envelope: AssistantEnvelope;
    try {
      envelope = parseAssistantEnvelope(generation.text);
    } catch (error) {
      const parseMessage =
        error instanceof Error ? error.message : 'The response was not valid JSON.';
      if (attempt === MAX_VALIDATION_RETRIES) {
        throw new Error(parseMessage);
      }

      traces.push({
        rawText: generation.text,
        correctionPrompt: [
          'The response must be valid JSON with this exact shape:',
          '{ "message": string, "component": null | { "type": string, "props": object } }',
          `Parser error: ${parseMessage}`,
        ].join('\n'),
        errors: [parseMessage],
      });

      conversation.push(
        { role: 'assistant', content: generation.text },
        {
          role: 'user',
          content: buildCorrectionPrompt(
            generation.text,
            [
              'The previous output was not valid JSON.',
              'Return a corrected JSON object without markdown fences.',
              `Parser error: ${parseMessage}`,
            ].join('\n'),
          ),
        },
      );
      continue;
    }

    if (envelope.component === null) {
      return {
        reply: envelope,
        provider,
        model: generation.model,
        validationRetries: traces.length,
        traces,
      };
    }

    const validation = demoRegistry.tryResolve(envelope.component);
    if (validation?.ok) {
      return {
        reply: {
          message: envelope.message,
          component: {
            type: validation.name,
            props: validation.props as Record<string, unknown>,
          },
        },
        provider,
        model: generation.model,
        validationRetries: traces.length,
        traces,
      };
    }

    const correctionPrompt =
      validation === null
        ? [
            `Component "${envelope.component.type}" is not registered.`,
            `Allowed component types: ${demoComponentNames.join(', ')}`,
          ].join('\n')
        : validation.correctionPrompt;

    const errorMessages =
      validation === null
        ? [`Unknown component type: ${envelope.component.type}`]
        : validation.errors.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);

    if (attempt === MAX_VALIDATION_RETRIES) {
      throw new Error(
        `The model could not produce a valid component after ${MAX_VALIDATION_RETRIES + 1} attempts.`,
      );
    }

    traces.push({
      rawText: generation.text,
      correctionPrompt,
      errors: errorMessages,
    });

    conversation.push(
      { role: 'assistant', content: generation.text },
      { role: 'user', content: buildCorrectionPrompt(generation.text, correctionPrompt) },
    );
  }

  throw new Error(`No valid response could be generated with model ${lastModel}.`);
}

function toModelMessage(message: ChatHistoryEntry): ModelConversationMessage {
  if (message.role === 'assistant' && message.component) {
    return {
      role: 'assistant',
      content: `${message.text}\n\nRendered component JSON:\n${JSON.stringify(message.component)}`,
    };
  }

  return {
    role: message.role,
    content: message.text,
  };
}

function parseAssistantEnvelope(rawText: string): AssistantEnvelope {
  const normalized = normalizeJsonPayload(rawText);
  const parsed = JSON.parse(normalized) as unknown;
  return assistantEnvelopeSchema.parse(parsed);
}

function normalizeJsonPayload(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('```')) {
    const withoutFenceStart = trimmed.replace(/^```(?:json)?\s*/i, '');
    return withoutFenceStart.replace(/\s*```$/, '').trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}
