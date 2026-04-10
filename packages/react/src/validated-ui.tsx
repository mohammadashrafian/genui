import { createElement } from 'react';
import type { ComponentRenderRegistry, ValidatedComponentOutput } from '@genuikit/core/client';

export interface ValidatedUIProps {
  /** The lightweight client-side component registry. */
  registry: ComponentRenderRegistry;
  /** Server-validated output to render. */
  output: ValidatedComponentOutput;
  /** Optional fallback when the client is missing a component implementation. */
  fallback?: React.ReactNode;
  /** Called when the client registry cannot resolve the component. */
  onMissingComponent?: (componentName: string) => void;
}

/**
 * Declarative renderer for server-validated GenUI output.
 */
export function ValidatedUI({
  registry,
  output,
  fallback = null,
  onMissingComponent,
}: ValidatedUIProps) {
  const result = registry.tryResolve(output);

  if (!result) {
    onMissingComponent?.(output.type);
    return fallback;
  }

  return createElement(result.component as React.FC, result.props as Record<string, unknown>);
}
