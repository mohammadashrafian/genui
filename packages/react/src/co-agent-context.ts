import { createContext } from 'react';
import type {
  ActionRegistry,
  ActionQueue,
  ActionSerializer,
  Action,
  ToolCallResult,
} from '@genuikit/core';

/** The shape of the CoAgent context value. */
export interface CoAgentContextValue {
  /** The action registry for validating and resolving. */
  readonly registry: ActionRegistry;
  /** The action queue for debouncing and ordering. */
  readonly queue: ActionQueue;
  /** The serializer for formatting actions as tool calls. */
  readonly serializer: ActionSerializer;
  /**
   * Dispatch a validated action from a component.
   * This is the primary way components send data back to the AI.
   */
  readonly dispatch: (component: string, action: string, payload: unknown) => Action | null;
  /** History of all dispatched actions in this session. */
  readonly history: readonly Action[];
  /** The most recent tool call result, if any. */
  readonly lastToolCall: ToolCallResult | null;
}

export const CoAgentContext = createContext<CoAgentContextValue | null>(null);
