/** The lifecycle state of a streaming component. */
export type StreamPhase = 'pending' | 'skeleton' | 'partial' | 'complete' | 'error';

/** A snapshot of a component being progressively built from a stream. */
export interface StreamSnapshot<P = Record<string, unknown>> {
  /** Current phase of the stream. */
  readonly phase: StreamPhase;
  /** The component type name from the LLM. Available once parsing begins. */
  readonly type: string | null;
  /** Partial props parsed so far. Grows as tokens arrive. */
  readonly partial: Partial<P>;
  /** Fully validated props. Only set when phase is 'complete'. */
  readonly props: P | null;
  /** Percentage of expected props populated (0-1). */
  readonly progress: number;
  /** Error message if phase is 'error'. */
  readonly error: string | null;
  /** Timestamp of this snapshot. */
  readonly timestamp: number;
}

export type StreamSource = ReadableStream<string> | AsyncIterable<string>;

/** Configuration for a stream source. */
export interface StreamSourceConfig {
  /** The ReadableStream or async iterable of string chunks, or a factory that creates one (required for retries). */
  readonly source: StreamSource | (() => StreamSource);
  /** Optional abort signal to cancel the stream. */
  readonly signal?: AbortSignal;
}

/** Events emitted by the StreamResolver. */
export type StreamEvent<P = Record<string, unknown>> =
  | { readonly type: 'snapshot'; readonly data: StreamSnapshot<P> }
  | { readonly type: 'complete'; readonly data: StreamSnapshot<P> }
  | { readonly type: 'error'; readonly data: { message: string; recoverable: boolean } };

/** Options for retry behavior. */
export interface RetryOptions {
  /** Maximum number of retry attempts. Default: 3. */
  readonly maxRetries?: number;
  /** Base delay in ms between retries (exponential backoff). Default: 1000. */
  readonly baseDelay?: number;
  /** Maximum delay in ms. Default: 10000. */
  readonly maxDelay?: number;
  /** Called before each retry. Return false to abort. */
  readonly onRetry?: (attempt: number, error: unknown) => boolean | void;
}

/** Wire format message for token-efficient LLM communication. */
export interface WireMessage {
  /** Short type identifier: 'c' = component. */
  readonly t: 'c';
  /** Component name. */
  readonly n: string;
  /** Props object. */
  readonly p: Record<string, unknown>;
}
