"use client";

interface Preset {
  label: string;
  description: string;
  json: string;
  category: "valid" | "error";
}

const presets: Preset[] = [
  {
    label: "Button",
    description: "Simple button with label and variant",
    category: "valid",
    json: JSON.stringify(
      {
        type: "Button",
        props: {
          label: "Click Me",
          variant: "default",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Card",
    description: "Card with title, description, and content",
    category: "valid",
    json: JSON.stringify(
      {
        type: "Card",
        props: {
          title: "Welcome to GenUIKit",
          description: "Type-safe LLM to React bridge",
          content: "Register components with Zod schemas, feed in raw LLM JSON, and get validated rendered React.",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Alert",
    description: "Alert with message and severity",
    category: "valid",
    json: JSON.stringify(
      {
        type: "Alert",
        props: {
          message: "Operation completed successfully!",
          severity: "success",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Badge",
    description: "Badge with text and variant",
    category: "valid",
    json: JSON.stringify(
      {
        type: "Badge",
        props: {
          text: "New",
          variant: "default",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Input",
    description: "Text input with label and placeholder",
    category: "valid",
    json: JSON.stringify(
      {
        type: "Input",
        props: {
          label: "Email Address",
          placeholder: "you@example.com",
          type: "email",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Invalid Props",
    description: "Wrong prop types to show error handling",
    category: "error",
    json: JSON.stringify(
      {
        type: "Button",
        props: {
          label: 12345,
          variant: "banana",
        },
      },
      null,
      2
    ),
  },
  {
    label: "Unknown Component",
    description: "Type that does not exist in the registry",
    category: "error",
    json: JSON.stringify(
      {
        type: "DataTable",
        props: {
          rows: [],
          columns: ["Name", "Age"],
        },
      },
      null,
      2
    ),
  },
  {
    label: "XSS Attempt",
    description: "Script injection in a string field",
    category: "error",
    json: JSON.stringify(
      {
        type: "Alert",
        props: {
          message: '<script>alert("xss")</script>Injected content',
          severity: "info",
        },
      },
      null,
      2
    ),
  },
];

interface PresetSelectorProps {
  onSelect: (json: string) => void;
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  const validPresets = presets.filter((p) => p.category === "valid");
  const errorPresets = presets.filter((p) => p.category === "error");

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-secondary/60 font-semibold mb-1.5 px-1">
          Components
        </div>
        <div className="flex flex-wrap gap-1.5">
          {validPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onSelect(preset.json)}
              title={preset.description}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-secondary/60 font-semibold mb-1.5 px-1">
          Error Cases
        </div>
        <div className="flex flex-wrap gap-1.5">
          {errorPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onSelect(preset.json)}
              title={preset.description}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
