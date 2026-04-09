import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

export const metadata: Metadata = {
  title: 'Getting Started - GenUIKit',
  description: 'Install GenUIKit and build your first LLM-driven UI in minutes.',
};

const tocItems = [
  { id: 'prerequisites', text: 'Prerequisites', level: 2 },
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'cli', text: 'CLI Setup', level: 2 },
  { id: 'quick-start', text: 'Quick Start', level: 2 },
  { id: 'manual-setup', text: 'Manual Setup', level: 2 },
  { id: 'full-example', text: 'Full Example', level: 2 },
  { id: 'whats-next', text: "What's Next", level: 2 },
];

export default function GettingStartedPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Getting Started</h1>
        <p className="text-lg text-text-secondary mb-10">
          Get GenUIKit installed and render your first LLM-driven component in under 5 minutes.
        </p>

        {/* Prerequisites */}
        <section id="prerequisites" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Prerequisites</h2>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="text-accent">--</span>
              <span><strong className="text-text-primary">Node.js 18+</strong> (LTS recommended)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">--</span>
              <span><strong className="text-text-primary">React 18+</strong> (or React 19)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">--</span>
              <span>A package manager: <InlineCode>npm</InlineCode>, <InlineCode>pnpm</InlineCode>, or <InlineCode>yarn</InlineCode></span>
            </li>
          </ul>
        </section>

        {/* Installation */}
        <section id="installation" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Installation</h2>
          <p className="text-text-secondary mb-4">
            GenUIKit is split into focused packages. Install the core library and the React bindings:
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-mono text-text-secondary mb-1">npm</p>
              <CodeBlock
                language="bash"
                code="npm install @genuikit/core @genuikit/react zod"
              />
            </div>
            <div>
              <p className="text-xs font-mono text-text-secondary mb-1">pnpm</p>
              <CodeBlock
                language="bash"
                code="pnpm add @genuikit/core @genuikit/react zod"
              />
            </div>
            <div>
              <p className="text-xs font-mono text-text-secondary mb-1">yarn</p>
              <CodeBlock
                language="bash"
                code="yarn add @genuikit/core @genuikit/react zod"
              />
            </div>
          </div>

          <p className="mt-4 text-text-secondary">
            If you plan to use a pre-built adapter (shadcn/ui, Tailwind, MUI), also install the adapters package:
          </p>
          <CodeBlock language="bash" code="npm install @genuikit/adapters" />
        </section>

        {/* CLI */}
        <section id="cli" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">CLI Setup</h2>
          <p className="text-text-secondary mb-4">
            The fastest way to scaffold a new project is with the GenUIKit CLI. It generates
            a registry file, installs dependencies, and sets up your preferred adapter:
          </p>
          <CodeBlock language="bash" code="npx @genuikit/cli init" />
          <p className="text-text-secondary mt-4">
            The CLI will ask you to pick an adapter (shadcn/ui, Tailwind, or MUI), then create
            a <InlineCode>genui.registry.ts</InlineCode> file with all 10 components pre-configured.
          </p>
          <p className="text-text-secondary mt-2">
            If you prefer to set things up manually, continue reading below.
          </p>
        </section>

        {/* Quick Start */}
        <section id="quick-start" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Quick Start</h2>
          <p className="text-text-secondary mb-4">
            Here is the minimal setup to render an LLM-produced component. This three-step
            process works the same whether you use an adapter or build your own schemas.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Step 1: Define a schema</h3>
          <p className="text-text-secondary mb-3">
            Create a Zod schema describing the props your component expects. The LLM will
            produce JSON matching this shape.
          </p>
          <CodeBlock
            language="typescript"
            filename="schemas.ts"
            code={`import { z } from 'zod';

export const weatherCardSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
  humidity: z.number().min(0).max(100).optional(),
});

export type WeatherCardProps = z.infer<typeof weatherCardSchema>;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Step 2: Create a registry</h3>
          <p className="text-text-secondary mb-3">
            Register your component with its schema. The registry maps component names to
            schemas and implementations.
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { ComponentRegistry } from '@genuikit/core';
import { weatherCardSchema } from './schemas';
import { WeatherCard } from './components/weather-card';

export const registry = new ComponentRegistry();

registry.register('WeatherCard', weatherCardSchema, WeatherCard);`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Step 3: Render with the hook</h3>
          <p className="text-text-secondary mb-3">
            Use the <InlineCode>useGenerativeUI</InlineCode> hook to resolve LLM output into
            a rendered React element.
          </p>
          <CodeBlock
            language="tsx"
            filename="chat-message.tsx"
            code={`import { useGenerativeUI } from '@genuikit/react';
import { registry } from './registry';

function ChatMessage({ output }) {
  const { element, ok, correctionPrompt } = useGenerativeUI(registry, output);

  if (!ok) {
    // Send correctionPrompt back to the LLM for a retry
    return <div>Rendering failed. Retrying...</div>;
  }

  return <div className="message">{element}</div>;
}`}
          />
        </section>

        {/* Manual Setup */}
        <section id="manual-setup" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Manual Setup</h2>
          <p className="text-text-secondary mb-4">
            For a complete manual setup, you need four pieces: a component, a schema, a registry,
            and a rendering hook. Here they are together:
          </p>

          <CodeBlock
            language="tsx"
            filename="components/weather-card.tsx"
            code={`import type { WeatherCardProps } from '../schemas';

const conditionIcons: Record<string, string> = {
  sunny: '\\u2600\\uFE0F',
  cloudy: '\\u2601\\uFE0F',
  rainy: '\\uD83C\\uDF27\\uFE0F',
  snowy: '\\u2744\\uFE0F',
};

export function WeatherCard({ city, temperature, condition, humidity }: WeatherCardProps) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{city}</h3>
        <span className="text-2xl">{conditionIcons[condition]}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{temperature}\\u00B0C</p>
      <p className="text-sm text-gray-500 capitalize">{condition}</p>
      {humidity !== undefined && (
        <p className="text-sm text-gray-400 mt-1">Humidity: {humidity}%</p>
      )}
    </div>
  );
}`}
          />
        </section>

        {/* Full Example */}
        <section id="full-example" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Full Working Example</h2>
          <p className="text-text-secondary mb-4">
            This complete example shows how to connect an LLM API response to GenUIKit rendering.
            It uses the <InlineCode>GenerativeUI</InlineCode> declarative component.
          </p>
          <CodeBlock
            language="tsx"
            filename="app.tsx"
            code={`import { useState } from 'react';
import { ComponentRegistry } from '@genuikit/core';
import { GenerativeUI } from '@genuikit/react';
import { weatherCardSchema, WeatherCard } from './weather-card';

// 1. Build the registry
const registry = new ComponentRegistry();
registry.register('WeatherCard', weatherCardSchema, WeatherCard);

// 2. Generate the tool definition for the LLM system prompt
const toolDefs = registry.toToolDefinition();
// Send toolDefs in your system prompt so the LLM knows the available components

export function App() {
  const [output, setOutput] = useState(null);

  async function handleAsk(question: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ question, tools: toolDefs }),
    });
    const data = await res.json();
    // data = { type: 'WeatherCard', props: { city: 'Tokyo', temperature: 22, condition: 'sunny' } }
    setOutput(data);
  }

  return (
    <div>
      <button onClick={() => handleAsk('Weather in Tokyo?')}>
        Ask about weather
      </button>

      {output && (
        <GenerativeUI
          registry={registry}
          output={output}
          fallback={<div>Failed to render component</div>}
          onError={(prompt, errors) => {
            console.log('Validation failed, correction prompt:', prompt);
            // Optionally: send \`prompt\` back to the LLM for auto-correction
          }}
        />
      )}
    </div>
  );
}`}
          />
        </section>

        {/* What's Next */}
        <section id="whats-next">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">What&apos;s Next</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/docs/core-concepts"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Core Concepts</h3>
              <p className="mt-1 text-sm text-text-secondary">Understand registries, validation, and correction prompts.</p>
            </Link>
            <Link
              href="/docs/adapters"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Adapters</h3>
              <p className="mt-1 text-sm text-text-secondary">Use pre-built shadcn/ui, Tailwind, or MUI registries.</p>
            </Link>
            <Link
              href="/docs/security"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Security</h3>
              <p className="mt-1 text-sm text-text-secondary">Learn about XSS protection and safe schemas.</p>
            </Link>
            <Link
              href="/docs/streaming"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Streaming</h3>
              <p className="mt-1 text-sm text-text-secondary">Progressive rendering with incremental JSON parsing.</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Table of Contents */}
      <OnThisPage headings={tocItems} />
    </div>
  );
}
