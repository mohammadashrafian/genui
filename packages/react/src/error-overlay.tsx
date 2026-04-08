import { useState, useCallback } from 'react';
import type { ResolveError, LLMComponentOutput, ValidationError } from '@genui/core';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorOverlayProps {
  /** The resolve error returned by the registry. */
  error: ResolveError;
  /** The raw LLM output that failed validation. */
  output: LLMComponentOutput;
  /** Called when the user dismisses the overlay. */
  onDismiss?: () => void;
  /** Called when the user clicks the copy-prompt button. */
  onCopyPrompt?: () => void;
}

// ---------------------------------------------------------------------------
// Styles (defined outside the component to avoid object re-creation)
// ---------------------------------------------------------------------------

const styles = {
  overlay: {
    position: 'fixed' as const,
    bottom: 16,
    right: 16,
    zIndex: 99999,
    maxWidth: 500,
    maxHeight: '80vh',
    overflow: 'auto',
    background: '#1a1a2e',
    border: '2px solid #e74c3c',
    borderRadius: 12,
    padding: 16,
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 13,
    color: '#e0e0e0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
    lineHeight: 1.5,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700 as const,
    color: '#e74c3c',
  },

  dismissBtn: {
    background: 'transparent',
    border: 'none',
    color: '#999',
    fontSize: 18,
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },

  badge: {
    display: 'inline-block',
    background: '#e74c3c',
    color: '#fff',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600 as const,
    marginLeft: 8,
  },

  errorRow: (index: number) => ({
    padding: '8px 10px',
    borderRadius: 6,
    marginBottom: 4,
    background: index % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
  }),

  path: {
    color: '#f39c12',
    fontWeight: 600 as const,
  },

  label: {
    color: '#888',
    fontSize: 11,
    marginRight: 4,
  },

  expected: {
    color: '#2ecc71',
  },

  received: {
    color: '#e74c3c',
  },

  sectionToggle: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    color: '#bbb',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: 12,
    width: '100%',
    textAlign: 'left' as const,
    marginTop: 8,
  },

  pre: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    padding: 10,
    margin: '8px 0 0',
    overflowX: 'auto' as const,
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    color: '#ccc',
  },

  copyBtn: {
    background: '#2ecc71',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600 as const,
    marginTop: 6,
  },

  errorMessage: {
    margin: '2px 0',
    color: '#ddd',
    fontSize: 12,
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return '(root)';
  return path
    .map((segment) => (typeof segment === 'number' ? `[${segment}]` : segment))
    .join('.');
}

function ErrorRow({ error, index }: { error: ValidationError; index: number }) {
  return (
    <div style={styles.errorRow(index)} data-testid={`error-row-${index}`}>
      <div>
        <span style={styles.path}>{formatPath(error.path)}</span>
      </div>
      <div style={styles.errorMessage}>{error.message}</div>
      {error.expected !== undefined && (
        <div>
          <span style={styles.label}>expected:</span>
          <span style={styles.expected}>{error.expected}</span>
        </div>
      )}
      {error.received !== undefined && (
        <div>
          <span style={styles.label}>received:</span>
          <span style={styles.received}>{error.received}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Development-only error overlay that displays schema validation failures.
 *
 * In production (`NODE_ENV === 'production'`), this component renders `null`
 * and its code can be tree-shaken away by bundlers.
 */
export function ErrorOverlay({ error, output, onDismiss, onCopyPrompt }: ErrorOverlayProps) {
  // Production guard — allows bundlers to DCE the entire component body.
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <ErrorOverlayInner error={error} output={output} onDismiss={onDismiss} onCopyPrompt={onCopyPrompt} />;
}

function ErrorOverlayInner({ error, output, onDismiss, onCopyPrompt }: ErrorOverlayProps) {
  const [rawOpen, setRawOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const toggleRaw = useCallback(() => setRawOpen((v) => !v), []);
  const togglePrompt = useCallback(() => setPromptOpen((v) => !v), []);

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(error.correctionPrompt).catch(() => {
        // Silently fail — user can still select & copy.
      });
    }
    onCopyPrompt?.();
  }, [error.correctionPrompt, onCopyPrompt]);

  return (
    <div style={styles.overlay} role="alert" data-testid="error-overlay">
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          {error.name}
          <span style={styles.badge}>
            {error.errors.length} {error.errors.length === 1 ? 'error' : 'errors'}
          </span>
        </h3>
        <button
          style={styles.dismissBtn}
          onClick={onDismiss}
          aria-label="Dismiss error overlay"
          data-testid="dismiss-btn"
        >
          ×
        </button>
      </div>

      {/* Error list */}
      {error.errors.length > 0 ? (
        error.errors.map((err, i) => <ErrorRow key={i} error={err} index={i} />)
      ) : (
        <div style={{ color: '#888', fontSize: 12 }}>No validation errors reported.</div>
      )}

      {/* Raw Output */}
      <button
        style={styles.sectionToggle}
        onClick={toggleRaw}
        data-testid="toggle-raw"
      >
        {rawOpen ? '▾' : '▸'} Raw Output
      </button>
      {rawOpen && (
        <pre style={styles.pre} data-testid="raw-output">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}

      {/* Correction Prompt */}
      <button
        style={styles.sectionToggle}
        onClick={togglePrompt}
        data-testid="toggle-prompt"
      >
        {promptOpen ? '▾' : '▸'} Correction Prompt
      </button>
      {promptOpen && (
        <>
          <pre style={styles.pre} data-testid="correction-prompt">
            {error.correctionPrompt}
          </pre>
          <button
            style={styles.copyBtn}
            onClick={handleCopy}
            data-testid="copy-btn"
          >
            Copy Prompt
          </button>
        </>
      )}
    </div>
  );
}
