export { ComponentRegistry } from './registry.js';
export type { ComponentToolDefinition } from './registry.js';
export { ComponentRenderRegistry } from './render-registry.js';
export { ComponentNotFoundError, DuplicateRegistrationError } from './errors.js';
export { generateCorrectionPrompt } from './correction.js';
export type {
  ComponentType,
  LLMComponentOutput,
  ValidatedComponentOutput,
  ValidatedOutputResult,
  ValidatedOutputSuccess,
  RegistryEntry,
  RenderRegistryEntry,
  RegistryOptions,
  RenderResolveResult,
  RenderResolveSuccess,
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
  StreamSource,
  StreamSourceConfig,
  StreamEvent,
  RetryOptions,
  WireMessage,
} from './stream/index.js';

// Action module
export {
  ActionRegistry,
  ActionNotFoundError,
  ActionSerializer,
  ActionQueue,
} from './action/index.js';

export type {
  ActionRegistryEntry,
  ActionValidationResult,
  ActionSchemaMap,
  Action,
  ToolCallResult,
  QueuedAction,
  DispatchOptions,
  ActionListener,
  ToolCallListener,
} from './action/index.js';

// Security module
export {
  SecurityPolicy,
  DEFAULT_SECURITY_POLICY,
  stripHtmlTags,
  escapeHtml,
  truncate,
  removeControlChars,
  normalizeWhitespace,
  sanitizeString,
  sanitizeHtml,
  validateUrl,
  isBlockedScheme,
  safeString,
  safeUrl,
  safeHtml,
  safeCssClass,
} from './security/index.js';

export type {
  SecurityPolicyConfig,
  SecurityViolation,
  UrlValidationResult,
} from './security/index.js';
