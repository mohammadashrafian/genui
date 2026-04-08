// Shared types
export type {
  AnyComponent,
  ComponentMap,
  ComponentDefinition,
  AdapterConfig,
} from './types.js';

// Shared utilities
export { createRegistryFactory, MissingComponentError } from './shared/create-registry-factory.js';
export {
  childrenSchema,
  classNameSchema,
  idSchema,
  ariaLabelSchema,
  clickActionSchema,
  changeActionSchema,
  submitActionSchema,
  openChangeActionSchema,
} from './shared/base-schemas.js';
