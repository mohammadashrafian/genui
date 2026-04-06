import { createElement } from 'react';
import type { ComponentRegistry, LLMComponentOutput } from '@genui/core';

export interface GenerativeUIProps {
  /** The component registry to resolve against. */
  registry: ComponentRegistry;
  /** The LLM output to render. */
  output: LLMComponentOutput;
  /** Optional fallback to render when resolution fails. */
  fallback?: React.ReactNode;
  /** Optional callback when validation fails, receives the correction prompt. */
  onError?: (correctionPrompt: string, errors: unknown[]) => void;
}

/**
 * Declarative component that resolves LLM output and renders the matched component.
 * Provides a simpler API than the hook for basic use cases.
 *
 * @example
 * ```tsx
 * <GenerativeUI
 *   registry={registry}
 *   output={{ type: 'Button', props: { label: 'Click' } }}
 *   fallback={<div>Failed to render</div>}
 *   onError={(prompt) => sendToLLM(prompt)}
 * />
 * ```
 */
export function GenerativeUI({ registry, output, fallback = null, onError }: GenerativeUIProps) {
  const result = registry.tryResolve(output);

  if (!result) {
    return fallback;
  }

  if (result.ok) {
    return createElement(result.component as React.FC, result.props as Record<string, unknown>);
  }

  onError?.(result.correctionPrompt, result.errors);
  return fallback;
}
