import type { z } from 'zod';

/**
 * Defines what interactions a component can emit back to the AI.
 * Each key is an action name (e.g., 'onSubmit', 'onClick'),
 * and the value is a Zod schema validating the action payload.
 */
export type ActionSchemaMap = Record<string, z.ZodType>;

/** A single dispatched action from a UI component. */
export interface Action<T = unknown> {
  /** The component that emitted the action. */
  readonly component: string;
  /** The action name (e.g., 'onSubmit', 'onClick'). */
  readonly action: string;
  /** The validated payload. */
  readonly payload: T;
  /** Timestamp when the action was dispatched. */
  readonly timestamp: number;
  /** Unique action ID for deduplication. */
  readonly id: string;
}

/** An action formatted as an LLM tool call result. */
export interface ToolCallResult {
  /** Tool name — maps to the component + action. */
  readonly tool: string;
  /** The structured result to send to the LLM. */
  readonly result: Record<string, unknown>;
  /** ISO timestamp. */
  readonly timestamp: string;
}

/** Pending action waiting in the queue. */
export interface QueuedAction<T = unknown> extends Action<T> {
  /** Current status in the queue. */
  status: 'pending' | 'dispatched' | 'failed';
}

/** Configuration for action dispatch behavior. */
export interface DispatchOptions {
  /** Debounce delay in ms for rapid interactions. Default: 0 (no debounce). */
  readonly debounceMs?: number;
  /** Maximum queue size. Oldest actions are dropped when exceeded. Default: 100. */
  readonly maxQueueSize?: number;
  /** Strategy when conflicting actions arrive. Default: 'latest'. */
  readonly conflictStrategy?: 'latest' | 'first' | 'merge';
}

/** Listener for action events. */
export type ActionListener = (action: Action) => void;

/** Listener for tool call results (formatted for LLM). */
export type ToolCallListener = (result: ToolCallResult) => void;
