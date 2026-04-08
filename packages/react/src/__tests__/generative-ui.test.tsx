import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import { ComponentRegistry } from '@genuikit/core';
import { GenerativeUI } from '../generative-ui.js';

const buttonSchema = z.object({ label: z.string() });

function StubButton({ label }: { label: string }) {
  return <button>{label}</button>;
}

function createTestRegistry() {
  const registry = new ComponentRegistry();
  registry.register('Button', buttonSchema, StubButton);
  return registry;
}

describe('GenerativeUI component', () => {
  it('should render a valid component', () => {
    const registry = createTestRegistry();

    render(
      <GenerativeUI
        registry={registry}
        output={{ type: 'Button', props: { label: 'Click me' } }}
      />,
    );

    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('should render fallback for unregistered component', () => {
    const registry = createTestRegistry();

    render(
      <GenerativeUI
        registry={registry}
        output={{ type: 'Unknown', props: {} }}
        fallback={<div>Fallback</div>}
      />,
    );

    expect(screen.getByText('Fallback')).toBeDefined();
  });

  it('should render fallback and call onError for invalid props', () => {
    const registry = createTestRegistry();
    const onError = vi.fn();

    render(
      <GenerativeUI
        registry={registry}
        output={{ type: 'Button', props: { label: 123 } }}
        fallback={<div>Error</div>}
        onError={onError}
      />,
    );

    expect(screen.getByText('Error')).toBeDefined();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toContain('Button');
  });

  it('should render null when no fallback and resolution fails', () => {
    const registry = createTestRegistry();

    const { container } = render(
      <GenerativeUI
        registry={registry}
        output={{ type: 'Unknown', props: {} }}
      />,
    );

    expect(container.innerHTML).toBe('');
  });
});
