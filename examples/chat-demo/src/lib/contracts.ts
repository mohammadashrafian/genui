import { z } from 'zod';
import { safeString } from '@genuikit/core';

export const demoProviderSchema = z.enum(['openai', 'anthropic']);

export type DemoProvider = z.infer<typeof demoProviderSchema>;

export const llmComponentOutputSchema = z.object({
  type: safeString({ maxLength: 120 }),
  props: z.record(z.unknown()),
});

export type DemoComponentOutput = z.infer<typeof llmComponentOutputSchema>;

export const assistantEnvelopeSchema = z.object({
  message: safeString({ maxLength: 4_000 }),
  component: llmComponentOutputSchema.nullable().default(null),
});

export type AssistantEnvelope = z.infer<typeof assistantEnvelopeSchema>;

export const chatHistoryEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: safeString({ maxLength: 4_000 }),
  component: llmComponentOutputSchema.nullable().optional(),
});

export type ChatHistoryEntry = z.infer<typeof chatHistoryEntrySchema>;

export const chatRequestSchema = z.object({
  provider: demoProviderSchema,
  messages: z.array(chatHistoryEntrySchema).min(1).max(30),
});

export type ChatRequestPayload = z.infer<typeof chatRequestSchema>;

export interface ValidationRetryTrace {
  readonly rawText: string;
  readonly correctionPrompt: string;
  readonly errors: string[];
}

export interface ProviderStatus {
  readonly provider: DemoProvider;
  readonly label: string;
  readonly model: string;
  readonly configured: boolean;
}

export interface ChatResponsePayload {
  readonly reply: AssistantEnvelope;
  readonly provider: DemoProvider;
  readonly model: string;
  readonly validationRetries: number;
  readonly traces: ValidationRetryTrace[];
}

export interface ChatErrorPayload {
  readonly error: string;
}
