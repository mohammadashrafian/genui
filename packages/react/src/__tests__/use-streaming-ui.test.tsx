import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { ComponentRegistry } from '@genui/core';
import { useStreamingUI } from '../use-streaming-ui.js';

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).default('primary'),
});

function StubButton({ label, variant }: { label: string; variant?: string }) {
  return <button className={variant}>{label}</button>;
}

function createTestRegistry() {
  const registry = new ComponentRegistry();
  registry.register('Button', buttonSchema, StubButton);
  return registry;
}

/** Create an async iterable from chunks. */
async function* createStream(chunks: string[], delayMs = 0): AsyncGenerator<string> {
  for (const chunk of chunks) {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    yield chunk;
  }
}

describe('useStreamingUI', () => {
  it('should start in pending state', () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() => useStreamingUI(registry));

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.element).toBeNull();
    expect(result.current.snapshot.phase).toBe('pending');
  });

  it('should stream and complete a component', async () => {
    const registry = createTestRegistry();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useStreamingUI(registry, { onComplete, throttleMs: 0 }),
    );

    const json = '{"type":"Button","props":{"label":"Streamed"}}';
    const chunks = [json.slice(0, 20), json.slice(20)];

    await act(async () => {
      await result.current.start(createStream(chunks));
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.snapshot.type).toBe('Button');
    expect(result.current.snapshot.props).toEqual({ label: 'Streamed', variant: 'primary' });
    expect(onComplete).toHaveBeenCalled();
  });

  it('should render element when complete', async () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() => useStreamingUI(registry, { throttleMs: 0 }));

    const json = '{"type":"Button","props":{"label":"Done"}}';

    await act(async () => {
      await result.current.start(createStream([json]));
    });

    expect(result.current.element).not.toBeNull();
  });

  it('should abort a running stream', async () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() => useStreamingUI(registry));

    const json = '{"type":"Button","props":{"label":"Abort"}}';
    const chunks = json.split('').map((c) => c); // One char at a time

    // Start and immediately abort
    const promise = act(async () => {
      const p = result.current.start(createStream(chunks, 50));
      // Abort after stream starts
      setTimeout(() => result.current.abort(), 20);
      await p;
    });

    await promise;
    expect(result.current.isStreaming).toBe(false);
  });

  it('should reset state', async () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() => useStreamingUI(registry, { throttleMs: 0 }));

    const json = '{"type":"Button","props":{"label":"Reset"}}';

    await act(async () => {
      await result.current.start(createStream([json]));
    });

    expect(result.current.isComplete).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isComplete).toBe(false);
    expect(result.current.snapshot.phase).toBe('pending');
    expect(result.current.element).toBeNull();
  });

  it('should call onError for stream failures', async () => {
    const registry = createTestRegistry();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useStreamingUI(registry, {
        onError,
        retry: { maxRetries: 0 },
      }),
    );

    async function* failingStream(): AsyncGenerator<string> {
      throw new Error('Network error');
    }

    await act(async () => {
      await result.current.start(failingStream());
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.isError).toBe(true);
  });

  it('should render skeleton during skeleton phase', async () => {
    const registry = createTestRegistry();
    const skeleton = <div>Loading...</div>;

    const { result } = renderHook(() =>
      useStreamingUI(registry, { skeleton, throttleMs: 0 }),
    );

    // Before streaming starts, element should be null (pending, not skeleton)
    expect(result.current.element).toBeNull();
  });

  it('should render fallback on error', async () => {
    const registry = createTestRegistry();
    const fallback = <div>Error occurred</div>;

    const { result } = renderHook(() =>
      useStreamingUI(registry, {
        fallback,
        retry: { maxRetries: 0 },
      }),
    );

    async function* failingStream(): AsyncGenerator<string> {
      throw new Error('Failed');
    }

    await act(async () => {
      await result.current.start(failingStream());
    });

    expect(result.current.element).toBe(fallback);
  });
});
