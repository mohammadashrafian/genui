import { useContext, useCallback, useMemo } from 'react';
import type { Action, ToolCallResult } from '@genuikit/core';
import { CoAgentContext } from './co-agent-context.js';
import type { CoAgentContextValue } from './co-agent-context.js';

export interface UseCoAgentResult {
  /**
   * Dispatch an action back to the AI agent.
   * Validates payload, queues the action, and triggers serialization.
   * Returns the Action if valid, null if validation failed.
   */
  readonly dispatch: (action: string, payload: unknown) => Action | null;
  /** Full action history for this session. */
  readonly history: readonly Action[];
  /** The most recent tool call result. */
  readonly lastToolCall: ToolCallResult | null;
  /** Access to the underlying queue for advanced use. */
  readonly context: CoAgentContextValue;
}

/**
 * Hook for components to send structured actions back to the AI agent.
 *
 * Must be used within a <CoAgentProvider>. The component name is bound
 * once, so dispatch() only needs the action name and payload.
 *
 * @example
 * ```tsx
 * function ContactForm({ name, email }: Props) {
 *   const { dispatch } = useCoAgent('ContactForm');
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     const data = new FormData(e.target as HTMLFormElement);
 *     dispatch('onSubmit', {
 *       name: data.get('name'),
 *       email: data.get('email'),
 *       message: data.get('message'),
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" defaultValue={name} />
 *       <input name="email" defaultValue={email} />
 *       <textarea name="message" />
 *       <button type="submit">Send</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCoAgent(componentName: string): UseCoAgentResult {
  const context = useContext(CoAgentContext);

  if (!context) {
    throw new CoAgentContextError(componentName);
  }

  // Bind the component name so callers only pass action + payload
  const dispatch = useCallback(
    (action: string, payload: unknown): Action | null => {
      return context.dispatch(componentName, action, payload);
    },
    [context, componentName],
  );

  return useMemo(
    () => ({
      dispatch,
      history: context.history,
      lastToolCall: context.lastToolCall,
      context,
    }),
    [dispatch, context],
  );
}

/** Thrown when useCoAgent is used outside a CoAgentProvider. */
export class CoAgentContextError extends Error {
  constructor(componentName: string) {
    super(
      `useCoAgent("${componentName}") must be used within a <CoAgentProvider>. ` +
      `Wrap your app with <CoAgentProvider registry={registry}>.`,
    );
    this.name = 'CoAgentContextError';
  }
}
