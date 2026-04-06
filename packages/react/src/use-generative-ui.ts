import { useMemo } from 'react';
import { createElement } from 'react';
import type { ComponentRegistry, LLMComponentOutput, ResolveResult } from '@genui/core';

export interface GenerativeUIResult {
  /** The resolved result — either success with component/props, or error with correction prompt. */
  readonly result: ResolveResult | null;
  /** The rendered React element, or null if resolution failed or no output provided. */
  readonly element: React.ReactElement | null;
  /** Whether the resolution was successful. */
  readonly ok: boolean;
  /** The correction prompt to send back to the LLM, if validation failed. */
  readonly correctionPrompt: string | null;
  /** The validation errors, if any. */
  readonly errors: ResolveResult extends { ok: false } ? ResolveResult['errors'] : unknown[] | null;
}

/**
 * React hook that takes a ComponentRegistry and LLM output, validates the output
 * against the registered schema, and returns either a rendered React element
 * or structured error information for LLM correction.
 *
 * @example
 * ```tsx
 * function ChatMessage({ output }: { output: LLMComponentOutput }) {
 *   const { element, ok, correctionPrompt } = useGenerativeUI(registry, output);
 *
 *   if (!ok) {
 *     // Send correctionPrompt back to the LLM for retry
 *     return <ErrorFallback />;
 *   }
 *
 *   return element;
 * }
 * ```
 */
export function useGenerativeUI(
  registry: ComponentRegistry,
  output: LLMComponentOutput | null | undefined,
): GenerativeUIResult {
  return useMemo(() => {
    if (!output) {
      return { result: null, element: null, ok: false, correctionPrompt: null, errors: null };
    }

    const result = registry.tryResolve(output);

    if (!result) {
      return { result: null, element: null, ok: false, correctionPrompt: null, errors: null };
    }

    if (result.ok) {
      const element = createElement(result.component as React.FC, result.props as Record<string, unknown>);
      return { result, element, ok: true, correctionPrompt: null, errors: null };
    }

    return {
      result,
      element: null,
      ok: false,
      correctionPrompt: result.correctionPrompt,
      errors: result.errors,
    };
  }, [registry, output]);
}
