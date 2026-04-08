/**
 * Shared types for GenUI adapters.
 */

import type { z } from 'zod';
import type { ActionSchemaMap } from '@genuikit/core';

/**
 * Accepts any valid React component regardless of its specific prop types.
 *
 * WHY `any`?  TypeScript function parameters are **contravariant** in strict
 * mode.  A real component like `(props: ButtonProps) => Element` is NOT
 * assignable to `(props: unknown) => Element` because `unknown` is wider
 * than `ButtonProps`.  There is no type `T` (other than `any`) that
 * satisfies this constraint for every possible component signature.
 *
 * This is safe because adapter registries validate all props at runtime
 * through Zod schemas before they ever reach the component.  The `any`
 * is intentionally confined to this single type alias.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = (props: any) => any;

/** Map of component name → user-provided component implementation. */
export type ComponentMap<K extends string = string> = Record<K, AnyComponent>;

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
