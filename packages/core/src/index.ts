export { ComponentRegistry } from './registry.js';
export type { ComponentToolDefinition } from './registry.js';
export { ComponentNotFoundError, DuplicateRegistrationError } from './errors.js';
export { generateCorrectionPrompt } from './correction.js';
export type {
  ComponentType,
  LLMComponentOutput,
  RegistryEntry,
  RegistryOptions,
  ResolveError,
  ResolveResult,
  ResolveSuccess,
  ValidationError,
} from './types.js';

// Stream module
export {
  StreamParser,
  StreamResolver,
  StreamAbortedError,
  encode,
  encodeBatch,
  decode,
  decodeMessage,
  generateWireFormatPrompt,
  estimateSavings,
  WireFormatError,
} from './stream/index.js';

export type {
  ParsedChunk,
  StreamResolverOptions,
  AbbreviationMap,
  StreamPhase,
  StreamSnapshot,
  StreamSourceConfig,
  StreamEvent,
  RetryOptions,
  WireMessage,
} from './stream/index.js';
