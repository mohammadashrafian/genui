/**
 * Shared types for GenUI adapters.
 */

import type { z } from 'zod';
import type { ActionSchemaMap, ComponentType } from '@genui/core';

/** Map of component name → user-provided component implementation. */
export type ComponentMap<K extends string = string> = Record<K, ComponentType<unknown>>;

/** Definition of a single adapter component: prop schema + optional action schemas. */
export interface ComponentDefinition<S extends z.ZodType = z.ZodType> {
  /** Zod schema for the component's props. */
  readonly schema: S;
  /** Action schemas for interactive components. */
  readonly actions?: ActionSchemaMap;
  /** Description for LLM tool definitions. */
  readonly description?: string;
}

/** Configuration for creating an adapter registry. */
export interface AdapterConfig {
  /** Allow re-registering components with the same name. Default: false. */
  readonly allowOverwrite?: boolean;
}
