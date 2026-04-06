/**
 * StreamResolver — Connects StreamParser to ComponentRegistry for progressive validation.
 *
 * As partial JSON arrives from the LLM stream, StreamResolver:
 * 1. Feeds chunks to the StreamParser
 * 2. Extracts the component type as soon as it appears
 * 3. Progressively validates partial props against the registry schema
 * 4. Emits StreamSnapshot events at each stage
 * 5. Produces a final validated result when the stream completes
 */

import type { ComponentRegistry } from '../registry.js';
import { StreamParser } from './stream-parser.js';
import { decodeMessage } from './wire-format.js';
import type {
  StreamSnapshot,
  StreamEvent,
  StreamSourceConfig,
  RetryOptions,
} from './types.js';
import type { AbbreviationMap } from './wire-format.js';

type StreamCallback<P> = (event: StreamEvent<P>) => void;

export interface StreamResolverOptions {
  /** The component registry to validate against. */
  readonly registry: ComponentRegistry;
  /** Wire format abbreviation map, if using compact encoding. */
  readonly abbreviations?: AbbreviationMap;
  /** How often to emit snapshots (ms). Default: 50 (20fps). */
  readonly throttleMs?: number;
  /** Retry configuration for failed streams. */
  readonly retry?: RetryOptions;
}

export class StreamResolver {
  private readonly registry: ComponentRegistry;
  private readonly abbreviations?: AbbreviationMap;
  private readonly throttleMs: number;
  private readonly retryOptions: Required<RetryOptions>;
  private readonly parser = new StreamParser();
  private abortController: AbortController | null = null;

  constructor(options: StreamResolverOptions) {
    this.registry = options.registry;
    this.abbreviations = options.abbreviations;
    this.throttleMs = options.throttleMs ?? 50;
    this.retryOptions = {
      maxRetries: options.retry?.maxRetries ?? 3,
      baseDelay: options.retry?.baseDelay ?? 1000,
      maxDelay: options.retry?.maxDelay ?? 10000,
      onRetry: options.retry?.onRetry ?? (() => true),
    };
  }

  /**
   * Start consuming a stream source. Calls the callback with progressive snapshots.
   * Returns a promise that resolves with the final snapshot.
   */
  async consume<P = Record<string, unknown>>(
    config: StreamSourceConfig,
    callback: StreamCallback<P>,
  ): Promise<StreamSnapshot<P>> {
    return this.consumeWithRetry(config, callback, 0);
  }

  /** Cancel the current stream. */
  abort(): void {
    this.abortController?.abort();
  }

  private async consumeWithRetry<P>(
    config: StreamSourceConfig,
    callback: StreamCallback<P>,
    attempt: number,
  ): Promise<StreamSnapshot<P>> {
    this.parser.reset();
    this.abortController = new AbortController();

    const combinedSignal = config.signal
      ? combineSignals(config.signal, this.abortController.signal)
      : this.abortController.signal;

    // Emit initial pending state
    let snapshot = this.createSnapshot<P>('pending');
    callback({ type: 'snapshot', data: snapshot });

    let lastEmitTime = 0;

    try {
      const source = typeof config.source === 'function' ? config.source() : config.source;
      const reader = toAsyncIterator(source);

      for await (const chunk of reader) {
        if (combinedSignal.aborted) {
          throw new StreamAbortedError('Stream was aborted');
        }

        const parsed = this.parser.push(chunk);
        if (!parsed) continue;

        // Extract component type and props from parsed object
        const { type, props } = this.extractTypeAndProps(parsed.value);

        // Calculate progress
        const progress = this.calculateProgress(type, props);

        // Determine phase
        const phase = parsed.complete ? 'complete' as const : type ? 'partial' as const : 'skeleton' as const;

        // Validate if complete
        let validatedProps: P | null = null;
        if (parsed.complete && type) {
          const result = this.registry.tryResolve({ type, props });
          if (result?.ok) {
            validatedProps = result.props as P;
          }
        }

        snapshot = {
          phase,
          type,
          partial: props as Partial<P>,
          props: validatedProps,
          progress,
          error: null,
          timestamp: Date.now(),
        };

        // Throttle snapshot emissions
        const now = Date.now();
        if (now - lastEmitTime >= this.throttleMs || parsed.complete) {
          callback({ type: 'snapshot', data: snapshot });
          lastEmitTime = now;
        }
      }

      // Stream ended — finalize
      if (!this.parser.complete) {
        // Stream ended but JSON wasn't complete — try to use what we have
        const current = this.parser.current;
        if (current) {
          const { type, props } = this.extractTypeAndProps(current);
          if (type) {
            const result = this.registry.tryResolve({ type, props });
            if (result?.ok) {
              snapshot = {
                phase: 'complete',
                type,
                partial: props as Partial<P>,
                props: result.props as P,
                progress: 1,
                error: null,
                timestamp: Date.now(),
              };
            }
          }
        }
      }

      if (snapshot.phase === 'complete') {
        callback({ type: 'complete', data: snapshot });
      }

      return snapshot;
    } catch (error) {
      if (error instanceof StreamAbortedError) {
        snapshot = this.createSnapshot<P>('error', 'Stream aborted');
        callback({ type: 'error', data: { message: 'Stream aborted', recoverable: false } });
        return snapshot;
      }

      // Retry logic
      if (attempt < this.retryOptions.maxRetries) {
        const shouldRetry = this.retryOptions.onRetry(attempt + 1, error);
        if (shouldRetry !== false) {
          const delay = Math.min(
            this.retryOptions.baseDelay * Math.pow(2, attempt),
            this.retryOptions.maxDelay,
          );
          callback({
            type: 'error',
            data: {
              message: `Stream failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryOptions.maxRetries})`,
              recoverable: true,
            },
          });
          await sleep(delay);
          return this.consumeWithRetry(config, callback, attempt + 1);
        }
      }

      const errorMsg = error instanceof Error ? error.message : 'Unknown stream error';
      snapshot = this.createSnapshot<P>('error', errorMsg);
      callback({ type: 'error', data: { message: errorMsg, recoverable: false } });
      return snapshot;
    }
  }

  private extractTypeAndProps(
    parsed: Record<string, unknown>,
  ): { type: string | null; props: Record<string, unknown> } {
    // Try wire format first: { t: "c", n: "Name", p: {...} }
    if (parsed.t === 'c' && typeof parsed.n === 'string') {
      try {
        const decoded = decodeMessage(parsed, this.abbreviations);
        return { type: decoded.type, props: decoded.props };
      } catch {
        // Fall through to standard format
      }
    }

    // Standard format: { type: "Name", props: {...} }
    const type = typeof parsed.type === 'string' ? parsed.type : null;
    const props = (typeof parsed.props === 'object' && parsed.props !== null
      ? parsed.props
      : {}) as Record<string, unknown>;

    return { type, props };
  }

  private calculateProgress(
    type: string | null,
    props: Record<string, unknown>,
  ): number {
    if (!type) return 0;

    const entry = this.registry.get(type);
    if (!entry) return 0;

    // Estimate progress based on number of props populated vs schema shape
    const shape = this.getSchemaKeys(entry.schema);
    if (shape.length === 0) return type ? 1 : 0;

    const populated = Object.keys(props).filter(
      (k) => props[k] !== undefined && props[k] !== null,
    ).length;

    return Math.min(populated / shape.length, 1);
  }

  private getSchemaKeys(schema: { _def: unknown }): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const def = schema._def as any;
    if (def.typeName === 'ZodObject' && def.shape) {
      return Object.keys(def.shape());
    }
    return [];
  }

  private createSnapshot<P>(
    phase: 'pending' | 'error',
    error?: string,
  ): StreamSnapshot<P> {
    return {
      phase,
      type: null,
      partial: {} as Partial<P>,
      props: null,
      progress: 0,
      error: error ?? null,
      timestamp: Date.now(),
    };
  }
}

// ── Utilities ───────────────────────────────────────────────

export class StreamAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StreamAbortedError';
  }
}

async function* toAsyncIterator(
  source: ReadableStream<string> | AsyncIterable<string>,
): AsyncGenerator<string> {
  if (Symbol.asyncIterator in source) {
    yield* source as AsyncIterable<string>;
    return;
  }

  const reader = (source as ReadableStream<string>).getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  if (a.aborted || b.aborted) {
    controller.abort();
    return controller.signal;
  }

  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });

  return controller.signal;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
