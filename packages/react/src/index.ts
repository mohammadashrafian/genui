export { useGenerativeUI } from './use-generative-ui.js';
export type { GenerativeUIResult } from './use-generative-ui.js';
export { GenerativeUI } from './generative-ui.js';
export type { GenerativeUIProps } from './generative-ui.js';

export { useStreamingUI } from './use-streaming-ui.js';
export type { StreamingUIState, UseStreamingUIOptions } from './use-streaming-ui.js';

// Re-export core types for convenience
export type {
  ComponentRegistry,
  LLMComponentOutput,
  ResolveResult,
  ResolveSuccess,
  ResolveError,
  ValidationError,
  StreamSnapshot,
  StreamPhase,
} from '@genui/core';
