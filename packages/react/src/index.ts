export { useGenerativeUI } from './use-generative-ui.js';
export type { GenerativeUIResult } from './use-generative-ui.js';
export { GenerativeUI } from './generative-ui.js';
export type { GenerativeUIProps } from './generative-ui.js';

export { useStreamingUI } from './use-streaming-ui.js';
export type { StreamingUIState, UseStreamingUIOptions } from './use-streaming-ui.js';

export { CoAgentProvider } from './co-agent-provider.js';
export type { CoAgentProviderProps } from './co-agent-provider.js';
export { useCoAgent, CoAgentContextError } from './use-co-agent.js';
export type { UseCoAgentResult } from './use-co-agent.js';
export type { CoAgentContextValue } from './co-agent-context.js';

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
  ActionRegistry,
  Action,
  ToolCallResult,
  DispatchOptions,
  ActionSchemaMap,
} from '@genui/core';
