import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ResolveError, LLMComponentOutput } from '@genuikit/core';
import { ErrorOverlay } from '../error-overlay.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeError(overrides?: Partial<ResolveError>): ResolveError {
  return {
    ok: false,
    name: 'Button',
    errors: [
      {
        path: ['props', 'label'],
        message: 'Expected string, received number',
        expected: 'string',
        received: 'number',
      },
      {
        path: ['props', 'size'],
        message: 'Invalid enum value',
        expected: '"sm" | "md" | "lg"',
        received: '"xl"',
      },
    ],
    correctionPrompt: 'Please fix the Button component props.',
    ...overrides,
  };
}

const sampleOutput: LLMComponentOutput = {
  type: 'Button',
  props: { label: 123, size: 'xl' },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ErrorOverlay', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // 1. Renders error details correctly
  it('renders the component name and error count', () => {
    render(<ErrorOverlay error={makeError()} output={sampleOutput} />);

    expect(screen.getByTestId('error-overlay')).toBeDefined();
    expect(screen.getByText('Button')).toBeDefined();
    expect(screen.getByText('2 errors')).toBeDefined();
  });

  // 2. Shows all validation errors
  it('renders all validation error rows', () => {
    render(<ErrorOverlay error={makeError()} output={sampleOutput} />);

    expect(screen.getByTestId('error-row-0')).toBeDefined();
    expect(screen.getByTestId('error-row-1')).toBeDefined();
    expect(screen.getByText('props.label')).toBeDefined();
    expect(screen.getByText('props.size')).toBeDefined();
  });

  // 3. Shows raw output JSON
  it('shows raw output JSON when toggled open', () => {
    render(<ErrorOverlay error={makeError()} output={sampleOutput} />);

    // Initially hidden
    expect(screen.queryByTestId('raw-output')).toBeNull();

    // Toggle open
    fireEvent.click(screen.getByTestId('toggle-raw'));
    const pre = screen.getByTestId('raw-output');
    expect(pre).toBeDefined();
    expect(pre.textContent).toContain('"type": "Button"');
    expect(pre.textContent).toContain('"label": 123');
  });

  // 4. Shows correction prompt
  it('shows correction prompt when toggled open', () => {
    render(<ErrorOverlay error={makeError()} output={sampleOutput} />);

    expect(screen.queryByTestId('correction-prompt')).toBeNull();

    fireEvent.click(screen.getByTestId('toggle-prompt'));
    const pre = screen.getByTestId('correction-prompt');
    expect(pre.textContent).toBe('Please fix the Button component props.');
  });

  // 5. Dismiss callback works
  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorOverlay error={makeError()} output={sampleOutput} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByTestId('dismiss-btn'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  // 6. Returns null in production mode
  it('returns null when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';

    const { container } = render(
      <ErrorOverlay error={makeError()} output={sampleOutput} />,
    );

    expect(container.innerHTML).toBe('');
  });

  // 7. Handles empty errors array
  it('handles an empty errors array gracefully', () => {
    const error = makeError({ errors: [] });

    render(<ErrorOverlay error={error} output={sampleOutput} />);

    expect(screen.getByText('0 errors')).toBeDefined();
    expect(screen.getByText('No validation errors reported.')).toBeDefined();
  });

  // 8. Handles errors with missing optional fields
  it('handles errors with missing expected/received fields', () => {
    const error = makeError({
      errors: [
        {
          path: ['props', 'onClick'],
          message: 'Required',
        },
      ],
    });

    render(<ErrorOverlay error={error} output={sampleOutput} />);

    expect(screen.getByText('1 error')).toBeDefined();
    expect(screen.getByText('props.onClick')).toBeDefined();
    expect(screen.getByText('Required')).toBeDefined();
    // Should NOT render expected/received spans
    expect(screen.queryByText('expected:')).toBeNull();
    expect(screen.queryByText('received:')).toBeNull();
  });

  // 9. Copy button triggers callback
  it('calls onCopyPrompt when the copy button is clicked', () => {
    const onCopyPrompt = vi.fn();
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <ErrorOverlay
        error={makeError()}
        output={sampleOutput}
        onCopyPrompt={onCopyPrompt}
      />,
    );

    // Open the prompt section first
    fireEvent.click(screen.getByTestId('toggle-prompt'));
    fireEvent.click(screen.getByTestId('copy-btn'));

    expect(onCopyPrompt).toHaveBeenCalledOnce();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Please fix the Button component props.',
    );
  });

  // 10. Collapsible sections toggle correctly
  it('toggles collapsible sections open and closed', () => {
    render(<ErrorOverlay error={makeError()} output={sampleOutput} />);

    const rawToggle = screen.getByTestId('toggle-raw');
    const promptToggle = screen.getByTestId('toggle-prompt');

    // Both start closed
    expect(screen.queryByTestId('raw-output')).toBeNull();
    expect(screen.queryByTestId('correction-prompt')).toBeNull();

    // Open raw
    fireEvent.click(rawToggle);
    expect(screen.getByTestId('raw-output')).toBeDefined();

    // Close raw
    fireEvent.click(rawToggle);
    expect(screen.queryByTestId('raw-output')).toBeNull();

    // Open prompt
    fireEvent.click(promptToggle);
    expect(screen.getByTestId('correction-prompt')).toBeDefined();

    // Close prompt
    fireEvent.click(promptToggle);
    expect(screen.queryByTestId('correction-prompt')).toBeNull();
  });

  // 11. Shows singular "error" text for a single error
  it('shows singular "error" for a single validation error', () => {
    const error = makeError({
      errors: [
        {
          path: ['props', 'label'],
          message: 'Expected string, received number',
          expected: 'string',
          received: 'number',
        },
      ],
    });

    render(<ErrorOverlay error={error} output={sampleOutput} />);
    expect(screen.getByText('1 error')).toBeDefined();
  });

  // 12. Formats root path correctly when path is empty
  it('shows (root) for errors with an empty path', () => {
    const error = makeError({
      errors: [
        {
          path: [],
          message: 'Invalid object',
        },
      ],
    });

    render(<ErrorOverlay error={error} output={sampleOutput} />);
    expect(screen.getByText('(root)')).toBeDefined();
  });

  // 13. Formats numeric path segments with bracket notation
  it('formats numeric path segments with bracket notation', () => {
    const error = makeError({
      errors: [
        {
          path: ['items', 0, 'name'],
          message: 'Expected string',
          expected: 'string',
          received: 'undefined',
        },
      ],
    });

    render(<ErrorOverlay error={error} output={sampleOutput} />);
    expect(screen.getByText('items.[0].name')).toBeDefined();
  });
});
