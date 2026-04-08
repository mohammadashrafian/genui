import { useState, useCallback, useRef, useEffect } from 'react';
import { createElement } from 'react';
import type {
  ComponentRegistry,
  StreamSnapshot,
  StreamEvent,
  StreamSourceConfig,
  RetryOptions,
} from '@genuikit/core';
import { StreamResolver } from '@genuikit/core';
import type { AbbreviationMap } from '@genuikit/core';

export interface StreamingUIState<P = Record<string, unknown>> {
  /** Current stream snapshot with phase, partial props, and progress. */
  readonly snapshot: StreamSnapshot<P>;
  /** The rendered React element at the current state. */
  readonly element: React.ReactElement | null;
  /** Whether the stream is actively receiving data. */
  readonly isStreaming: boolean;
  /** Whether the stream completed successfully. */
  readonly isComplete: boolean;
  /** Whether the stream encountered an error. */
  readonly isError: boolean;
  /** Error message if streaming failed. */
  readonly error: string | null;
  /** Start consuming a new stream source. */
  readonly start: (source: StreamSourceConfig['source'], signal?: AbortSignal) => Promise<void>;
  /** Abort the current stream. */
  readonly abort: () => void;
  /** Reset state to initial. */
  readonly reset: () => void;
}

export interface UseStreamingUIOptions {
  /** Wire format abbreviation map. */
  readonly abbreviations?: AbbreviationMap;
  /** Snapshot throttle interval in ms. Default: 50. */
  readonly throttleMs?: number;
  /** Retry configuration. */
  readonly retry?: RetryOptions;
  /** Component to render during skeleton phase. */
  readonly skeleton?: React.ReactElement;
  /** Component to render during error phase. */
  readonly fallback?: React.ReactElement;
  /** Called when a new snapshot is emitted. */
  readonly onSnapshot?: (snapshot: StreamSnapshot) => void;
  /** Called when the stream completes. */
  readonly onComplete?: (snapshot: StreamSnapshot) => void;
  /** Called when the stream errors. */
  readonly onError?: (error: string, recoverable: boolean) => void;
}

const INITIAL_SNAPSHOT: StreamSnapshot = {
  phase: 'pending',
  type: null,
  partial: {},
  props: null,
  progress: 0,
  error: null,
  timestamp: Date.now(),
};

/**
 * React hook for streaming LLM-driven UI rendering.
 *
 * Connects to an LLM stream (SSE, WebSocket, or any async source) and
 * progressively renders components as tokens arrive:
 *
 *   pending → skeleton → partial → complete
 *
 * @example
 * ```tsx
 * function StreamingChat() {
 *   const { element, isStreaming, start, snapshot } = useStreamingUI(registry, {
 *     skeleton: <Skeleton />,
 *     onComplete: (snap) => console.log('Done:', snap.props),
 *   });
 *
 *   const handleSend = async (message: string) => {
 *     const response = await fetch('/api/chat', {
 *       method: 'POST',
 *       body: JSON.stringify({ message }),
 *     });
 *     await start(response.body!.pipeThrough(new TextDecoderStream()));
 *   };
 *
 *   return (
 *     <div>
 *       {isStreaming && <div>Progress: {Math.round(snapshot.progress * 100)}%</div>}
 *       {element}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStreamingUI<P = Record<string, unknown>>(
  registry: ComponentRegistry,
  options: UseStreamingUIOptions = {},
): StreamingUIState<P> {
  const [snapshot, setSnapshot] = useState<StreamSnapshot<P>>(
    INITIAL_SNAPSHOT as StreamSnapshot<P>,
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const resolverRef = useRef<StreamResolver | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resolverRef.current?.abort();
    };
  }, []);

  const start = useCallback(
    async (source: StreamSourceConfig['source'], signal?: AbortSignal) => {
      // Abort any existing stream
      resolverRef.current?.abort();

      const resolver = new StreamResolver({
        registry,
        abbreviations: optionsRef.current.abbreviations,
        throttleMs: optionsRef.current.throttleMs,
        retry: optionsRef.current.retry,
      });
      resolverRef.current = resolver;

      setIsStreaming(true);
      setSnapshot(INITIAL_SNAPSHOT as StreamSnapshot<P>);

      const callback = (event: StreamEvent<P>) => {
        switch (event.type) {
          case 'snapshot':
            setSnapshot(event.data);
            optionsRef.current.onSnapshot?.(event.data as StreamSnapshot);
            break;
          case 'complete':
            setSnapshot(event.data);
            setIsStreaming(false);
            optionsRef.current.onComplete?.(event.data as StreamSnapshot);
            break;
          case 'error':
            optionsRef.current.onError?.(event.data.message, event.data.recoverable);
            if (!event.data.recoverable) {
              setIsStreaming(false);
            }
            break;
        }
      };

      try {
        const final = await resolver.consume<P>({ source, signal }, callback);
        setSnapshot(final);
      } finally {
        setIsStreaming(false);
      }
    },
    [registry],
  );

  const abort = useCallback(() => {
    resolverRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    resolverRef.current?.abort();
    setIsStreaming(false);
    setSnapshot(INITIAL_SNAPSHOT as StreamSnapshot<P>);
  }, []);

  // Build the React element based on current snapshot
  const element = buildElement(registry, snapshot, options);

  return {
    snapshot,
    element,
    isStreaming,
    isComplete: snapshot.phase === 'complete',
    isError: snapshot.phase === 'error',
    error: snapshot.error,
    start,
    abort,
    reset,
  };
}

/** Build the appropriate React element for the current snapshot phase. */
function buildElement<P>(
  registry: ComponentRegistry,
  snapshot: StreamSnapshot<P>,
  options: UseStreamingUIOptions,
): React.ReactElement | null {
  switch (snapshot.phase) {
    case 'pending':
      return null;

    case 'skeleton':
      return options.skeleton ?? null;

    case 'partial': {
      if (!snapshot.type) return options.skeleton ?? null;
      // Render with partial props — the component should handle missing props gracefully
      const entry = registry.get(snapshot.type);
      if (!entry) return options.skeleton ?? null;
      return createElement(
        entry.component as React.FC,
        snapshot.partial as Record<string, unknown>,
      );
    }

    case 'complete': {
      if (!snapshot.type || !snapshot.props) return options.fallback ?? null;
      const entry = registry.get(snapshot.type);
      if (!entry) return options.fallback ?? null;
      return createElement(
        entry.component as React.FC,
        snapshot.props as Record<string, unknown>,
      );
    }

    case 'error':
      return options.fallback ?? null;

    default:
      return null;
  }
}
