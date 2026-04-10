import { describe, expect, it, vi } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { z } from 'zod';
import { ComponentRegistry } from '@genuikit/core';
import { useValidatedUI } from '../use-validated-ui.js';
import { ValidatedUI } from '../validated-ui.js';

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).default('primary'),
});

function StubButton({ label, variant }: { label: string; variant: string }) {
  return <button data-variant={variant}>{label}</button>;
}

function createValidatedOutput() {
  const registry = new ComponentRegistry();
  registry.register('Button', buttonSchema, StubButton);

  const validated = registry.validateOutput({
    type: 'Button',
    props: { label: 'Trusted payload' },
  });

  if (!validated.ok) {
    throw new Error('Expected validated output in test setup.');
  }

  return {
    output: validated.output,
    renderRegistry: registry.createRenderRegistry(),
  };
}

describe('useValidatedUI', () => {
  it('renders trusted server output through the lightweight registry', () => {
    const { output, renderRegistry } = createValidatedOutput();

    const { result } = renderHook(() => useValidatedUI(renderRegistry, output));

    expect(result.current.ok).toBe(true);
    expect(result.current.element).not.toBeNull();
    expect(result.current.missingComponent).toBeNull();
  });

  it('reports a missing client component without validation errors', () => {
    const { output } = createValidatedOutput();
    const emptyRegistry = new ComponentRegistry().createRenderRegistry();

    const { result } = renderHook(() => useValidatedUI(emptyRegistry, output));

    expect(result.current.ok).toBe(false);
    expect(result.current.element).toBeNull();
    expect(result.current.missingComponent).toBe('Button');
  });
});

describe('ValidatedUI component', () => {
  it('renders the trusted payload', () => {
    const { output, renderRegistry } = createValidatedOutput();

    render(<ValidatedUI registry={renderRegistry} output={output} />);

    expect(screen.getByText('Trusted payload')).toBeDefined();
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe('primary');
  });

  it('renders fallback and notifies when the client registry is missing a component', () => {
    const { output } = createValidatedOutput();
    const emptyRegistry = new ComponentRegistry().createRenderRegistry();
    const onMissingComponent = vi.fn();

    render(
      <ValidatedUI
        registry={emptyRegistry}
        output={output}
        fallback={<div>Missing component</div>}
        onMissingComponent={onMissingComponent}
      />,
    );

    expect(screen.getByText('Missing component')).toBeDefined();
    expect(onMissingComponent).toHaveBeenCalledWith('Button');
  });
});
