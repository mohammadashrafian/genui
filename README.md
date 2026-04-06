<p align="center">
  <img src="https://img.shields.io/badge/GenUI-v0.1.0-blue?style=for-the-badge" alt="GenUI Version" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Tests-31%20Passing-brightgreen?style=for-the-badge" alt="Tests Passing" />
</p>

<h1 align="center">GenUI</h1>

<p align="center">
  <strong>A type-safe bridge between LLM outputs and your React components.</strong>
</p>


<p align="center">
  Register your components with Zod schemas. Feed in raw LLM JSON.<br/>
  Get validated, rendered React components — or a correction prompt to fix the AI.
</p>

---

## The Problem

LLMs generate JSON. Your UI needs components. The gap between them is **unsafe, untyped, and fragile**.

```
LLM Output (unpredictable JSON) → ??? → Your React Components (need typed props)
```

Without GenUI, you write brittle `if/else` chains, skip validation, and pray the AI doesn't hallucinate invalid props. When it does — and it will — your app crashes with cryptic errors.

## The Solution

GenUI is a **tiny, zero-config library** that sits between your LLM and your components:

```
LLM Output → GenUI Registry → Zod Validation → Typed React Component
                                    ↓ (on failure)
                              Correction Prompt → Back to LLM → Retry
```

**Register once. Validate automatically. Render safely.**

---

## Features

- **Type-Safe Registry** — Register components with Zod schemas. TypeScript infers prop types automatically.
- **Runtime Validation** — Every LLM output is validated before it touches the DOM. No unsafe data gets through.
- **Auto-Correction** — When validation fails, GenUI generates a structured prompt telling the LLM exactly what to fix.
- **Tool Definitions** — Auto-generate JSON Schema descriptions of your components to send to the LLM.
- **React Hooks** — `useGenerativeUI` hook and `<GenerativeUI />` component for seamless integration.
- **Framework-Agnostic Core** — The validation engine is pure TypeScript. React hooks are a separate package.
- **Lightweight** — ~7KB core + ~1KB React. Zero runtime dependencies beyond Zod.

---

## Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm add @genui/core @genui/react zod

# Using npm
npm install @genui/core @genui/react zod

# Using yarn
yarn add @genui/core @genui/react zod
```

### 1. Define Your Component + Schema

```tsx
// components/weather-card.tsx
import { z } from 'zod';

// Define the schema — this is the contract between your LLM and your component
export const weatherCardSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
  humidity: z.number().min(0).max(100).optional(),
});

// Your regular React component — nothing special needed
export function WeatherCard({ city, temperature, unit, condition, humidity }: z.infer<typeof weatherCardSchema>) {
  const icon = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️' }[condition];

  return (
    <div className="weather-card">
      <h3>{icon} {city}</h3>
      <p className="temp">{temperature}°{unit === 'celsius' ? 'C' : 'F'}</p>
      <p>{condition}</p>
      {humidity !== undefined && <p>Humidity: {humidity}%</p>}
    </div>
  );
}
```

### 2. Create a Registry

```tsx
// registry.ts
import { ComponentRegistry } from '@genui/core';
import { WeatherCard, weatherCardSchema } from './components/weather-card';
import { StockTicker, stockTickerSchema } from './components/stock-ticker';
import { AlertBanner, alertBannerSchema } from './components/alert-banner';

export const registry = new ComponentRegistry();

// Register all your AI-renderable components
registry
  .register('WeatherCard', weatherCardSchema, WeatherCard)
  .register('StockTicker', stockTickerSchema, StockTicker)
  .register('AlertBanner', alertBannerSchema, AlertBanner);
```

### 3. Render LLM Output

```tsx
// chat-message.tsx
import { useGenerativeUI } from '@genui/react';
import { registry } from './registry';

function ChatMessage({ llmOutput }) {
  // llmOutput = { type: 'WeatherCard', props: { city: 'Tokyo', temperature: 22, condition: 'sunny' } }
  const { element, ok, correctionPrompt } = useGenerativeUI(registry, llmOutput);

  if (!ok) {
    // Validation failed — send correctionPrompt back to the LLM
    console.log('Sending correction to LLM:', correctionPrompt);
    return <div className="error">Rendering failed. Retrying...</div>;
  }

  // Fully validated, type-safe React element
  return element;
}
```

**That's it.** Three steps. Your LLM output is now validated and rendered safely.

---

## Core Concepts

### The Registry Pattern

The `ComponentRegistry` is the central piece. Think of it as a **lookup table** that maps:

```
Component Name → Zod Schema + React Component
```

When LLM output arrives, GenUI:
1. Looks up the component by `type`
2. Validates `props` against the Zod schema
3. Returns the component + validated props, or an error with a correction prompt

```tsx
import { ComponentRegistry } from '@genui/core';
import { z } from 'zod';

const registry = new ComponentRegistry();

// Register: name, schema, component
registry.register('Button', z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).default('primary'),
  disabled: z.boolean().default(false),
}), ButtonComponent);
```

### Resolving LLM Output

```tsx
// This is what your LLM returns (e.g., from a tool call)
const llmOutput = {
  type: 'Button',
  props: { label: 'Submit Order', variant: 'primary' }
};

const result = registry.resolve(llmOutput);

if (result.ok) {
  // ✅ Valid! Use result.component and result.props
  console.log(result.name);       // 'Button'
  console.log(result.props);      // { label: 'Submit Order', variant: 'primary', disabled: false }
  console.log(result.component);  // ButtonComponent
} else {
  // ❌ Invalid! Get the correction prompt
  console.log(result.errors);           // [{ path: ['label'], message: '...' }]
  console.log(result.correctionPrompt); // Structured prompt for the LLM
}
```

### Auto-Correction Prompts

This is where GenUI shines. When the LLM produces invalid props, instead of crashing, you get a **ready-to-send correction prompt**:

```tsx
const badOutput = {
  type: 'Button',
  props: { label: 123, variant: 'invalid' }  // Wrong types!
};

const result = registry.resolve(badOutput);

if (!result.ok) {
  console.log(result.correctionPrompt);
}
```

Output:
```
The props you provided for component "Button" failed validation.

Errors:
  - "label": Expected string, received number, expected: string, received: number
  - "variant": Invalid enum value. Expected 'primary' | 'secondary', received: invalid

Expected schema:
{
  label: string
  variant?: "primary" | "secondary"
  disabled?: boolean
}

Please provide corrected props for "Button" as a valid JSON object matching the schema above.
```

Send this back to the LLM and it will self-correct. This creates a **self-healing loop**:

```
LLM → Invalid JSON → GenUI validates → Correction prompt → LLM retries → Valid JSON → Render
```

### Tool Definitions for LLMs

Tell the LLM what components are available:

```tsx
const tools = registry.toToolDefinition();
console.log(JSON.stringify(tools, null, 2));
```

Output:
```json
[
  {
    "name": "Button",
    "schema": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "variant": { "type": "string", "enum": ["primary", "secondary"], "default": "primary" },
        "disabled": { "type": "boolean", "default": false }
      },
      "required": ["label"]
    }
  }
]
```

Include this in your system prompt so the LLM knows exactly what props to produce.

---

## API Reference

### `@genui/core`

#### `ComponentRegistry`

```tsx
import { ComponentRegistry } from '@genui/core';

const registry = new ComponentRegistry(options?: RegistryOptions);
```

| Option | Type | Default | Description |
|---|---|---|---|
| `allowOverwrite` | `boolean` | `false` | Allow re-registering a component with the same name |

**Methods:**

| Method | Returns | Description |
|---|---|---|
| `register(name, schema, component)` | `this` | Register a component. Chainable. |
| `unregister(name)` | `boolean` | Remove a component. Returns `true` if found. |
| `resolve(output)` | `ResolveResult` | Validate LLM output. Returns success or error. |
| `tryResolve(output)` | `ResolveResult \| null` | Like `resolve`, but returns `null` for unregistered names. |
| `has(name)` | `boolean` | Check if a component is registered. |
| `get(name)` | `RegistryEntry \| undefined` | Get the raw registry entry. |
| `names()` | `string[]` | List all registered component names. |
| `size` | `number` | Number of registered components. |
| `toToolDefinition()` | `ComponentToolDefinition[]` | Generate JSON Schema definitions for LLMs. |

#### `ResolveResult`

```tsx
// Success
{
  ok: true,
  name: string,
  component: ComponentType,
  props: ValidatedProps
}

// Error
{
  ok: false,
  name: string,
  errors: ValidationError[],
  correctionPrompt: string
}
```

#### `LLMComponentOutput`

The shape your LLM should produce:

```tsx
{
  type: string,   // Component name (must match a registered name)
  props: object   // Component props (validated against the Zod schema)
}
```

---

### `@genui/react`

#### `useGenerativeUI`

```tsx
import { useGenerativeUI } from '@genui/react';

const { element, ok, correctionPrompt, errors, result } = useGenerativeUI(registry, output);
```

| Return | Type | Description |
|---|---|---|
| `element` | `ReactElement \| null` | The rendered component, or null on failure |
| `ok` | `boolean` | Whether resolution succeeded |
| `correctionPrompt` | `string \| null` | Correction prompt for the LLM on failure |
| `errors` | `ValidationError[] \| null` | Detailed field-level errors |
| `result` | `ResolveResult \| null` | The full resolve result |

#### `<GenerativeUI />`

Declarative alternative to the hook:

```tsx
import { GenerativeUI } from '@genui/react';

<GenerativeUI
  registry={registry}
  output={{ type: 'Button', props: { label: 'Click' } }}
  fallback={<div>Failed to render</div>}
  onError={(correctionPrompt, errors) => {
    // Send correctionPrompt back to LLM
  }}
/>
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `registry` | `ComponentRegistry` | Yes | Your component registry |
| `output` | `LLMComponentOutput` | Yes | The LLM output to render |
| `fallback` | `ReactNode` | No | What to show on failure |
| `onError` | `(prompt, errors) => void` | No | Called when validation fails |

---

## Full Example: AI Chat with Generative UI

Here's a complete example showing how GenUI fits into an AI chat application:

```tsx
// 1. Define schemas and components
import { z } from 'zod';

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
  disabled: z.boolean().default(false),
});

const cardSchema = z.object({
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().url().optional(),
});

const alertSchema = z.object({
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
  dismissible: z.boolean().default(true),
});

const statSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
});

function Button({ label, variant, disabled }: z.infer<typeof buttonSchema>) {
  return <button className={`btn-${variant}`} disabled={disabled}>{label}</button>;
}

function Card({ title, body, imageUrl }: z.infer<typeof cardSchema>) {
  return (
    <div className="card">
      {imageUrl && <img src={imageUrl} alt={title} />}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Alert({ message, severity, dismissible }: z.infer<typeof alertSchema>) {
  return (
    <div className={`alert-${severity}`} role="alert">
      <span>{message}</span>
      {dismissible && <button>×</button>}
    </div>
  );
}

function Stat({ label, value, unit, trend }: z.infer<typeof statSchema>) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}{unit && ` ${unit}`} {arrow}</strong>
    </div>
  );
}

// 2. Create the registry
import { ComponentRegistry } from '@genui/core';

const registry = new ComponentRegistry();
registry
  .register('Button', buttonSchema, Button)
  .register('Card',   cardSchema,   Card)
  .register('Alert',  alertSchema,  Alert)
  .register('Stat',   statSchema,   Stat);

// 3. Use in your chat app
import { useGenerativeUI } from '@genui/react';

function AIChatMessage({ message }) {
  // The LLM returns: { type: 'Stat', props: { label: 'Revenue', value: 42500, unit: 'USD', trend: 'up' } }
  const { element, ok, correctionPrompt } = useGenerativeUI(registry, message.uiOutput);

  if (message.uiOutput && !ok) {
    // Auto-retry: send the correction prompt back to the AI
    retryWithCorrection(correctionPrompt);
    return <div className="loading">Fixing AI output...</div>;
  }

  return (
    <div className="chat-message">
      <p>{message.text}</p>
      {element}
    </div>
  );
}
```

### What the LLM sees (system prompt)

Include the tool definitions so the LLM knows what to produce:

```tsx
const systemPrompt = `
You can render UI components by returning JSON in this format:
{ "type": "ComponentName", "props": { ... } }

Available components:
${JSON.stringify(registry.toToolDefinition(), null, 2)}
`;
```

---

## Error Handling Guide

### Unregistered Component

```tsx
// Throws ComponentNotFoundError
registry.resolve({ type: 'NonExistent', props: {} });

// Returns null instead of throwing
registry.tryResolve({ type: 'NonExistent', props: {} }); // → null
```

### Duplicate Registration

```tsx
registry.register('Button', schema, Component);
registry.register('Button', schema, Component); // 💥 Throws DuplicateRegistrationError

// Allow overwrites
const registry = new ComponentRegistry({ allowOverwrite: true });
registry.register('Button', schema, ComponentV1);
registry.register('Button', schema, ComponentV2); // ✅ Works
```

### Invalid Props from LLM

```tsx
const result = registry.resolve({ type: 'Button', props: { label: 999 } });

if (!result.ok) {
  // result.errors → Array of { path, message, expected?, received? }
  // result.correctionPrompt → Ready-to-send prompt for LLM
}
```

---

## Project Structure

```
genui/
├── packages/
│   ├── core/                  # @genui/core — Schema validation & registry
│   │   └── src/
│   │       ├── registry.ts    # ComponentRegistry class
│   │       ├── correction.ts  # Auto-correction prompt generator
│   │       ├── errors.ts      # Custom error classes
│   │       ├── types.ts       # TypeScript types & interfaces
│   │       └── index.ts       # Public API exports
│   └── react/                 # @genui/react — React hooks & components
│       └── src/
│           ├── use-generative-ui.ts  # useGenerativeUI hook
│           ├── generative-ui.tsx     # <GenerativeUI /> component
│           └── index.ts              # Public API exports
├── examples/
│   └── basic-registry/        # Minimal working example
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml        # Monorepo workspaces
└── tsconfig.base.json         # Shared TypeScript strict config
```

---

## Development

```bash
# Clone the repo
git clone https://github.com/mohammadashrafian/genui.git
cd genui

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run the example
cd examples/basic-registry && pnpm exec tsx src/main.tsx
```

---

## Roadmap

GenUI is built in phases. Each phase is independently useful.

| Phase | Status | Description |
|---|---|---|
| **Phase 1** — Foundation | ✅ Complete | Component Registry + Schema Validation |
| **Phase 2** — Streaming | Planned | Progressive component rendering from LLM streams |
| **Phase 3** — Bidirectional Sync | Planned | User interactions flow back to the AI agent |
| **Phase 4** — Adapters | Planned | Pre-built adapters for shadcn/ui, Tailwind, Material UI |
| **Phase 5** — Docs & Launch | Planned | Documentation site, playground, and v1.0 release |

---

## Why GenUI?

| Feature | GenUI | Manual approach | CopilotKit |
|---|---|---|---|
| Type-safe validation | ✅ Zod schemas | ❌ Manual checks | ⚠️ Partial |
| Auto-correction prompts | ✅ Built-in | ❌ Write yourself | ❌ No |
| Framework-agnostic core | ✅ Pure TypeScript | N/A | ❌ React-only |
| Bundle size | ~8KB | 0KB | ~50KB+ |
| Tool definition generation | ✅ Automatic | ❌ Manual | ⚠️ Partial |
| Learning curve | 3 functions | N/A | Moderate |

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) — Use it however you want.
