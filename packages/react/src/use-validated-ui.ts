import { useMemo } from 'react';
import { createElement } from 'react';
import type {
  ComponentRenderRegistry,
  RenderResolveResult,
  ValidatedComponentOutput,
} from '@genuikit/core/client';

export interface ValidatedUIResult {
  /** The resolved result from the lightweight render registry. */
  readonly result: RenderResolveResult<Record<string, unknown>> | null;
  /** The rendered React element, or null if no component was found. */
  readonly element: React.ReactElement | null;
  /** Whether a matching client component was found. */
  readonly ok: boolean;
  /** The component name that could not be rendered on the client, if any. */
  readonly missingComponent: string | null;
}

/**
 * React hook for rendering server-validated GenUI payloads without shipping
 * the schema validation runtime to the client.
 */
export function useValidatedUI(
  registry: ComponentRenderRegistry,
  output: ValidatedComponentOutput | null | undefined,
): ValidatedUIResult {
  return useMemo(() => {
    if (!output) {
      return {
        result: null,
        element: null,
        ok: false,
        missingComponent: null,
      };
    }

    const result = registry.tryResolve(output);

    if (!result) {
      return {
        result: null,
        element: null,
        ok: false,
        missingComponent: output.type,
      };
    }

    return {
      result,
      element: createElement(result.component as React.FC, result.props as Record<string, unknown>),
      ok: true,
      missingComponent: null,
    };
  }, [registry, output]);
}
