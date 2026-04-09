"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import { ComponentRegistry } from "@genuikit/core";
import { JsonEditor } from "./json-editor";
import { ComponentPreview, getPreviewState } from "./component-preview";
import { PresetSelector } from "./preset-selector";

// ---------------------------------------------------------------------------
// Simple playground component implementations
// ---------------------------------------------------------------------------

function PlaygroundButton({ label, variant }: { label: string; variant: string }) {
  const styles: Record<string, string> = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    outline: "border border-indigo-400 text-indigo-400 hover:bg-indigo-950",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    ghost: "text-indigo-400 hover:bg-indigo-950",
    link: "text-indigo-400 underline",
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles[variant] || styles.default}`}
    >
      {label}
    </button>
  );
}

function PlaygroundCard({
  title,
  description,
  content,
}: {
  title: string;
  description?: string;
  content?: string;
}) {
  return (
    <div className="w-72 rounded-xl border border-border bg-surface-card p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      )}
      {content && (
        <div className="mt-3 text-sm text-text-primary/80">{content}</div>
      )}
    </div>
  );
}

function PlaygroundAlert({
  message,
  severity,
}: {
  message: string;
  severity: string;
}) {
  const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-300",
      icon: "i",
    },
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-300",
      icon: "\u2713",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-300",
      icon: "!",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-300",
      icon: "\u2717",
    },
  };
  const s = styles[severity] || styles.info;
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${s.bg} ${s.border}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${s.text} bg-current/20`}
      >
        {s.icon}
      </span>
      <p className={`text-sm ${s.text}`}>{message}</p>
    </div>
  );
}

function PlaygroundBadge({
  text,
  variant,
}: {
  text: string;
  variant: string;
}) {
  const styles: Record<string, string> = {
    default: "bg-primary/20 text-primary-light border-primary/30",
    secondary: "bg-slate-700/50 text-slate-300 border-slate-600",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
    outline: "bg-transparent text-text-secondary border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant] || styles.default}`}
    >
      {text}
    </span>
  );
}

function PlaygroundInput({
  label,
  placeholder,
  type,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="w-64 flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        type={type || "text"}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
        readOnly
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registry setup
// ---------------------------------------------------------------------------

function createPlaygroundRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry();

  registry.register(
    "Button",
    z.object({
      label: z.string(),
      variant: z.enum([
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ]).optional().default("default"),
    }),
    PlaygroundButton as any
  );

  registry.register(
    "Card",
    z.object({
      title: z.string(),
      description: z.string().optional(),
      content: z.string().optional(),
    }),
    PlaygroundCard as any
  );

  registry.register(
    "Alert",
    z.object({
      message: z.string(),
      severity: z.enum(["info", "success", "warning", "error"]).optional().default("info"),
    }),
    PlaygroundAlert as any
  );

  registry.register(
    "Badge",
    z.object({
      text: z.string(),
      variant: z
        .enum(["default", "secondary", "success", "destructive", "outline"])
        .optional()
        .default("default"),
    }),
    PlaygroundBadge as any
  );

  registry.register(
    "Input",
    z.object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
      type: z.enum(["text", "email", "password", "number", "url"]).optional().default("text"),
    }),
    PlaygroundInput as any
  );

  return registry;
}

// ---------------------------------------------------------------------------
// Debug panel tabs
// ---------------------------------------------------------------------------

type DebugTab = "resolve" | "correction" | "tools";

function DebugPanel({
  registry,
  jsonInput,
}: {
  registry: ComponentRegistry;
  jsonInput: string;
}) {
  const [activeTab, setActiveTab] = useState<DebugTab>("resolve");

  const state = getPreviewState(registry, jsonInput);

  const resolveJson = useMemo(() => {
    if (state.type === "empty") return "// Enter JSON to see resolve result";
    if (state.type === "parse-error")
      return `// JSON Parse Error\n// ${state.parseError}`;
    if (!state.resolveResult) return "// No result";
    // Serialize, omitting the component function
    const { ...rest } = state.resolveResult;
    const serializable = { ...rest } as Record<string, unknown>;
    if ("component" in serializable) {
      serializable.component = "[Function]";
    }
    return JSON.stringify(serializable, null, 2);
  }, [state]);

  const correctionPrompt = useMemo(() => {
    if (
      state.type === "resolve-error" &&
      state.resolveResult &&
      !state.resolveResult.ok
    ) {
      return state.resolveResult.correctionPrompt;
    }
    return "// No correction needed — component resolved successfully.";
  }, [state]);

  const toolDefinitions = useMemo(() => {
    try {
      return JSON.stringify(registry.toToolDefinition(), null, 2);
    } catch {
      return "// Error generating tool definitions";
    }
  }, [registry]);

  const tabs: { id: DebugTab; label: string }[] = [
    { id: "resolve", label: "Resolve Result" },
    { id: "correction", label: "Correction Prompt" },
    { id: "tools", label: "Tool Definitions" },
  ];

  const content =
    activeTab === "resolve"
      ? resolveJson
      : activeTab === "correction"
        ? correctionPrompt
        : toolDefinitions;

  return (
    <div className="flex flex-col bg-surface-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "text-primary-light bg-primary/10 border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="p-4 text-xs font-mono text-text-secondary overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main playground
// ---------------------------------------------------------------------------

const DEFAULT_JSON = JSON.stringify(
  {
    type: "Button",
    props: {
      label: "Click Me",
      variant: "default",
    },
  },
  null,
  2
);

export function PlaygroundEditor() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [debouncedInput, setDebouncedInput] = useState(DEFAULT_JSON);
  const [isValidJson, setIsValidJson] = useState<boolean | null>(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registry = useMemo(() => createPlaygroundRegistry(), []);

  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);

    // Validate JSON immediately for the indicator
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(value.trim() === "" ? null : false);
    }

    // Debounce the resolve
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedInput(value);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handlePresetSelect = useCallback(
    (json: string) => {
      setJsonInput(json);
      setDebouncedInput(json);
      try {
        JSON.parse(json);
        setIsValidJson(true);
      } catch {
        setIsValidJson(false);
      }
    },
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Preset selector */}
      <div className="bg-surface-card/50 border border-border rounded-lg p-4">
        <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
          Example Presets
        </div>
        <PresetSelector onSelect={handlePresetSelect} />
      </div>

      {/* Main editor + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — JSON editor */}
        <div className="min-h-[400px]">
          <JsonEditor
            value={jsonInput}
            onChange={handleJsonChange}
            isValid={isValidJson}
          />
        </div>

        {/* Right — Rendered output */}
        <div className="min-h-[400px]">
          <ComponentPreview registry={registry} jsonInput={debouncedInput} />
        </div>
      </div>

      {/* Bottom — Debug panel */}
      <DebugPanel registry={registry} jsonInput={debouncedInput} />
    </div>
  );
}
