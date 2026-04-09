"use client";

import { createElement, type ReactNode } from "react";
import type { ComponentRegistry, ResolveResult } from "@genuikit/core";

interface ComponentPreviewProps {
  registry: ComponentRegistry;
  jsonInput: string;
}

interface PreviewState {
  type: "empty" | "parse-error" | "resolve-error" | "success";
  resolveResult?: ResolveResult;
  parseError?: string;
  rendered?: ReactNode;
}

export function getPreviewState(
  registry: ComponentRegistry,
  jsonInput: string
): PreviewState {
  const trimmed = jsonInput.trim();
  if (!trimmed) {
    return { type: "empty" };
  }

  let parsed: { type: string; props: Record<string, unknown> };
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return {
      type: "parse-error",
      parseError: e instanceof Error ? e.message : "Invalid JSON",
    };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.type !== "string" ||
    !parsed.props
  ) {
    return {
      type: "parse-error",
      parseError:
        'JSON must be an object with "type" (string) and "props" (object) fields.',
    };
  }

  // Use tryResolve which returns null for unknown components
  const result = registry.tryResolve({
    type: parsed.type,
    props: parsed.props,
  });

  if (result === null) {
    return {
      type: "resolve-error",
      resolveResult: {
        ok: false,
        name: parsed.type,
        errors: [
          {
            path: ["type"],
            message: `Component "${parsed.type}" is not registered.`,
          },
        ],
        correctionPrompt: `Component "${parsed.type}" is not registered. Available components: ${registry.names().join(", ")}.`,
      },
    };
  }

  if (!result.ok) {
    return {
      type: "resolve-error",
      resolveResult: result,
    };
  }

  try {
    const rendered = createElement(
      result.component as React.ComponentType<Record<string, unknown>>,
      result.props as Record<string, unknown>
    );
    return {
      type: "success",
      resolveResult: result,
      rendered,
    };
  } catch (e) {
    return {
      type: "resolve-error",
      resolveResult: {
        ok: false,
        name: result.name,
        errors: [
          {
            path: [],
            message: `Render error: ${e instanceof Error ? e.message : String(e)}`,
          },
        ],
        correctionPrompt: "The component threw an error during rendering.",
      },
    };
  }
}

export function ComponentPreview({
  registry,
  jsonInput,
}: ComponentPreviewProps) {
  const state = getPreviewState(registry, jsonInput);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-card border-b border-border rounded-t-lg">
        <span className="text-xs text-text-secondary font-mono">
          Rendered Output
        </span>
        <StatusBadge state={state} />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-card/50 rounded-b-lg min-h-[200px] transition-all duration-200">
        <PreviewContent state={state} />
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: PreviewState }) {
  switch (state.type) {
    case "empty":
      return (
        <span className="text-xs text-text-secondary/60 font-mono">
          Waiting for input...
        </span>
      );
    case "parse-error":
      return (
        <span className="text-xs text-red-400 font-mono">Parse Error</span>
      );
    case "resolve-error":
      return (
        <span className="text-xs text-amber-400 font-mono">
          Validation Error
        </span>
      );
    case "success":
      return (
        <span className="text-xs text-emerald-400 font-mono">Rendered</span>
      );
  }
}

function PreviewContent({ state }: { state: PreviewState }) {
  switch (state.type) {
    case "empty":
      return (
        <div className="text-text-secondary/40 text-sm text-center">
          <div className="text-3xl mb-2 opacity-40">{ }</div>
          <p>Enter LLM output JSON on the left to see the rendered component.</p>
        </div>
      );

    case "parse-error":
      return (
        <div className="w-full max-w-md">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-red-400 shrink-0"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M6 6L10 10M10 6L6 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-red-400 font-semibold text-sm">
                Invalid JSON
              </span>
            </div>
            <p className="text-red-300/80 text-xs font-mono break-all">
              {state.parseError}
            </p>
          </div>
        </div>
      );

    case "resolve-error": {
      const result = state.resolveResult;
      if (!result || result.ok) return null;
      return (
        <div className="w-full max-w-md">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-amber-400 shrink-0"
              >
                <path
                  d="M8 1L15 14H1L8 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6V9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
              </svg>
              <span className="text-amber-400 font-semibold text-sm">
                Validation Failed: {result.name}
              </span>
            </div>
            <div className="space-y-1.5">
              {result.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs font-mono"
                >
                  <span className="text-amber-400/60 shrink-0">
                    {err.path.length > 0 ? err.path.join(".") : "root"}:
                  </span>
                  <span className="text-amber-200/80">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "success":
      return (
        <div className="transition-opacity duration-200">{state.rendered}</div>
      );
  }
}
