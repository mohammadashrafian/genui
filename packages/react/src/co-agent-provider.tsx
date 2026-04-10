import { useState, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  ActionRegistry,
  ActionQueue,
  ActionSerializer,
} from '@genuikit/core/action';
import type {
  Action,
  ToolCallResult,
  DispatchOptions,
  ActionListener,
  ToolCallListener,
} from '@genuikit/core/action';
import { CoAgentContext } from './co-agent-context.js';
import type { CoAgentContextValue } from './co-agent-context.js';

export interface CoAgentProviderProps {
  /** The ActionRegistry with registered components and action schemas. */
  registry: ActionRegistry;
  /** Dispatch options: debounce, conflict strategy, queue size. */
  dispatchOptions?: DispatchOptions;
  /** Called whenever an action is dispatched. */
  onAction?: ActionListener;
  /** Called with the serialized tool call result for the LLM. */
  onToolCall?: ToolCallListener;
  /** Called when action validation fails. */
  onValidationError?: (component: string, action: string, errors: unknown[]) => void;
  children: ReactNode;
}

/**
 * CoAgentProvider wraps your app and manages the bidirectional state bridge
 * between AI-rendered UI components and the AI agent.
 *
 * It provides:
 * - Action validation against registered schemas
 * - Debouncing and conflict resolution via ActionQueue
 * - Automatic serialization to LLM tool call format
 * - Action history tracking
 *
 * @example
 * ```tsx
 * function App() {
 *   const registry = useMemo(() => {
 *     const r = new ActionRegistry();
 *     r.registerWithActions('ContactForm', propSchema, { onSubmit: submitSchema }, ContactForm);
 *     return r;
 *   }, []);
 *
 *   return (
 *     <CoAgentProvider
 *       registry={registry}
 *       dispatchOptions={{ debounceMs: 300 }}
 *       onToolCall={(result) => sendToLLM(result)}
 *     >
 *       <ChatInterface />
 *     </CoAgentProvider>
 *   );
 * }
 * ```
 */
export function CoAgentProvider({
  registry,
  dispatchOptions,
  onAction,
  onToolCall,
  onValidationError,
  children,
}: CoAgentProviderProps) {
  const [history, setHistory] = useState<Action[]>([]);
  const [lastToolCall, setLastToolCall] = useState<ToolCallResult | null>(null);

  // Stable refs for callbacks to avoid re-creating queue on every render
  const onActionRef = useRef(onAction);
  const onToolCallRef = useRef(onToolCall);
  const onValidationErrorRef = useRef(onValidationError);
  onActionRef.current = onAction;
  onToolCallRef.current = onToolCall;
  onValidationErrorRef.current = onValidationError;

  // Create serializer and queue once
  const serializer = useMemo(() => new ActionSerializer(), []);

  const queue = useMemo(() => {
    const q = new ActionQueue(dispatchOptions, serializer);

    q.onAction((action) => {
      setHistory((prev) => [...prev, action]);
      onActionRef.current?.(action);
    });

    q.onToolCall((result) => {
      setLastToolCall(result);
      onToolCallRef.current?.(result);
    });

    return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializer]);

  const dispatch = useCallback(
    (component: string, action: string, payload: unknown): Action | null => {
      const result = registry.validateAction(component, action, payload);

      if (!result.ok) {
        onValidationErrorRef.current?.(component, action, result.errors ?? []);
        return null;
      }

      if (result.action) {
        queue.push(result.action);
        return result.action;
      }

      return null;
    },
    [registry, queue],
  );

  const contextValue: CoAgentContextValue = useMemo(
    () => ({
      registry,
      queue,
      serializer,
      dispatch,
      history,
      lastToolCall,
    }),
    [registry, queue, serializer, dispatch, history, lastToolCall],
  );

  return (
    <CoAgentContext.Provider value={contextValue}>
      {children}
    </CoAgentContext.Provider>
  );
}
