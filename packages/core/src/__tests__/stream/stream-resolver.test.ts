import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { ComponentRegistry } from '../../registry.js';
import { StreamResolver } from '../../stream/stream-resolver.js';
import type { StreamEvent, StreamSnapshot } from '../../stream/types.js';

// ── Helpers ──────────────────────────────────────────────────

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).default('primary'),
});

const StubButton = (props: { label: string }) => props;

function createRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();
  registry.register('Button', buttonSchema, StubButton);
  return registry;
}

/** Create an async iterable from an array of string chunks with optional delays. */
async function* createStream(chunks: string[], delayMs = 0): AsyncGenerator<string> {
  for (const chunk of chunks) {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    yield chunk;
  }
}

/** Simulate LLM token-by-token streaming of a JSON string. */
function tokenize(json: string, chunkSize = 5): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < json.length; i += chunkSize) {
    chunks.push(json.slice(i, i + chunkSize));
  }
  return chunks;
}

// ── Tests ────────────────────────────────────────────────────

describe('StreamResolver', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = createRegistry();
  });

  it('should resolve a complete streamed component', async () => {
    const resolver = new StreamResolver({ registry });
    const json = '{"type":"Button","props":{"label":"Click me"}}';
    const chunks = tokenize(json);
    const events: StreamEvent[] = [];

    const final = await resolver.consume(
      { source: createStream(chunks) },
      (e) => events.push(e),
    );

    expect(final.phase).toBe('complete');
    expect(final.type).toBe('Button');
    expect(final.props).toEqual({ label: 'Click me', variant: 'primary' });
  });

  it('should emit progressive snapshots', async () => {
    const resolver = new StreamResolver({ registry, throttleMs: 0 });
    const json = '{"type":"Button","props":{"label":"Hello"}}';
    const chunks = tokenize(json, 3); // Small chunks for many snapshots
    const snapshots: StreamSnapshot[] = [];

    await resolver.consume(
      { source: createStream(chunks) },
      (e) => {
        if (e.type === 'snapshot' || e.type === 'complete') {
          snapshots.push(e.data);
        }
      },
    );

    // Should have multiple snapshots showing progression
    expect(snapshots.length).toBeGreaterThan(1);

    // First snapshot should be pending
    expect(snapshots[0]!.phase).toBe('pending');

    // Last snapshot should be complete
    const last = snapshots[snapshots.length - 1]!;
    expect(last.phase).toBe('complete');
  });

  it('should track progress from 0 to 1', async () => {
    const resolver = new StreamResolver({ registry, throttleMs: 0 });
    const json = '{"type":"Button","props":{"label":"Hello"}}';
    const chunks = tokenize(json, 3);
    const progresses: number[] = [];

    await resolver.consume(
      { source: createStream(chunks) },
      (e) => {
        if (e.type === 'snapshot' || e.type === 'complete') {
          progresses.push(e.data.progress);
        }
      },
    );

    // Progress should start at 0
    expect(progresses[0]).toBe(0);

    // Progress should end at a positive value
    const lastProgress = progresses[progresses.length - 1]!;
    expect(lastProgress).toBeGreaterThan(0);
  });

  it('should handle wire format input', async () => {
    const resolver = new StreamResolver({ registry, throttleMs: 0 });
    const json = '{"t":"c","n":"Button","p":{"label":"Wire"}}';
    const events: StreamEvent[] = [];

    const final = await resolver.consume(
      { source: createStream([json]) },
      (e) => events.push(e),
    );

    expect(final.type).toBe('Button');
    expect(final.props).toEqual({ label: 'Wire', variant: 'primary' });
  });

  it('should handle abort', async () => {
    const resolver = new StreamResolver({ registry });
    const events: StreamEvent[] = [];

    // Create a slow stream
    const slowStream = createStream(
      tokenize('{"type":"Button","props":{"label":"Slow"}}', 2),
      50,
    );

    // Abort after a short delay
    setTimeout(() => resolver.abort(), 30);

    const final = await resolver.consume(
      { source: slowStream },
      (e) => events.push(e),
    );

    expect(final.phase).toBe('error');
    expect(final.error).toContain('aborted');
  });

  it('should handle AbortSignal', async () => {
    const resolver = new StreamResolver({ registry });
    const controller = new AbortController();
    const events: StreamEvent[] = [];

    const slowStream = createStream(
      tokenize('{"type":"Button","props":{"label":"Signal"}}', 2),
      50,
    );

    setTimeout(() => controller.abort(), 30);

    const final = await resolver.consume(
      { source: slowStream, signal: controller.signal },
      (e) => events.push(e),
    );

    expect(final.phase).toBe('error');
  });

  describe('retry logic', () => {
    it('should retry on stream failure', async () => {
      let attempt = 0;
      const resolver = new StreamResolver({
        registry,
        retry: { maxRetries: 2, baseDelay: 10, maxDelay: 50 },
      });

      // Use a factory so each retry gets a fresh stream
      const sourceFactory = () => {
        async function* stream(): AsyncGenerator<string> {
          attempt++;
          if (attempt < 3) {
            yield '{"type":';
            throw new Error('Connection lost');
          }
          yield '{"type":"Button","props":{"label":"Retry"}}';
        }
        return stream();
      };

      const events: StreamEvent[] = [];
      const final = await resolver.consume(
        { source: sourceFactory },
        (e) => events.push(e),
      );

      // Should have retried and eventually succeeded
      expect(attempt).toBe(3);
    });

    it('should respect maxRetries', async () => {
      const resolver = new StreamResolver({
        registry,
        retry: { maxRetries: 1, baseDelay: 10 },
      });

      const sourceFactory = () => {
        async function* stream(): AsyncGenerator<string> {
          throw new Error('Always fails');
        }
        return stream();
      };

      const events: StreamEvent[] = [];
      const final = await resolver.consume(
        { source: sourceFactory },
        (e) => events.push(e),
      );

      expect(final.phase).toBe('error');
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn(() => true);
      const resolver = new StreamResolver({
        registry,
        retry: { maxRetries: 2, baseDelay: 10, onRetry },
      });

      const sourceFactory = () => {
        async function* stream(): AsyncGenerator<string> {
          throw new Error('Fail');
        }
        return stream();
      };

      await resolver.consume(
        { source: sourceFactory },
        () => {},
      );

      expect(onRetry).toHaveBeenCalled();
    });

    it('should stop retrying when onRetry returns false', async () => {
      let attempts = 0;
      const resolver = new StreamResolver({
        registry,
        retry: {
          maxRetries: 5,
          baseDelay: 10,
          onRetry: () => {
            attempts++;
            return false;
          },
        },
      });

      const sourceFactory = () => {
        async function* stream(): AsyncGenerator<string> {
          throw new Error('Fail');
        }
        return stream();
      };

      const final = await resolver.consume(
        { source: sourceFactory },
        () => {},
      );

      expect(attempts).toBe(1);
      expect(final.phase).toBe('error');
    });
  });

  describe('snapshot throttling', () => {
    it('should throttle snapshots when throttleMs is set', async () => {
      const resolver = new StreamResolver({ registry, throttleMs: 100 });
      const json = '{"type":"Button","props":{"label":"Throttle"}}';
      const chunks = tokenize(json, 1); // Many tiny chunks
      const snapshots: StreamSnapshot[] = [];

      await resolver.consume(
        { source: createStream(chunks, 1) },
        (e) => {
          if (e.type === 'snapshot') snapshots.push(e.data);
        },
      );

      // With throttling, we should have fewer snapshots than chunks
      expect(snapshots.length).toBeLessThan(chunks.length);
    });
  });
});
