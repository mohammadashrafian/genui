import type { z } from 'zod';

/**
 * Represents any React-like component that accepts props and returns renderable output.
 * Framework-agnostic: works with React, Preact, or any JSX-compatible library.
 */
export type ComponentType<P = Record<string, unknown>> = (props: P) => unknown;

/** A registered component entry with its schema and component reference. */
export interface RegistryEntry<S extends z.ZodType = z.ZodType> {
  readonly name: string;
  readonly schema: S;
  readonly component: ComponentType<z.infer<S>>;
}

/** Raw LLM output that maps to a registered component. */
export interface LLMComponentOutput {
  readonly type: string;
  readonly props: Record<string, unknown>;
}

/** Successful resolution result. */
export interface ResolveSuccess<P = unknown> {
  readonly ok: true;
  readonly name: string;
  readonly component: ComponentType<P>;
  readonly props: P;
}

/** Failed resolution result with structured error details. */
export interface ResolveError {
  readonly ok: false;
  readonly name: string;
  readonly errors: ValidationError[];
  readonly correctionPrompt: string;
}

export type ResolveResult<P = unknown> = ResolveSuccess<P> | ResolveError;

/** A single field-level validation error. */
export interface ValidationError {
  readonly path: (string | number)[];
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
}

/** Options for the ComponentRegistry. */
export interface RegistryOptions {
  /** When true, allows re-registering a component with the same name. Default: false. */
  readonly allowOverwrite?: boolean;
}
