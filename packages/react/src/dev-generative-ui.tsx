import { useState, useCallback } from 'react';
import type { ResolveError } from '@genui/core';
import { GenerativeUI } from './generative-ui.js';
import type { GenerativeUIProps } from './generative-ui.js';
import { ErrorOverlay } from './error-overlay.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DevGenerativeUIProps extends GenerativeUIProps {
  /**
   * Whether to show the error overlay on validation failure.
   * Defaults to `true` in development, ignored in production.
   */
  showOverlay?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Enhanced version of `GenerativeUI` that displays an {@link ErrorOverlay}
 * when schema validation fails during development.
 *
 * In production the overlay is never rendered and can be tree-shaken away,
 * making this component behave identically to the standard `GenerativeUI`.
 */
export function DevGenerativeUI({
  registry,
  output,
  fallback,
  onError,
  showOverlay = true,
}: DevGenerativeUIProps) {
  const [overlayError, setOverlayError] = useState<ResolveError | null>(null);

  const handleError = useCallback(
    (correctionPrompt: string, errors: unknown[]) => {
      // Forward to the user-supplied callback first.
      onError?.(correctionPrompt, errors);

      // In development, capture the full error for the overlay.
      if (process.env.NODE_ENV !== 'production') {
        // We reconstruct a ResolveError-shaped object from what GenerativeUI provides.
        // This is safe because GenerativeUI always calls onError with
        // the correctionPrompt and the ResolveError.errors array.
        const result = registry.tryResolve(output);
        if (result && !result.ok) {
          setOverlayError(result);
        }
      }
    },
    [onError, registry, output],
  );

  const handleDismiss = useCallback(() => {
    setOverlayError(null);
  }, []);

  return (
    <>
      <GenerativeUI
        registry={registry}
        output={output}
        fallback={fallback}
        onError={handleError}
      />
      {process.env.NODE_ENV !== 'production' &&
        showOverlay &&
        overlayError && (
          <ErrorOverlay
            error={overlayError}
            output={output}
            onDismiss={handleDismiss}
          />
        )}
    </>
  );
}
