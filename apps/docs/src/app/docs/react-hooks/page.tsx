'use client';

import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

const headings = [
  { id: 'use-generative-ui', text: 'useGenerativeUI', level: 2 },
  { id: 'use-generative-ui-params', text: 'Parameters', level: 3 },
  { id: 'use-generative-ui-returns', text: 'Return Value', level: 3 },
  { id: 'use-generative-ui-example', text: 'Example', level: 3 },
  { id: 'generative-ui', text: 'GenerativeUI Component', level: 2 },
  { id: 'generative-ui-props', text: 'Props', level: 3 },
  { id: 'generative-ui-example', text: 'Declarative Usage', level: 3 },
  { id: 'dev-generative-ui', text: 'DevGenerativeUI', level: 2 },
  { id: 'dev-generative-ui-props', text: 'Props', level: 3 },
  { id: 'dev-generative-ui-example', text: 'Usage', level: 3 },
  { id: 'error-overlay', text: 'ErrorOverlay', level: 2 },
  { id: 'error-overlay-props', text: 'Props', level: 3 },
  { id: 'error-overlay-example', text: 'Custom Error Handling', level: 3 },
  { id: 'use-streaming-ui', text: 'useStreamingUI', level: 2 },
  { id: 'use-streaming-ui-options', text: 'Options', level: 3 },
  { id: 'use-streaming-ui-returns', text: 'Return Value', level: 3 },
  { id: 'use-streaming-ui-example', text: 'Streaming Example', level: 3 },
  { id: 'use-co-agent', text: 'useCoAgent', level: 2 },
  { id: 'use-co-agent-params', text: 'Parameters', level: 3 },
  { id: 'use-co-agent-returns', text: 'Return Value', level: 3 },
  { id: 'use-co-agent-example', text: 'Form Example', level: 3 },
  { id: 'co-agent-provider', text: 'CoAgentProvider', level: 2 },
  { id: 'co-agent-provider-props', text: 'Props', level: 3 },
  { id: 'co-agent-provider-example', text: 'Provider Setup', level: 3 },
];

export default function ReactHooksPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">React Hooks</h1>
        <p className="text-lg text-text-secondary mb-10">
          Hooks and components for connecting LLM output to your React UI. All exports
          come from <InlineCode>@genuikit/react</InlineCode> unless noted otherwise.
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* useGenerativeUI                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="use-generative-ui" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">useGenerativeUI</h2>
          <p className="text-text-secondary mb-4">
            The primary hook for resolving raw LLM output into a validated, rendered React
            element. It validates the output against the registry, renders the matching
            component, and produces a correction prompt when validation fails so you can
            feed it back to the model for a retry.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { useGenerativeUI } from '@genuikit/react';`}
          />

          {/* Params */}
          <h3 id="use-generative-ui-params" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Parameters
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Param</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">registry</td>
                  <td className="px-4 py-2 font-mono">ComponentRegistry</td>
                  <td className="px-4 py-2">The registry containing your component schemas and implementations.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">output</td>
                  <td className="px-4 py-2 font-mono">LLMOutput</td>
                  <td className="px-4 py-2">
                    Raw LLM output object with <InlineCode>type</InlineCode> and <InlineCode>props</InlineCode> fields.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">options?</td>
                  <td className="px-4 py-2 font-mono">UseGenerativeUIOptions</td>
                  <td className="px-4 py-2">
                    Optional config: <InlineCode>strict</InlineCode> (fail on extra props),{' '}
                    <InlineCode>fallback</InlineCode> (element to render on failure).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Return value */}
          <h3 id="use-generative-ui-returns" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Return Value
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Field</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">element</td>
                  <td className="px-4 py-2 font-mono">React.ReactElement | null</td>
                  <td className="px-4 py-2">The rendered component, or null if validation failed.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">ok</td>
                  <td className="px-4 py-2 font-mono">boolean</td>
                  <td className="px-4 py-2">Whether the output passed schema validation and rendered successfully.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">correctionPrompt</td>
                  <td className="px-4 py-2 font-mono">string | null</td>
                  <td className="px-4 py-2">A prompt describing validation errors. Send this back to the LLM for self-correction.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">errors</td>
                  <td className="px-4 py-2 font-mono">ZodError[] | null</td>
                  <td className="px-4 py-2">Raw Zod validation errors when validation fails, null otherwise.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="use-generative-ui-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Example
          </h3>
          <p className="text-text-secondary mb-3">
            A chat message component that renders LLM output or retries on validation failure:
          </p>
          <CodeBlock
            language="tsx"
            filename="chat-message.tsx"
            code={`import { useGenerativeUI } from '@genuikit/react';
import { registry } from '../registry';

interface ChatMessageProps {
  output: { type: string; props: Record<string, unknown> };
  onRetry: (correctionPrompt: string) => void;
}

export function ChatMessage({ output, onRetry }: ChatMessageProps) {
  const { element, ok, correctionPrompt, errors } = useGenerativeUI(
    registry,
    output,
    { strict: true }
  );

  if (!ok) {
    // Automatically send correction prompt back to the LLM
    if (correctionPrompt) {
      onRetry(correctionPrompt);
    }
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm text-red-400">
          Component failed to render. Retrying...
        </p>
        {errors && (
          <pre className="mt-2 text-xs text-red-300/70">
            {errors.map((e) => e.message).join('\\n')}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      {element}
    </div>
  );
}`}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* GenerativeUI Component                                              */}
        {/* ------------------------------------------------------------------ */}
        <section id="generative-ui" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">GenerativeUI Component</h2>
          <p className="text-text-secondary mb-4">
            A declarative component wrapper around <InlineCode>useGenerativeUI</InlineCode>.
            Use it when you prefer JSX over hooks, or when you want to handle errors via
            callbacks instead of conditional rendering.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { GenerativeUI } from '@genuikit/react';`}
          />

          {/* Props */}
          <h3 id="generative-ui-props" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Props
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Prop</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Default</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">registry</td>
                  <td className="px-4 py-2 font-mono">ComponentRegistry</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Component registry with schemas and implementations.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">output</td>
                  <td className="px-4 py-2 font-mono">LLMOutput</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Raw output from the LLM to validate and render.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">fallback?</td>
                  <td className="px-4 py-2 font-mono">React.ReactNode</td>
                  <td className="px-4 py-2">null</td>
                  <td className="px-4 py-2">Rendered when validation fails and no onError handler returns JSX.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">onError?</td>
                  <td className="px-4 py-2 font-mono">(prompt: string, errors: ZodError[]) =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Called when validation fails. Receives the correction prompt and raw errors.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">strict?</td>
                  <td className="px-4 py-2 font-mono">boolean</td>
                  <td className="px-4 py-2">false</td>
                  <td className="px-4 py-2">When true, extra props not in the schema cause a validation error.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="generative-ui-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Declarative Usage
          </h3>
          <CodeBlock
            language="tsx"
            filename="message-list.tsx"
            code={`import { GenerativeUI } from '@genuikit/react';
import { registry } from '../registry';

function MessageList({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <GenerativeUI
          key={msg.id}
          registry={registry}
          output={msg.output}
          fallback={<p className="text-gray-400">Could not render component.</p>}
          onError={(prompt, errors) => {
            console.error('Validation failed:', errors);
            // Send correction prompt back to LLM
            retryMessage(msg.id, prompt);
          }}
        />
      ))}
    </div>
  );
}`}
          />

          <div className="mt-6 rounded-lg border border-border bg-surface-card p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Hook vs. Component</h4>
            <p className="text-sm text-text-secondary">
              Use <InlineCode>useGenerativeUI</InlineCode> when you need fine-grained control
              over the render cycle (conditional retries, custom state). Use{' '}
              <InlineCode>GenerativeUI</InlineCode> for straightforward rendering where
              callbacks are sufficient for error handling.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* DevGenerativeUI                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="dev-generative-ui" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">DevGenerativeUI</h2>
          <p className="text-text-secondary mb-4">
            A development-only wrapper that adds an error overlay when LLM output fails
            validation. It renders a visual diff of expected vs. received props, making it
            easy to debug schema mismatches during development. In production builds, it
            tree-shakes to zero -- the component simply renders its children with no overhead.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { DevGenerativeUI } from '@genuikit/react';`}
          />

          {/* Props */}
          <h3 id="dev-generative-ui-props" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Props
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Prop</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Default</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">registry</td>
                  <td className="px-4 py-2 font-mono">ComponentRegistry</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Component registry for validation.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">output</td>
                  <td className="px-4 py-2 font-mono">LLMOutput</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Raw LLM output to validate and render.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">showOverlay?</td>
                  <td className="px-4 py-2 font-mono">boolean</td>
                  <td className="px-4 py-2">true</td>
                  <td className="px-4 py-2">
                    Toggle the error overlay. Set to <InlineCode>false</InlineCode> to disable
                    the visual overlay while still logging errors to console.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">children?</td>
                  <td className="px-4 py-2 font-mono">React.ReactNode</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Fallback content rendered when validation fails (behind the overlay).</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="dev-generative-ui-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Usage
          </h3>
          <CodeBlock
            language="tsx"
            filename="dev-chat.tsx"
            code={`import { DevGenerativeUI } from '@genuikit/react';
import { registry } from '../registry';

function DevChatMessage({ output }) {
  return (
    <DevGenerativeUI
      registry={registry}
      output={output}
      showOverlay={true}
    >
      <p className="text-gray-400">Fallback content</p>
    </DevGenerativeUI>
  );
}

// The overlay shows:
// - Component type received vs. registered types
// - Props diff (expected schema vs. received JSON)
// - Zod validation error paths
// - Copy-friendly correction prompt`}
          />

          <div className="mt-6 rounded-lg border border-border bg-surface-card p-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">Production Behavior</h4>
            <p className="text-sm text-text-secondary">
              In production (<InlineCode>process.env.NODE_ENV === &apos;production&apos;</InlineCode>),{' '}
              <InlineCode>DevGenerativeUI</InlineCode> tree-shakes to a pass-through component
              that adds zero bytes to your bundle. You can safely leave it in your code
              without conditional imports.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* ErrorOverlay                                                        */}
        {/* ------------------------------------------------------------------ */}
        <section id="error-overlay" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">ErrorOverlay</h2>
          <p className="text-text-secondary mb-4">
            A standalone error overlay component for building custom error UIs. Unlike{' '}
            <InlineCode>DevGenerativeUI</InlineCode> which handles the full validation
            lifecycle, <InlineCode>ErrorOverlay</InlineCode> is a presentational component
            you feed error data to directly.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { ErrorOverlay } from '@genuikit/react';`}
          />

          {/* Props */}
          <h3 id="error-overlay-props" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Props
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Prop</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Default</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">errors</td>
                  <td className="px-4 py-2 font-mono">ZodError[]</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Array of Zod validation errors to display.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">correctionPrompt?</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">The generated correction prompt, displayed in a copyable block.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">componentType?</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">The component type that failed, shown in the header.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">onDismiss?</td>
                  <td className="px-4 py-2 font-mono">() =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Called when the user dismisses the overlay.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">className?</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Additional CSS classes for the overlay container.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="error-overlay-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Custom Error Handling
          </h3>
          <CodeBlock
            language="tsx"
            filename="custom-error-ui.tsx"
            code={`import { useGenerativeUI, ErrorOverlay } from '@genuikit/react';
import { registry } from '../registry';
import { useState } from 'react';

function ChatMessageWithOverlay({ output }) {
  const [dismissed, setDismissed] = useState(false);
  const { element, ok, errors, correctionPrompt } = useGenerativeUI(
    registry,
    output
  );

  if (!ok && !dismissed) {
    return (
      <ErrorOverlay
        errors={errors!}
        correctionPrompt={correctionPrompt ?? undefined}
        componentType={output.type}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  if (!ok) {
    return <p className="text-gray-500">Component could not be rendered.</p>;
  }

  return <div className="message">{element}</div>;
}`}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* useStreamingUI                                                      */}
        {/* ------------------------------------------------------------------ */}
        <section id="use-streaming-ui" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">useStreamingUI</h2>
          <p className="text-text-secondary mb-4">
            A hook for progressive rendering of LLM output as it streams in. It
            incrementally parses partial JSON from a streaming endpoint, validates each
            chunk against the registry, and re-renders the component as more data arrives.
            Ideal for real-time chat interfaces where you want to show content before the
            response is complete.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { useStreamingUI } from '@genuikit/react';`}
          />

          {/* Options */}
          <h3 id="use-streaming-ui-options" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Options
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Option</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Default</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">registry</td>
                  <td className="px-4 py-2 font-mono">ComponentRegistry</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Component registry for validation and rendering.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">url</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">The streaming API endpoint URL.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">body?</td>
                  <td className="px-4 py-2 font-mono">Record&lt;string, unknown&gt;</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Request body sent as JSON POST to the streaming endpoint.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">skeleton?</td>
                  <td className="px-4 py-2 font-mono">React.ReactNode</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Shown while waiting for the first parseable chunk.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">fallback?</td>
                  <td className="px-4 py-2 font-mono">React.ReactNode</td>
                  <td className="px-4 py-2">null</td>
                  <td className="px-4 py-2">Rendered if the stream completes but validation fails.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">retry?</td>
                  <td className="px-4 py-2 font-mono">{'{ maxAttempts: number; delay: number }'}</td>
                  <td className="px-4 py-2">{'{ maxAttempts: 0, delay: 1000 }'}</td>
                  <td className="px-4 py-2">Auto-retry configuration. Set maxAttempts &gt; 0 to enable retries on stream failure.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">onComplete?</td>
                  <td className="px-4 py-2 font-mono">(result: StreamResult) =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Called when the stream finishes. Receives the final validated output and any errors.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Return */}
          <h3 id="use-streaming-ui-returns" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Return Value
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Field</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">element</td>
                  <td className="px-4 py-2 font-mono">React.ReactElement | null</td>
                  <td className="px-4 py-2">The progressively rendered component. Updates as new chunks arrive.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">status</td>
                  <td className="px-4 py-2 font-mono">&apos;idle&apos; | &apos;streaming&apos; | &apos;complete&apos; | &apos;error&apos;</td>
                  <td className="px-4 py-2">Current state of the stream.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">start</td>
                  <td className="px-4 py-2 font-mono">() =&gt; void</td>
                  <td className="px-4 py-2">Manually start or restart the stream.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">abort</td>
                  <td className="px-4 py-2 font-mono">() =&gt; void</td>
                  <td className="px-4 py-2">Cancel the in-progress stream.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">error</td>
                  <td className="px-4 py-2 font-mono">Error | null</td>
                  <td className="px-4 py-2">The error object if the stream failed.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="use-streaming-ui-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Streaming Example
          </h3>
          <CodeBlock
            language="tsx"
            filename="streaming-chat.tsx"
            code={`import { useStreamingUI } from '@genuikit/react';
import { registry } from '../registry';

function StreamingChat({ question }: { question: string }) {
  const { element, status, start, abort, error } = useStreamingUI({
    registry,
    url: '/api/chat/stream',
    body: {
      question,
      tools: registry.toToolDefinition(),
    },
    skeleton: (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    ),
    fallback: <p className="text-red-400">Failed to render streamed output.</p>,
    retry: { maxAttempts: 2, delay: 1500 },
    onComplete: (result) => {
      console.log('Stream finished:', result.ok ? 'success' : 'failed');
      if (result.correctionPrompt) {
        // Optionally send correction back to the model
        console.log('Correction:', result.correctionPrompt);
      }
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {status === 'idle' && (
          <button onClick={start} className="px-3 py-1 rounded bg-blue-600">
            Send
          </button>
        )}
        {status === 'streaming' && (
          <button onClick={abort} className="px-3 py-1 rounded bg-red-600">
            Stop
          </button>
        )}
        {status === 'streaming' && (
          <span className="text-sm text-gray-400 animate-pulse">
            Streaming...
          </span>
        )}
      </div>

      {element}

      {error && (
        <p className="text-sm text-red-400 mt-2">
          Stream error: {error.message}
        </p>
      )}
    </div>
  );
}`}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* useCoAgent                                                          */}
        {/* ------------------------------------------------------------------ */}
        <section id="use-co-agent" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">useCoAgent</h2>
          <p className="text-text-secondary mb-4">
            A bidirectional sync hook that keeps your React state in sync with an LLM
            agent. The agent can read and write state through tool calls, and your UI can
            dispatch actions back to the agent. This enables collaborative workflows where
            both the user and the agent contribute to a shared state.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { useCoAgent } from '@genuikit/react';`}
          />

          {/* Params */}
          <h3 id="use-co-agent-params" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Parameters
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Param</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">agentId</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">Unique identifier for the agent session.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">initialState</td>
                  <td className="px-4 py-2 font-mono">T</td>
                  <td className="px-4 py-2">The initial shared state object.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">options?</td>
                  <td className="px-4 py-2 font-mono">CoAgentOptions&lt;T&gt;</td>
                  <td className="px-4 py-2">
                    Configuration: <InlineCode>onStateChange</InlineCode>,{' '}
                    <InlineCode>onToolCall</InlineCode>,{' '}
                    <InlineCode>optimisticUpdates</InlineCode>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Return */}
          <h3 id="use-co-agent-returns" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Return Value
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Field</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">state</td>
                  <td className="px-4 py-2 font-mono">T</td>
                  <td className="px-4 py-2">The current shared state, updated by both the user and the agent.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">dispatch</td>
                  <td className="px-4 py-2 font-mono">(action: CoAction) =&gt; void</td>
                  <td className="px-4 py-2">Send an action to the agent. The agent receives it as a tool call result.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">history</td>
                  <td className="px-4 py-2 font-mono">CoAction[]</td>
                  <td className="px-4 py-2">Full action history from both the user and the agent.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">lastToolCall</td>
                  <td className="px-4 py-2 font-mono">ToolCall | null</td>
                  <td className="px-4 py-2">The most recent tool call from the agent, useful for showing agent activity.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">isAgentActive</td>
                  <td className="px-4 py-2 font-mono">boolean</td>
                  <td className="px-4 py-2">Whether the agent is currently processing a response.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="use-co-agent-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Form Example
          </h3>
          <p className="text-text-secondary mb-3">
            A booking form where the user fills in fields and the agent suggests or
            auto-completes values based on context:
          </p>
          <CodeBlock
            language="tsx"
            filename="booking-form.tsx"
            code={`import { useCoAgent } from '@genuikit/react';

interface BookingState {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes: string;
}

const initialState: BookingState = {
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  notes: '',
};

export function BookingForm({ agentId }: { agentId: string }) {
  const { state, dispatch, lastToolCall, isAgentActive } = useCoAgent<BookingState>({
    agentId,
    initialState,
    options: {
      onStateChange: (prev, next) => {
        console.log('State changed:', { prev, next });
      },
      onToolCall: (toolCall) => {
        console.log('Agent called tool:', toolCall.name);
      },
      optimisticUpdates: true,
    },
  });

  const handleFieldChange = (field: keyof BookingState, value: string | number) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { field, value },
    });
  };

  return (
    <form className="space-y-4 max-w-md">
      {isAgentActive && (
        <div className="text-sm text-blue-400 animate-pulse">
          Agent is working...
          {lastToolCall && <span> ({lastToolCall.name})</span>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Destination</label>
        <input
          type="text"
          value={state.destination}
          onChange={(e) => handleFieldChange('destination', e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Where are you going?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Check-in</label>
          <input
            type="date"
            value={state.checkIn}
            onChange={(e) => handleFieldChange('checkIn', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check-out</label>
          <input
            type="date"
            value={state.checkOut}
            onChange={(e) => handleFieldChange('checkOut', e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Guests</label>
        <input
          type="number"
          min={1}
          value={state.guests}
          onChange={(e) => handleFieldChange('guests', parseInt(e.target.value))}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes from agent</label>
        <textarea
          value={state.notes}
          readOnly
          className="w-full rounded border px-3 py-2 bg-gray-50 text-gray-600"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-blue-600 py-2 text-white font-medium"
      >
        Book Now
      </button>
    </form>
  );
}`}
          />
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* CoAgentProvider                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="co-agent-provider" className="mb-16">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">CoAgentProvider</h2>
          <p className="text-text-secondary mb-4">
            A provider component that sets up the CoAgent context for a subtree. It
            initializes the bidirectional connection, manages the action registry, and
            provides dispatch capabilities to all descendant <InlineCode>useCoAgent</InlineCode> hooks.
            Wrap your app (or a section of it) with this provider before using the hook.
          </p>

          <CodeBlock
            language="tsx"
            code={`import { CoAgentProvider } from '@genuikit/react';`}
          />

          {/* Props */}
          <h3 id="co-agent-provider-props" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Props
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Prop</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Default</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">endpoint</td>
                  <td className="px-4 py-2 font-mono">string</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">WebSocket or HTTP endpoint for the agent backend.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">registry</td>
                  <td className="px-4 py-2 font-mono">ActionRegistry</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Registry of actions the agent can dispatch. Maps action types to handlers.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">dispatchOptions?</td>
                  <td className="px-4 py-2 font-mono">DispatchOptions</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">
                    Config for dispatching: <InlineCode>throttleMs</InlineCode> (debounce user
                    actions), <InlineCode>queueSize</InlineCode> (max pending actions).
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">onConnect?</td>
                  <td className="px-4 py-2 font-mono">() =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Called when the connection to the agent backend is established.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">onDisconnect?</td>
                  <td className="px-4 py-2 font-mono">(reason: string) =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Called when the connection drops. Receives a reason string.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">onError?</td>
                  <td className="px-4 py-2 font-mono">(error: Error) =&gt; void</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Global error handler for agent communication failures.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">children</td>
                  <td className="px-4 py-2 font-mono">React.ReactNode</td>
                  <td className="px-4 py-2">--</td>
                  <td className="px-4 py-2">Child components that can use useCoAgent.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example */}
          <h3 id="co-agent-provider-example" className="text-lg font-medium text-text-primary mb-3 mt-8">
            Provider Setup
          </h3>
          <CodeBlock
            language="tsx"
            filename="app-layout.tsx"
            code={`import { CoAgentProvider, ActionRegistry } from '@genuikit/react';
import { BookingForm } from './booking-form';

// Define the actions the agent can perform
const actionRegistry = new ActionRegistry();

actionRegistry.register('UPDATE_FIELD', {
  description: 'Update a form field value',
  handler: (state, payload) => ({
    ...state,
    [payload.field]: payload.value,
  }),
});

actionRegistry.register('SUGGEST_DATES', {
  description: 'Suggest check-in and check-out dates',
  handler: (state, payload) => ({
    ...state,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
  }),
});

actionRegistry.register('ADD_NOTE', {
  description: 'Add a note or suggestion',
  handler: (state, payload) => ({
    ...state,
    notes: state.notes
      ? state.notes + '\\n' + payload.note
      : payload.note,
  }),
});

export function AppLayout() {
  return (
    <CoAgentProvider
      endpoint="/api/agent/ws"
      registry={actionRegistry}
      dispatchOptions={{
        throttleMs: 300,
        queueSize: 50,
      }}
      onConnect={() => console.log('Agent connected')}
      onDisconnect={(reason) => console.warn('Disconnected:', reason)}
      onError={(error) => console.error('Agent error:', error)}
    >
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">AI Travel Booking</h1>
        <BookingForm agentId="booking-agent-1" />
      </div>
    </CoAgentProvider>
  );
}`}
          />
        </section>
      </div>

      {/* Table of Contents */}
      <OnThisPage headings={headings} />
    </div>
  );
}
