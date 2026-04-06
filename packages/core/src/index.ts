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
