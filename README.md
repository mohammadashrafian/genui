<p align="center">
  <img src="https://img.shields.io/badge/GenUI-v0.4.0-blue?style=for-the-badge" alt="GenUI Version" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Tests-289%20Passing-brightgreen?style=for-the-badge" alt="Tests Passing" />
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
- **Streaming Rendering** — Progressive UI rendering as LLM tokens arrive. See components build up in real time.
- **Partial JSON Parsing** — Heals incomplete JSON streams, extracting valid partial objects at each step.
- **Wire Format** — Token-efficient compact encoding with abbreviation maps. Saves 20-40% on output tokens.
- **Auto-Retry** — Exponential backoff retry logic with configurable hooks for resilient streaming.
- **Bidirectional Sync** — User interactions flow back to the AI as structured, validated actions.
- **Action Schemas** — Define what interactions each component can emit, validated with Zod.
- **ActionQueue** — Debouncing, conflict resolution, and ordered dispatch for rapid user interactions.
- **CoAgentProvider** — React context that bridges UI components and the AI agent bidirectionally.
- **Tool Definitions** — Auto-generate JSON Schema descriptions of your components to send to the LLM.
- **React Hooks** — `useGenerativeUI`, `useStreamingUI`, and `useCoAgent` hooks for the full AI-UI lifecycle.
- **Framework-Agnostic Core** — The validation, streaming, and action engine is pure TypeScript. React hooks are a separate package.
- **Security Module** — XSS-safe string sanitization, URL scheme validation, CSS injection prevention, built into every schema.
- **Pre-built Adapters** — Ready-to-use schemas for shadcn/ui, Tailwind CSS, and Material UI (10 components each).
- **CLI Scaffolding** — `npx genui init` generates a registry file for your chosen adapter. Zero manual setup.
- **Dev Error Overlay** — Rich floating overlay showing validation errors, raw LLM output, and correction prompts during development. Tree-shakes to zero in production.
- **Lightweight** — ~37KB core + ~14KB React + ~7KB per adapter. Zero runtime dependencies beyond Zod.

---

## Quick Start

### Scaffolding with the CLI

The fastest way to get started:

```bash
npx genui init
```

The CLI will ask you to:
1. Choose your UI adapter (shadcn/ui, Tailwind CSS, or Material UI)
2. Pick an output directory (e.g., `src/lib`)

It generates a ready-to-use `registry.ts` file with all component imports and shows you exactly what to install.

### Manual Installation

```bash
# Using pnpm (recommended)
pnpm add @genui/core @genui/react zod

# With pre-built adapters
pnpm add @genui/adapters

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

#### `<DevGenerativeUI />`

Drop-in replacement for `<GenerativeUI />` that shows a rich error overlay when validation fails in development mode. In production, it behaves identically to `GenerativeUI` (the overlay tree-shakes away).

```tsx
import { DevGenerativeUI } from '@genui/react';

<DevGenerativeUI
  registry={registry}
  output={llmOutput}
  fallback={<div>Failed to render</div>}
  showOverlay={true}  // default: true in development
/>
```

The overlay shows:
- Component name and error count
- Each validation error with field path, expected type, and received value
- Collapsible raw LLM output (JSON)
- Collapsible correction prompt with copy button

#### `<ErrorOverlay />`

Use the overlay standalone for custom error handling:

```tsx
import { ErrorOverlay } from '@genui/react';

// Show when you have a ResolveError
<ErrorOverlay
  error={resolveError}
  output={llmOutput}
  onDismiss={() => setShowOverlay(false)}
  onCopyPrompt={() => toast('Copied!')}
/>
```

#### `<CoAgentProvider />`

Wraps your app to enable bidirectional AI-UI communication:

```tsx
import { CoAgentProvider } from '@genui/react';
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `registry` | `ActionRegistry` | Yes | Registry with action schemas |
| `dispatchOptions` | `DispatchOptions` | No | Debounce, conflict strategy, queue size |
| `onAction` | `(action) => void` | No | Called on each dispatched action |
| `onToolCall` | `(result) => void` | No | Called with serialized tool call result |
| `onValidationError` | `(component, action, errors) => void` | No | Called when validation fails |

#### `useCoAgent`

```tsx
import { useCoAgent } from '@genui/react';

const { dispatch, history, lastToolCall, context } = useCoAgent('ComponentName');
```

| Return | Type | Description |
|---|---|---|
| `dispatch` | `(action, payload) => Action \| null` | Dispatch a validated action |
| `history` | `readonly Action[]` | All dispatched actions in this session |
| `lastToolCall` | `ToolCallResult \| null` | Most recent tool call result |
| `context` | `CoAgentContextValue` | Access to registry, queue, serializer |

---

## Streaming

GenUI renders components progressively as LLM tokens arrive — users see UI building up in real time instead of waiting for the full response.

### StreamParser — Incremental JSON Parsing

```ts
import { StreamParser } from '@genui/core';

const parser = new StreamParser();

// Feed tokens as they arrive from the LLM
parser.push('{"type":"Weather');      // → partial: { type: "Weather" }
parser.push('Card","props":{"city"'); // → partial: { type: "WeatherCard", props: { city: ... } }
parser.push(':"Tokyo"}}');           // → complete: full valid JSON

console.log(parser.current);  // The last valid parsed object
console.log(parser.complete);  // true when JSON is naturally complete
```

### useStreamingUI — Progressive React Rendering

```tsx
import { useStreamingUI } from '@genui/react';

function StreamingChat() {
  const { element, isStreaming, start, snapshot } = useStreamingUI(registry, {
    skeleton: <Skeleton />,
    fallback: <ErrorMessage />,
    onComplete: (snap) => console.log('Done:', snap.props),
    retry: { maxRetries: 3, baseDelay: 1000 },
  });

  const handleSend = async (message: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    // Pipe the response body directly into the streaming hook
    await start(response.body!.pipeThrough(new TextDecoderStream()));
  };

  return (
    <div>
      {isStreaming && <ProgressBar value={snapshot.progress} />}
      {element}
    </div>
  );
}
```

The hook transitions through states: `pending → skeleton → partial → complete`

### Wire Format — Save 20-40% on Output Tokens

```ts
import { encode, decode, generateWireFormatPrompt } from '@genui/core';

// Standard: {"type":"WeatherCard","props":{"city":"Tokyo","temperature":22}}  (74 chars)
// Wire:     {"t":"c","n":"WeatherCard","p":{"c":"Tokyo","t":22}}              (52 chars → 30% savings)

const abbreviations = { c: 'city', t: 'temperature' };
const wire = encode({ type: 'WeatherCard', props: { city: 'Tokyo', temperature: 22 } }, abbreviations);
const decoded = decode(wire, abbreviations);

// Include in your system prompt so the LLM uses compact format
const prompt = generateWireFormatPrompt(abbreviations);
```

### StreamResolver — Full Pipeline

```ts
import { StreamResolver } from '@genui/core';

const resolver = new StreamResolver({
  registry,
  throttleMs: 50,        // Emit snapshots at 20fps
  abbreviations,          // Wire format abbreviations
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (attempt) => console.log(`Retry ${attempt}`),
  },
});

// Source can be a ReadableStream, AsyncIterable, or a factory function (for retries)
await resolver.consume(
  { source: () => fetchLLMStream(), signal: abortController.signal },
  (event) => {
    if (event.type === 'snapshot') updateUI(event.data);
    if (event.type === 'complete') finalize(event.data.props);
    if (event.type === 'error') handleError(event.data.message);
  },
);
```

---

## Bidirectional Sync

GenUI doesn't just render AI output — it lets your UI talk back. When users interact with AI-rendered components, those actions are validated, queued, and serialized into structured tool call results that the AI can understand.

```
AI Agent → GenUI → Rendered Component
                        ↓ (user interacts)
AI Agent ← Tool Call ← ActionQueue ← Validated Action
```

### ActionRegistry — Components with Action Schemas

```ts
import { ActionRegistry } from '@genui/core';
import { z } from 'zod';

const registry = new ActionRegistry();

// Register component with both prop schemas AND action schemas
registry.registerWithActions(
  'ContactForm',
  z.object({ title: z.string(), fields: z.array(z.string()) }),  // prop schema
  {
    onSubmit: z.object({                                           // action schemas
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(10),
    }),
    onReset: z.object({
      reason: z.enum(['user', 'timeout', 'error']),
    }),
  },
  ContactFormComponent,
);

// Validate user actions against schemas
const result = registry.validateAction('ContactForm', 'onSubmit', {
  name: 'John',
  email: 'john@example.com',
  message: 'Hello from GenUI!',
});

if (result.ok) {
  console.log(result.action);  // Validated action with ID and timestamp
} else {
  console.log(result.errors);  // Field-level validation errors
}
```

### ActionSerializer — Format for LLM

```ts
import { ActionSerializer } from '@genui/core';

const serializer = new ActionSerializer();

// Convert to tool call result (ready for LLM API)
const toolCall = serializer.serialize(action);
// → { tool: "ContactForm.onSubmit", result: { component, action, payload, actionId }, timestamp }

// Or format as human-readable prompt for conversation context
const prompt = serializer.toPrompt(action);
// → "User interacted with "ContactForm" component:\n  Action: onSubmit\n  Payload: {...}"
```

### ActionQueue — Debounce and Conflict Resolution

```ts
import { ActionQueue } from '@genui/core';

const queue = new ActionQueue({
  debounceMs: 300,              // Wait 300ms before dispatching
  conflictStrategy: 'latest',   // If same action fires twice, keep the latest
  maxQueueSize: 50,             // Drop oldest when queue is full
});

queue.onAction((action) => console.log('Dispatched:', action));
queue.onToolCall((result) => sendToLLM(result));

queue.push(action);  // Debounced and deduplicated
queue.flush();        // Force-dispatch all pending actions
```

**Conflict strategies:**
| Strategy | Behavior |
|---|---|
| `latest` | Replace pending action with the same key (default) |
| `first` | Keep the first pending action, discard duplicates |
| `merge` | Allow all actions through, no deduplication |

### CoAgentProvider + useCoAgent — React Integration

```tsx
import { CoAgentProvider, useCoAgent } from '@genui/react';

// Wrap your app with the provider
function App() {
  return (
    <CoAgentProvider
      registry={registry}
      dispatchOptions={{ debounceMs: 300 }}
      onToolCall={(result) => sendToLLM(result)}
      onAction={(action) => console.log('User action:', action)}
      onValidationError={(component, action, errors) => {
        console.warn(`Invalid ${component}.${action}:`, errors);
      }}
    >
      <ChatInterface />
    </CoAgentProvider>
  );
}

// In any AI-rendered component:
function ContactForm({ title, fields }: Props) {
  const { dispatch, history, lastToolCall } = useCoAgent('ContactForm');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    dispatch('onSubmit', {
      name: data.get('name'),
      email: data.get('email'),
      message: data.get('message'),
    });
    // Action is validated → queued → serialized → sent to LLM
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map((f) => <input key={f} name={f} />)}
      <button type="submit">Send</button>
      <p>{history.length} actions sent</p>
    </form>
  );
}
```

---

## Security & Adapters

### Security Module

Every string from an LLM is untrusted. GenUI's security module provides Zod schema builders that sanitize and validate in a single pass:

```ts
import { safeString, safeUrl, safeHtml, safeCssClass } from '@genui/core';
import { z } from 'zod';

const schema = z.object({
  title: safeString({ maxLength: 200 }),      // Strips HTML tags, removes control chars
  link: safeUrl(),                             // Blocks javascript:, data:, vbscript: schemes
  content: safeHtml({ allowedTags: ['b', 'i', 'p'] }),  // Keeps only safe tags, strips attributes
  className: safeCssClass(),                   // Blocks CSS injection (expression(), url())
});

// XSS is stripped automatically:
schema.parse({
  title: '<script>alert(1)</script>Hello',   // → "alert(1)Hello"
  link: 'https://example.com',              // → "https://example.com/"
  content: '<b>bold</b><script>x</script>', // → "<b>bold</b>x"
  className: 'btn btn-primary',             // → "btn btn-primary"
});
```

**Configurable security policies:**

```ts
import { SecurityPolicy, DEFAULT_SECURITY_POLICY } from '@genui/core';

// Strict policy: HTTPS only, shorter strings
const strict = DEFAULT_SECURITY_POLICY.with({
  maxStringLength: 1_000,
  allowedUrlSchemes: ['https'],
});

// Use in schemas
const title = safeString({ maxLength: 100, policy: strict.config });
```

### Pre-built Adapters

Adapters provide security-hardened Zod schemas for popular UI libraries. You provide your own component implementations — adapters only define the schemas.

```bash
pnpm add @genui/adapters
```

**shadcn/ui:**

```ts
import { createShadcnRegistry } from '@genui/adapters/shadcn';
import { Button, Card, Alert, Badge, Input, Select, Dialog, Tabs, Table, Avatar } from '@/components/ui';

const registry = createShadcnRegistry({
  Button, Card, Alert, Badge, Input, Select, Dialog, Tabs, Table, Avatar,
});

// Ready to use with useGenerativeUI, useStreamingUI, useCoAgent
```

**Tailwind CSS:**

```ts
import { createTailwindRegistry } from '@genui/adapters/tailwind';
```

**Material UI:**

```ts
import { createMuiRegistry } from '@genui/adapters/mui';
```

Each adapter includes **10 components** with pre-defined schemas and action schemas:

| Component | shadcn/ui | Tailwind | MUI |
|---|---|---|---|
| Button | variants: default, destructive, outline, secondary, ghost, link | variants: primary, secondary, danger, ghost, link | variants: text, contained, outlined + colors |
| Card | title, description, content, footer | title, subtitle, body, footer | title, subheader, content, media, actions |
| Alert | default, destructive | info, success, warning, error + dismissible | severity + variant (standard, filled, outlined) |
| Badge/Chip | default, secondary, destructive, outline | color-based (gray through pink) | Chip with filled/outlined + colors |
| Input/TextField | type, placeholder, disabled | + label, helperText, error | + variant, fullWidth, multiline, rows |
| Select | options, placeholder | + label | + variant, fullWidth |
| Dialog | title, description, content, open | same | + maxWidth, fullWidth |
| Tabs | value-based tabs array | same | + variant (standard, scrollable, fullWidth) |
| Table | headers + rows | + striped, hoverable | + size, stickyHeader |
| Avatar | src, alt, fallback | + initials, size | + variant (circular, rounded, square) |

**Customize individual schemas:**

```ts
import { buttonSchema } from '@genui/adapters/shadcn';
import { safeString } from '@genui/core';

const customButton = buttonSchema.extend({
  icon: safeString({ maxLength: 64 }).optional(),
  tooltip: safeString({ maxLength: 256 }).optional(),
});
```

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
│   ├── core/                  # @genui/core — Registry, streaming, actions, security
│   │   └── src/
│   │       ├── registry.ts    # ComponentRegistry class
│   │       ├── correction.ts  # Auto-correction prompt generator
│   │       ├── errors.ts      # Custom error classes
│   │       ├── types.ts       # TypeScript types & interfaces
│   │       ├── stream/        # Streaming engine
│   │       ├── action/        # Bidirectional action system
│   │       ├── security/      # XSS sanitization, URL validation, safe schemas
│   │       │   ├── sanitize.ts      # State-machine HTML stripper (ReDoS-safe)
│   │       │   ├── url-validator.ts # URL scheme validation
│   │       │   ├── safe-schemas.ts  # safeString, safeUrl, safeHtml, safeCssClass
│   │       │   ├── policy.ts        # SecurityPolicy config
│   │       │   └── types.ts         # Security types
│   │       └── index.ts
│   ├── react/                 # @genui/react — React hooks & components
│   │   └── src/
│   │       ├── use-generative-ui.ts   # useGenerativeUI hook
│   │       ├── use-streaming-ui.ts    # useStreamingUI hook
│   │       ├── generative-ui.tsx      # <GenerativeUI /> component
│   │       ├── dev-generative-ui.tsx  # <DevGenerativeUI /> with error overlay
│   │       ├── error-overlay.tsx      # Rich dev-mode error overlay
│   │       ├── co-agent-provider.tsx  # CoAgentProvider
│   │       ├── use-co-agent.ts        # useCoAgent hook
│   │       └── index.ts
│   ├── adapters/              # @genui/adapters — Pre-built UI library schemas
│   │   └── src/
│   │       ├── shared/        # Base schemas, registry factory builder
│   │       ├── shadcn/        # shadcn/ui adapter (10 components)
│   │       ├── tailwind/      # Tailwind CSS adapter (10 components)
│   │       └── mui/           # Material UI adapter (10 components)
│   └── cli/                   # @genui/cli — CLI scaffolding tool
│       └── src/
│           ├── index.ts       # CLI entry point (npx genui init)
│           ├── commands/      # Command implementations
│           └── templates/     # Registry template generators
├── examples/
│   ├── basic-registry/        # Registry + validation demo
│   ├── streaming-demo/        # Streaming + wire format demo
│   └── bidirectional-demo/    # Bidirectional sync demo
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
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

# Run examples
cd examples/basic-registry && pnpm start        # Registry + validation demo
cd examples/streaming-demo && pnpm start         # Streaming + wire format demo
cd examples/bidirectional-demo && pnpm start     # Bidirectional sync demo
```

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
