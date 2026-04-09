'use client';

import Link from 'next/link';
import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

const headings = [
  { id: 'registry-pattern', text: 'The Registry Pattern', level: 2 },
  { id: 'llm-output', text: 'LLM Component Output', level: 2 },
  { id: 'resolving', text: 'Resolving Output', level: 2 },
  { id: 'auto-correction', text: 'Auto-Correction Prompts', level: 2 },
  { id: 'tool-definitions', text: 'Tool Definitions', level: 2 },
  { id: 'error-handling', text: 'Error Handling', level: 2 },
];

export default function CoreConceptsPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Core Concepts</h1>
        <p className="text-lg text-text-secondary mb-10">
          Understand the fundamental patterns that power GenUIKit: registries, validation,
          resolution, and the self-healing correction loop.
        </p>

        {/* ── The Registry Pattern ── */}
        <section id="registry-pattern" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">The Registry Pattern</h2>
          <p className="text-text-secondary mb-4">
            At the heart of GenUIKit is the <InlineCode>ComponentRegistry</InlineCode> -- a
            lookup table that maps a <strong className="text-text-primary">component name</strong> to
            a <strong className="text-text-primary">Zod schema</strong> and
            a <strong className="text-text-primary">React component</strong>. When an LLM produces
            output like <InlineCode>{`{ type: "WeatherCard", props: { ... } }`}</InlineCode>,
            the registry knows exactly which schema to validate against and which component to render.
          </p>

          <div className="rounded-lg border border-border bg-surface-card p-5 mb-6">
            <p className="text-sm font-mono text-text-secondary mb-3">How the registry works internally:</p>
            <div className="flex items-center gap-3 text-sm text-text-secondary flex-wrap">
              <span className="rounded bg-surface-light px-3 py-1.5 font-mono text-accent">Component Name</span>
              <span className="text-text-secondary">--{'>'}</span>
              <span className="rounded bg-surface-light px-3 py-1.5 font-mono text-primary">Zod Schema</span>
              <span className="text-text-secondary">+</span>
              <span className="rounded bg-surface-light px-3 py-1.5 font-mono text-emerald-400">React Component</span>
            </div>
          </div>

          <p className="text-text-secondary mb-4">
            Create a registry and register components using the
            chainable <InlineCode>register()</InlineCode> API. Each call
            returns <InlineCode>this</InlineCode>, so you can chain multiple registrations together:
          </p>

          <CodeBlock
            language="tsx"
            filename="registry.ts"
            code={`import { z } from 'zod';
import { ComponentRegistry } from '@genuikit/core';

// Define schemas
const weatherSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
});

const alertSchema = z.object({
  title: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
});

// Create registry with chainable register() calls
const registry = new ComponentRegistry()
  .register('WeatherCard', weatherSchema, WeatherCard)
  .register('AlertBanner', alertSchema, AlertBanner);

// You can also register components individually
registry.register('UserProfile', userProfileSchema, UserProfile);`}
          />

          <p className="text-text-secondary mb-4">
            The registry stores entries in
            an internal <InlineCode>Map&lt;string, RegistryEntry&gt;</InlineCode>. Each entry holds
            the component name, its Zod schema, and the React component reference:
          </p>

          <CodeBlock
            language="tsx"
            code={`// Each entry in the registry has this shape
interface RegistryEntry<S extends z.ZodType = z.ZodType> {
  readonly name: string;
  readonly schema: S;
  readonly component: ComponentType<z.infer<S>>;
}`}
          />

          <p className="text-text-secondary mt-4">
            By default, registering a component with a name that already exists
            throws a <InlineCode>DuplicateRegistrationError</InlineCode>. You can opt into
            overwrites by passing <InlineCode>{`{ allowOverwrite: true }`}</InlineCode> to the
            constructor:
          </p>

          <CodeBlock
            language="tsx"
            code={`// Allow replacing existing registrations
const registry = new ComponentRegistry({ allowOverwrite: true });
registry.register('Button', schemaV1, ButtonV1);
registry.register('Button', schemaV2, ButtonV2); // replaces V1`}
          />
        </section>

        {/* ── LLM Component Output ── */}
        <section id="llm-output" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">LLM Component Output</h2>
          <p className="text-text-secondary mb-4">
            GenUIKit expects a specific shape from the LLM: an object
            with <InlineCode>type</InlineCode> (the registered component name)
            and <InlineCode>props</InlineCode> (the data matching the Zod schema). This is the
            contract between your LLM and the registry.
          </p>

          <CodeBlock
            language="tsx"
            code={`// The shape your LLM must produce
interface LLMComponentOutput {
  readonly type: string;              // registered component name
  readonly props: Record<string, unknown>; // data matching the Zod schema
}`}
          />

          <p className="text-text-secondary mb-4">
            When structuring LLM tool calls, instruct the model to return this exact shape. Here is
            an example of what the LLM should produce when asked about weather:
          </p>

          <CodeBlock
            language="json"
            filename="LLM output example"
            code={`{
  "type": "WeatherCard",
  "props": {
    "city": "San Francisco",
    "temperature": 18,
    "condition": "cloudy"
  }
}`}
          />

          <p className="text-text-secondary mb-4">
            In your API route or server action, parse the LLM response and pass it directly to
            the registry for resolution:
          </p>

          <CodeBlock
            language="tsx"
            filename="api/chat/route.ts"
            code={`import { registry } from '@/lib/registry';

export async function POST(req: Request) {
  const { message } = await req.json();

  // Call your LLM (OpenAI, Anthropic, etc.)
  const llmResponse = await callLLM(message, {
    tools: registry.toToolDefinition(),
  });

  // The LLM returns { type: "WeatherCard", props: { ... } }
  return Response.json(llmResponse);
}`}
          />
        </section>

        {/* ── Resolving Output ── */}
        <section id="resolving" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Resolving Output</h2>
          <p className="text-text-secondary mb-4">
            The registry provides two methods for resolving LLM output into validated
            components: <InlineCode>resolve()</InlineCode> for strict
            resolution and <InlineCode>tryResolve()</InlineCode> for lenient resolution.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">
            resolve() -- Strict Resolution
          </h3>
          <p className="text-text-secondary mb-4">
            The <InlineCode>resolve()</InlineCode> method validates the LLM output against the
            registered schema. It returns a discriminated union: either a success result with
            the component and validated props, or a failure result with detailed errors and
            a correction prompt.
          </p>

          <CodeBlock
            language="tsx"
            code={`const output = { type: 'WeatherCard', props: { city: 'Tokyo', temperature: 22, condition: 'sunny' } };
const result = registry.resolve(output);

if (result.ok) {
  // Success: result has component + validated props
  const { component: Component, props, name } = result;
  // Render: <Component {...props} />
} else {
  // Failure: result has errors + correction prompt
  const { errors, correctionPrompt, name } = result;
  // Send correctionPrompt back to the LLM for retry
}`}
          />

          <p className="text-text-secondary mb-4">
            On success, the result contains the resolved component and the parsed (and possibly
            transformed) props. On failure, you get structured validation errors and a
            correction prompt:
          </p>

          <CodeBlock
            language="tsx"
            code={`// Success result shape
interface ResolveSuccess<P = unknown> {
  readonly ok: true;
  readonly name: string;
  readonly component: ComponentType<P>;
  readonly props: P;
}

// Error result shape
interface ResolveError {
  readonly ok: false;
  readonly name: string;
  readonly errors: ValidationError[];
  readonly correctionPrompt: string;
}`}
          />

          <div className="rounded-lg border border-border bg-surface-card p-4 mt-4 mb-6">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Important:</strong> If
              the <InlineCode>type</InlineCode> does not match any registered component
              name, <InlineCode>resolve()</InlineCode> throws
              a <InlineCode>ComponentNotFoundError</InlineCode> rather than returning an error
              result. This is because an unknown component name cannot be corrected through
              validation alone.
            </p>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">
            tryResolve() -- Lenient Resolution
          </h3>
          <p className="text-text-secondary mb-4">
            The <InlineCode>tryResolve()</InlineCode> method works the same
            as <InlineCode>resolve()</InlineCode>, but
            returns <InlineCode>null</InlineCode> instead of throwing when the component name
            is not found. This is useful when you want to silently skip unknown components:
          </p>

          <CodeBlock
            language="tsx"
            code={`const result = registry.tryResolve(output);

if (result === null) {
  // Component not registered -- silently skip or show fallback
  return <div>Unknown component</div>;
}

if (result.ok) {
  const { component: Component, props } = result;
  return <Component {...props} />;
} else {
  // Validation failed -- use correctionPrompt for retry
  console.log(result.correctionPrompt);
}`}
          />

          <div className="rounded-lg border border-border bg-surface-card p-4 mt-4">
            <p className="text-sm font-medium text-text-primary mb-2">When to use each method:</p>
            <ul className="space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">--</span>
                <span>
                  Use <InlineCode>resolve()</InlineCode> when you expect the component to exist
                  and want to catch mismatches as errors (e.g., in a controlled chat UI).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">--</span>
                <span>
                  Use <InlineCode>tryResolve()</InlineCode> when the LLM might produce arbitrary
                  component names and you want graceful fallbacks (e.g., in a plugin system).
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Auto-Correction Prompts ── */}
        <section id="auto-correction" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Auto-Correction Prompts</h2>
          <p className="text-text-secondary mb-4">
            When schema validation fails, GenUIKit generates a structured correction prompt that
            describes exactly what went wrong. You can send this prompt back to the LLM so it
            can fix its output -- creating a self-healing loop.
          </p>

          <p className="text-text-secondary mb-4">
            Here is how the flow works. Suppose the LLM produces invalid props:
          </p>

          <CodeBlock
            language="tsx"
            filename="Step 1: LLM produces invalid output"
            code={`// LLM returns invalid props (temperature is a string, not a number)
const invalidOutput = {
  type: 'WeatherCard',
  props: {
    city: 'Berlin',
    temperature: 'warm',   // should be a number
    condition: 'foggy',    // not in the enum
  },
};

const result = registry.resolve(invalidOutput);
// result.ok === false`}
          />

          <p className="text-text-secondary mb-4">
            The <InlineCode>correctionPrompt</InlineCode> in the error result contains a
            detailed message for the LLM:
          </p>

          <CodeBlock
            language="tsx"
            filename="Step 2: Generated correction prompt"
            code={`console.log(result.correctionPrompt);
// Output:
// The props you provided for component "WeatherCard" failed validation.
//
// Errors:
//   - "temperature": Expected number, received string, expected: number, received: string
//   - "condition": Invalid enum value. Expected 'sunny' | 'cloudy' | 'rainy' | 'snowy',
//     received 'foggy'
//
// Expected schema:
// {
//   city: string
//   temperature: number
//   condition: "sunny" | "cloudy" | "rainy" | "snowy"
// }
//
// Please provide corrected props for "WeatherCard" as a valid JSON object
// matching the schema above.`}
          />

          <p className="text-text-secondary mb-4">
            Send the correction prompt back to the LLM and it will produce corrected output:
          </p>

          <CodeBlock
            language="tsx"
            filename="Step 3: The self-healing retry loop"
            code={`async function resolveWithRetry(
  registry: ComponentRegistry,
  output: LLMComponentOutput,
  maxRetries = 2
) {
  let result = registry.resolve(output);
  let attempts = 0;

  while (!result.ok && attempts < maxRetries) {
    // Send correction prompt back to the LLM
    const corrected = await callLLM(result.correctionPrompt);
    result = registry.resolve(corrected);
    attempts++;
  }

  return result;
}`}
          />

          <div className="rounded-lg border border-border bg-surface-card p-5 mt-6">
            <p className="text-sm font-medium text-text-primary mb-3">The self-healing loop:</p>
            <div className="flex flex-col gap-2 text-sm font-mono">
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="rounded bg-surface-light px-3 py-1.5 text-accent">LLM Output</span>
                <span>--{'>'}</span>
                <span className="rounded bg-surface-light px-3 py-1.5 text-primary">resolve()</span>
                <span>--{'>'}</span>
                <span className="rounded bg-surface-light px-3 py-1.5 text-emerald-400">Valid? Render</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary ml-[12.5rem]">
                <span className="text-red-400">|</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary ml-[10.5rem]">
                <span className="text-red-400">Invalid?</span>
                <span>--{'>'}</span>
                <span className="rounded bg-surface-light px-3 py-1.5 text-orange-400">correctionPrompt</span>
                <span>--{'>'}</span>
                <span className="rounded bg-surface-light px-3 py-1.5 text-accent">Send to LLM</span>
                <span>--{'>'}</span>
                <span className="text-text-secondary">(retry)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tool Definitions ── */}
        <section id="tool-definitions" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Tool Definitions</h2>
          <p className="text-text-secondary mb-4">
            The <InlineCode>toToolDefinition()</InlineCode> method generates a JSON description
            of all registered components and their expected props. Send this to the LLM as part
            of your system prompt or tool definitions so it knows which components are available.
          </p>

          <CodeBlock
            language="tsx"
            filename="Generating tool definitions"
            code={`import { ComponentRegistry } from '@genuikit/core';
import { z } from 'zod';

const registry = new ComponentRegistry()
  .register('WeatherCard', z.object({
    city: z.string(),
    temperature: z.number(),
    condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
    humidity: z.number().min(0).max(100).optional(),
  }), WeatherCard)
  .register('AlertBanner', z.object({
    title: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
  }), AlertBanner);

const toolDefs = registry.toToolDefinition();
console.log(JSON.stringify(toolDefs, null, 2));`}
          />

          <p className="text-text-secondary mb-4">
            The output is an array of objects, each with
            a <InlineCode>name</InlineCode> and a JSON Schema-like <InlineCode>schema</InlineCode> description:
          </p>

          <CodeBlock
            language="json"
            filename="Generated tool definition output"
            code={`[
  {
    "name": "WeatherCard",
    "schema": {
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "temperature": { "type": "number" },
        "condition": { "type": "string", "enum": ["sunny", "cloudy", "rainy", "snowy"] },
        "humidity": { "type": "number" }
      },
      "required": ["city", "temperature", "condition"]
    }
  },
  {
    "name": "AlertBanner",
    "schema": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "message": { "type": "string" },
        "severity": { "type": "string", "enum": ["info", "warning", "error"] }
      },
      "required": ["title", "message", "severity"]
    }
  }
]`}
          />

          <p className="text-text-secondary mb-4">
            Include this in your LLM system prompt to teach the model what components it
            can produce:
          </p>

          <CodeBlock
            language="tsx"
            filename="Including tool definitions in your prompt"
            code={`const systemPrompt = \`You are a UI assistant. When the user asks a question,
respond with a JSON object matching one of these components:

\${JSON.stringify(registry.toToolDefinition(), null, 2)}

Respond with: { "type": "<ComponentName>", "props": { ... } }\`;

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'What is the weather in Tokyo?' },
  ],
});`}
          />
        </section>

        {/* ── Error Handling ── */}
        <section id="error-handling" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Error Handling</h2>
          <p className="text-text-secondary mb-4">
            GenUIKit provides two specific error classes for registry operations. Understanding
            when each is thrown helps you build robust error handling.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">ComponentNotFoundError</h3>
          <p className="text-text-secondary mb-4">
            Thrown by <InlineCode>resolve()</InlineCode> when
            the <InlineCode>type</InlineCode> field in the LLM output does not match any
            registered component name. This error is not recoverable through the correction
            loop because the component simply does not exist in the registry.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { ComponentNotFoundError } from '@genuikit/core';

try {
  const result = registry.resolve({
    type: 'NonExistentWidget',
    props: { title: 'Hello' },
  });
} catch (error) {
  if (error instanceof ComponentNotFoundError) {
    console.error(error.message);
    // "Component "NonExistentWidget" is not registered."

    // Option 1: Show fallback UI
    return <div>Unknown component type</div>;

    // Option 2: Use tryResolve() instead to avoid the exception
  }
}`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">DuplicateRegistrationError</h3>
          <p className="text-text-secondary mb-4">
            Thrown when you attempt to register a component with a name that is already in
            use. This is a setup-time error that you typically catch during development:
          </p>

          <CodeBlock
            language="tsx"
            code={`import { DuplicateRegistrationError } from '@genuikit/core';

const registry = new ComponentRegistry();
registry.register('Button', buttonSchema, Button);

try {
  registry.register('Button', altButtonSchema, AltButton);
} catch (error) {
  if (error instanceof DuplicateRegistrationError) {
    console.error(error.message);
    // "Component "Button" is already registered. Use allowOverwrite option to replace."
  }
}

// To allow overwrites, pass the option to the constructor:
const flexibleRegistry = new ComponentRegistry({ allowOverwrite: true });`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Comprehensive Error Handling</h3>
          <p className="text-text-secondary mb-4">
            Here is a complete pattern that handles all error cases gracefully:
          </p>

          <CodeBlock
            language="tsx"
            filename="safe-render.tsx"
            code={`import { ComponentNotFoundError } from '@genuikit/core';
import type { LLMComponentOutput, ResolveResult } from '@genuikit/core';

function safeRender(
  registry: ComponentRegistry,
  output: LLMComponentOutput
): { element: JSX.Element | null; correctionPrompt: string | null } {
  // Handle unknown component names
  const result = registry.tryResolve(output);

  if (result === null) {
    // Component not in registry -- nothing to correct
    return {
      element: <div>Component "{output.type}" is not available.</div>,
      correctionPrompt: null,
    };
  }

  if (result.ok) {
    // Validation passed -- render the component
    const { component: Component, props } = result;
    return {
      element: <Component {...props} />,
      correctionPrompt: null,
    };
  }

  // Validation failed -- return correction prompt for LLM retry
  return {
    element: null,
    correctionPrompt: result.correctionPrompt,
  };
}`}
          />
        </section>

        {/* What's Next */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">What&apos;s Next</h2>
          <p className="text-text-secondary mb-4">
            Now that you understand the core patterns, explore more advanced topics:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/docs/react-hooks"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">React Hooks</h3>
              <p className="mt-1 text-sm text-text-secondary">useGenerativeUI and the GenerativeUI component for rendering.</p>
            </Link>
            <Link
              href="/docs/adapters"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Adapters</h3>
              <p className="mt-1 text-sm text-text-secondary">Pre-built registries for shadcn/ui, Tailwind, and MUI.</p>
            </Link>
            <Link
              href="/docs/streaming"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Streaming</h3>
              <p className="mt-1 text-sm text-text-secondary">Progressive rendering with incremental JSON parsing.</p>
            </Link>
            <Link
              href="/docs/security"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Security</h3>
              <p className="mt-1 text-sm text-text-secondary">XSS protection, sanitization, and safe schema patterns.</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Table of Contents */}
      <OnThisPage headings={headings} />
    </div>
  );
}
