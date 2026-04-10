import type { ChatHistoryEntry } from './contracts.js';
import { demoToolDefinitions, demoComponentNames } from './registry.js';

export function buildSystemPrompt(): string {
  return [
    'You are the UI planner for a GenUI chat demo.',
    'Return only a JSON object with this exact top-level shape:',
    '{ "message": string, "component": null | { "type": string, "props": object } }',
    'Keep "message" concise, helpful, and conversational.',
    'Only use "component" when it materially improves the answer.',
    'If a plain answer is enough, set "component" to null.',
    `Allowed component types: ${demoComponentNames.join(', ')}`,
    'Never invent a component name or prop.',
    'Do not wrap the JSON in markdown fences.',
    '',
    'Available components and schemas:',
    JSON.stringify(demoToolDefinitions, null, 2),
  ].join('\n');
}

export function buildConversationTranscript(messages: ChatHistoryEntry[]): string[] {
  return messages.map((message) => {
    if (message.role === 'user') {
      return `User: ${message.text}`;
    }

    if (message.component) {
      return [
        `Assistant: ${message.text}`,
        `Rendered component: ${JSON.stringify(message.component)}`,
      ].join('\n');
    }

    return `Assistant: ${message.text}`;
  });
}

export function buildCorrectionPrompt(rawResponse: string, correctionPrompt: string): string {
  return [
    'Your previous response did not pass component validation.',
    'Return a full corrected JSON object with the same top-level shape.',
    'Keep the answer helpful, but fix the component so it matches the schema exactly.',
    '',
    'Previous raw JSON:',
    rawResponse,
    '',
    'Validation feedback:',
    correctionPrompt,
  ].join('\n');
}
