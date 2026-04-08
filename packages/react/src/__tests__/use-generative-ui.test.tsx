import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { z } from 'zod';
import { ComponentRegistry } from '@genuikit/core';
import { useGenerativeUI } from '../use-generative-ui.js';

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).optional(),
});

function StubButton({ label, variant }: { label: string; variant?: string }) {
  return <button className={variant}>{label}</button>;
}

function createTestRegistry() {
  const registry = new ComponentRegistry();
  registry.register('Button', buttonSchema, StubButton);
  return registry;
}

describe('useGenerativeUI', () => {
  it('should return null element for null output', () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() => useGenerativeUI(registry, null));

    expect(result.current.element).toBeNull();
    expect(result.current.ok).toBe(false);
    expect(result.current.correctionPrompt).toBeNull();
  });

  it('should return null for unregistered component', () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() =>
      useGenerativeUI(registry, { type: 'Unknown', props: {} }),
    );

    expect(result.current.element).toBeNull();
    expect(result.current.ok).toBe(false);
  });

  it('should return rendered element for valid output', () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() =>
      useGenerativeUI(registry, { type: 'Button', props: { label: 'Click me' } }),
    );

    expect(result.current.ok).toBe(true);
    expect(result.current.element).not.toBeNull();
    expect(result.current.correctionPrompt).toBeNull();
  });

  it('should return correction prompt for invalid output', () => {
    const registry = createTestRegistry();
    const { result } = renderHook(() =>
      useGenerativeUI(registry, { type: 'Button', props: { label: 123 } }),
    );

    expect(result.current.ok).toBe(false);
    expect(result.current.element).toBeNull();
    expect(result.current.correctionPrompt).toContain('Button');
    expect(result.current.errors).not.toBeNull();
  });

  it('should memoize result for same inputs', () => {
    const registry = createTestRegistry();
    const output = { type: 'Button' as const, props: { label: 'Test' } };

    const { result, rerender } = renderHook(() => useGenerativeUI(registry, output));
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
  });
});
