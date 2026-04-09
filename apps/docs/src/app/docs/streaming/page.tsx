'use client';

import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

const headings = [
  { id: 'overview', text: 'Overview', level: 2 },
  { id: 'stream-parser', text: 'StreamParser', level: 2 },
  { id: 'use-streaming-ui', text: 'useStreamingUI Hook', level: 2 },
  { id: 'wire-format', text: 'Wire Format', level: 2 },
  { id: 'stream-resolver', text: 'StreamResolver', level: 2 },
  { id: 'real-world', text: 'Real-World Example', level: 2 },
];

export default function StreamingPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Streaming</h1>
        <p className="text-lg text-text-secondary mb-10">
          Progressive UI rendering powered by incremental JSON parsing. Users see
          components building in real time as LLM tokens arrive, instead of staring at
          a loading spinner until the full response is ready.
        </p>

        {/* Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Overview</h2>
          <p className="text-text-secondary mb-4">
            Traditional LLM integrations wait for the entire JSON response before
            rendering anything. With GenUIKit streaming, every token the model produces
            is fed into an incremental parser that heals partial JSON on the fly. As
            soon as enough props are available, the matching component starts rendering
            and progressively fills in as more data arrives.
          </p>
          <p className="text-text-secondary mb-4">
            The streaming pipeline has three layers that work together:
          </p>
          <ul className="space-y-2 text-text-secondary mb-4">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span>
                <strong className="text-text-primary">StreamParser</strong> &mdash;
                Low-level incremental JSON parser that heals incomplete tokens into
                valid objects.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span>
                <strong className="text-text-primary">useStreamingUI</strong> &mdash;
                React hook that connects a streaming source to your component registry
                and manages the full render lifecycle.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span>
                <strong className="text-text-primary">StreamResolver</strong> &mdash;
                Orchestration layer that ties parsing, throttling, abbreviation
                expansion, and error recovery into one pipeline.
              </span>
            </li>
          </ul>
          <CodeBlock
            language="tsx"
            filename="quick-example.tsx"
            code={`import { useStreamingUI } from '@genuikit/react';
import { registry } from './registry';

function StreamingChat({ responseStream }) {
  const { element, phase } = useStreamingUI(registry, responseStream);

  return (
    <div className="message">
      {phase === 'pending' && <p>Waiting for response...</p>}
      {element}
      {phase === 'complete' && <span className="checkmark">Done</span>}
    </div>
  );
}`}
          />
        </section>

        {/* StreamParser */}
        <section id="stream-parser" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">StreamParser</h2>
          <p className="text-text-secondary mb-4">
            The <InlineCode>StreamParser</InlineCode> from{' '}
            <InlineCode>@genuikit/core</InlineCode> is the foundation of the streaming
            system. It accepts raw string chunks (individual tokens from the LLM) and
            maintains a running parse of the incomplete JSON, healing it into a valid
            object at every step.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Core API</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Method / Property</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Type</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">push(chunk)</td>
                  <td className="px-4 py-2 font-mono">(chunk: string) =&gt; void</td>
                  <td className="px-4 py-2">Feed a new token or chunk of text into the parser.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">current</td>
                  <td className="px-4 py-2 font-mono">Record&lt;string, unknown&gt; | null</td>
                  <td className="px-4 py-2">The current healed JSON object. Returns null until the first opening brace is seen.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">complete</td>
                  <td className="px-4 py-2 font-mono">boolean</td>
                  <td className="px-4 py-2">True when the parser has received a fully closed JSON object.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">How JSON Healing Works</h3>
          <p className="text-text-secondary mb-4">
            When the parser receives a partial token stream, it closes any open strings,
            arrays, and objects to produce valid JSON at every step. For example, if the
            LLM has emitted{' '}
            <InlineCode>{`{"city": "Tok`}</InlineCode>, the parser heals it to{' '}
            <InlineCode>{`{"city": "Tok"}`}</InlineCode> so your component can already
            render with the partial value.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Token-by-Token Example</h3>
          <p className="text-text-secondary mb-4">
            Here is what happens as tokens arrive one by one:
          </p>
          <CodeBlock
            language="typescript"
            filename="stream-parser-demo.ts"
            code={`import { StreamParser } from '@genuikit/core';

const parser = new StreamParser();

// Token 1: opening brace
parser.push('{"');
console.log(parser.current);    // {}
console.log(parser.complete);   // false

// Token 2: start of the "type" key
parser.push('type": "Weather');
console.log(parser.current);    // { type: "Weather" }

// Token 3: close type value, start props
parser.push('Card", "props": {"city": "Tok');
console.log(parser.current);
// { type: "WeatherCard", props: { city: "Tok" } }

// Token 4: finish city, add temperature
parser.push('yo", "temperature": 22');
console.log(parser.current);
// { type: "WeatherCard", props: { city: "Tokyo", temperature: 22 } }

// Token 5: close everything
parser.push(', "condition": "sunny"}}');
console.log(parser.current);
// { type: "WeatherCard", props: { city: "Tokyo", temperature: 22, condition: "sunny" } }
console.log(parser.complete);   // true`}
          />

          <p className="text-text-secondary mt-4">
            Notice that <InlineCode>current</InlineCode> always returns a valid object,
            even mid-token. The parser tracks nesting depth, string escape sequences,
            and number boundaries so it always knows exactly where to insert closing
            delimiters.
          </p>
        </section>

        {/* useStreamingUI Hook */}
        <section id="use-streaming-ui" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">useStreamingUI Hook</h2>
          <p className="text-text-secondary mb-4">
            The <InlineCode>useStreamingUI</InlineCode> hook from{' '}
            <InlineCode>@genuikit/react</InlineCode> is the primary way to connect a
            streaming LLM response to your component registry. It manages the full
            lifecycle from pending through skeleton, partial rendering, and completion.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Signature</h3>
          <CodeBlock
            language="typescript"
            filename="use-streaming-ui.d.ts"
            code={`import { ComponentRegistry } from '@genuikit/core';

interface StreamingUIOptions {
  // Shown while waiting for the first meaningful token
  skeleton?: React.ReactNode;

  // Rendered if the stream fails or the component cannot be resolved
  fallback?: React.ReactNode;

  // Called when the stream completes successfully
  onComplete?: (result: { type: string; props: Record<string, unknown> }) => void;

  // Number of automatic retries on stream errors (default: 0)
  retry?: number;
}

interface StreamingUIResult {
  // The current rendered element (updates progressively)
  element: React.ReactNode | null;

  // Current phase of the stream lifecycle
  phase: 'pending' | 'skeleton' | 'partial' | 'complete' | 'error';

  // Validation errors if the final props fail schema checks
  errors: string[] | null;

  // The raw parsed data at any point in the stream
  data: Record<string, unknown> | null;
}

function useStreamingUI(
  registry: ComponentRegistry,
  source: ReadableStream<string> | Response | null,
  options?: StreamingUIOptions
): StreamingUIResult;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">State Transitions</h3>
          <p className="text-text-secondary mb-4">
            The hook moves through four phases as the stream progresses. Each phase
            maps to a distinct rendering state:
          </p>
          <div className="rounded-lg border border-border bg-surface-card p-5 mb-6 font-mono text-sm text-text-secondary">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">pending</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">skeleton</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">partial</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">complete</span>
            </div>
            <ul className="mt-4 space-y-1 text-xs">
              <li><strong className="text-text-primary">pending</strong> &mdash; Source is null or has not emitted any tokens yet.</li>
              <li><strong className="text-text-primary">skeleton</strong> &mdash; First bytes arrived, but not enough data to identify the component. Shows the skeleton placeholder.</li>
              <li><strong className="text-text-primary">partial</strong> &mdash; Component type identified and rendering with partial props. Updates on every token.</li>
              <li><strong className="text-text-primary">complete</strong> &mdash; Stream finished. Final props are validated against the schema.</li>
            </ul>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Connecting to fetch()</h3>
          <p className="text-text-secondary mb-4">
            The hook accepts a <InlineCode>Response</InlineCode> object directly, so
            you can pass the result of <InlineCode>fetch()</InlineCode> without any
            extra plumbing:
          </p>
          <CodeBlock
            language="tsx"
            filename="streaming-chat.tsx"
            code={`'use client';

import { useState } from 'react';
import { useStreamingUI } from '@genuikit/react';
import { registry } from '@/lib/registry';

export function StreamingChat() {
  const [response, setResponse] = useState<Response | null>(null);

  const { element, phase, errors } = useStreamingUI(registry, response, {
    skeleton: <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />,
    fallback: <div className="text-red-500">Failed to render component</div>,
    onComplete: (result) => {
      console.log('Stream complete:', result.type);
    },
    retry: 2,
  });

  async function handleSend(message: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    // Pass the Response directly - the hook reads the stream
    setResponse(res);
  }

  return (
    <div>
      <button onClick={() => handleSend('Show me the weather in Tokyo')}>
        Ask
      </button>

      <div className="mt-4">
        {phase === 'pending' && <p className="text-gray-400">Send a message to start...</p>}
        {element}
        {phase === 'complete' && (
          <p className="text-green-500 text-sm mt-2">Rendering complete</p>
        )}
        {errors && (
          <p className="text-red-400 text-sm mt-2">
            Validation errors: {errors.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}`}
          />
        </section>

        {/* Wire Format */}
        <section id="wire-format" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Wire Format</h2>
          <p className="text-text-secondary mb-4">
            LLM output tokens are expensive. The wire format module in{' '}
            <InlineCode>@genuikit/core</InlineCode> provides a compact encoding that
            abbreviates common keys and component names, reducing token count by
            roughly 30% without any loss of information.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">API</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-surface-light">
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Function</th>
                  <th className="text-left px-4 py-2 text-text-primary font-medium border-b border-border">Description</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">encode(data, map)</td>
                  <td className="px-4 py-2">Compress a component payload using an abbreviation map.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">decode(data, map)</td>
                  <td className="px-4 py-2">Expand an abbreviated payload back to its full form.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 font-mono text-accent">generateWireFormatPrompt(registry)</td>
                  <td className="px-4 py-2">Generate the abbreviation map and system prompt instructions for the LLM.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-accent">estimateSavings(data, map)</td>
                  <td className="px-4 py-2">Returns the percentage of tokens saved by the compact encoding.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Before &amp; After</h3>
          <p className="text-text-secondary mb-4">
            Here is a side-by-side comparison showing the token savings:
          </p>
          <CodeBlock
            language="typescript"
            filename="wire-format-example.ts"
            code={`import { encode, decode, estimateSavings } from '@genuikit/core/wire-format';

// Define your abbreviation map
const abbreviations = {
  WeatherCard: 'WC',
  temperature: 'tmp',
  condition: 'cnd',
  humidity: 'hmd',
  city: 'c',
  props: 'p',
  type: 't',
};

// Full format (what the LLM would normally produce)
const full = {
  type: 'WeatherCard',
  props: {
    city: 'Tokyo',
    temperature: 22,
    condition: 'sunny',
    humidity: 65,
  },
};
// JSON: {"type":"WeatherCard","props":{"city":"Tokyo","temperature":22,"condition":"sunny","humidity":65}}
// ~95 characters

// Compact wire format
const compact = encode(full, abbreviations);
// { t: "WC", p: { c: "Tokyo", tmp: 22, cnd: "sunny", hmd: 65 } }
// JSON: {"t":"WC","p":{"c":"Tokyo","tmp":22,"cnd":"sunny","hmd":65}}
// ~63 characters

console.log(estimateSavings(full, abbreviations));
// { original: 95, compressed: 63, savedPercent: 33.7 }

// Decode back to full form on the client
const restored = decode(compact, abbreviations);
// { type: "WeatherCard", props: { city: "Tokyo", temperature: 22, condition: "sunny", humidity: 65 } }`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Including Abbreviations in the System Prompt</h3>
          <p className="text-text-secondary mb-4">
            Use <InlineCode>generateWireFormatPrompt()</InlineCode> to create an
            instruction block that tells the LLM to use the compact encoding. Include
            this in your system prompt alongside the tool definitions:
          </p>
          <CodeBlock
            language="typescript"
            filename="system-prompt.ts"
            code={`import { ComponentRegistry } from '@genuikit/core';
import { generateWireFormatPrompt } from '@genuikit/core/wire-format';
import { registry } from './registry';

// Generate the abbreviation map and LLM instructions
const wireFormatBlock = generateWireFormatPrompt(registry);
// Returns a string like:
// "Use these abbreviations when outputting component JSON:
//  WeatherCard -> WC, temperature -> tmp, condition -> cnd, ...
//  Example: {"t":"WC","p":{"c":"Tokyo","tmp":22}} instead of
//  {"type":"WeatherCard","props":{"city":"Tokyo","temperature":22}}"

const systemPrompt = \`
You are a UI assistant. Respond with component JSON.

\${registry.toToolDefinition()}

\${wireFormatBlock}
\`;`}
          />
        </section>

        {/* StreamResolver */}
        <section id="stream-resolver" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">StreamResolver</h2>
          <p className="text-text-secondary mb-4">
            The <InlineCode>StreamResolver</InlineCode> orchestrates the full streaming
            pipeline: reading from a source, parsing tokens, throttling updates,
            expanding abbreviations, and emitting events. It is the engine that powers{' '}
            <InlineCode>useStreamingUI</InlineCode> under the hood, and you can use it
            directly for non-React contexts or advanced customization.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Pipeline</h3>
          <div className="rounded-lg border border-border bg-surface-card p-5 mb-6 font-mono text-sm text-text-secondary">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">source</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">parse</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">throttle</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">resolve</span>
              <span className="text-accent">&rarr;</span>
              <span className="rounded bg-surface-light px-2 py-1 text-text-primary">emit</span>
            </div>
            <ul className="mt-4 space-y-1 text-xs">
              <li><strong className="text-text-primary">source</strong> &mdash; Reads chunks from a ReadableStream, SSE connection, or WebSocket.</li>
              <li><strong className="text-text-primary">parse</strong> &mdash; Feeds chunks into StreamParser, heals incomplete JSON.</li>
              <li><strong className="text-text-primary">throttle</strong> &mdash; Batches rapid updates to limit re-renders (configurable interval).</li>
              <li><strong className="text-text-primary">resolve</strong> &mdash; Expands abbreviations and resolves the component from the registry.</li>
              <li><strong className="text-text-primary">emit</strong> &mdash; Fires snapshot, complete, or error events to listeners.</li>
            </ul>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Configuration</h3>
          <CodeBlock
            language="typescript"
            filename="stream-resolver-config.ts"
            code={`import { StreamResolver } from '@genuikit/core';
import { registry } from './registry';

const resolver = new StreamResolver(registry, {
  // Minimum interval between snapshot events (ms).
  // Lower = smoother updates, higher = fewer re-renders.
  throttleMs: 50,

  // Wire format abbreviation map for decoding compact payloads.
  abbreviations: {
    WeatherCard: 'WC',
    temperature: 'tmp',
    condition: 'cnd',
    humidity: 'hmd',
    city: 'c',
    props: 'p',
    type: 't',
  },

  // Retry configuration with exponential backoff.
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,    // First retry after 1s
    maxDelayMs: 10000,    // Cap at 10s
    backoffFactor: 2,     // 1s -> 2s -> 4s
  },
});`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Event Types</h3>
          <p className="text-text-secondary mb-4">
            Subscribe to events to react to stream progress:
          </p>
          <CodeBlock
            language="typescript"
            filename="stream-resolver-events.ts"
            code={`import { StreamResolver } from '@genuikit/core';
import { registry } from './registry';

const resolver = new StreamResolver(registry, { throttleMs: 50 });

// Fired on each throttled update with the current partial data
resolver.on('snapshot', (event) => {
  console.log('Partial data:', event.data);
  console.log('Component type:', event.componentType);  // null until identified
  console.log('Progress:', event.bytesReceived);
});

// Fired once when the stream ends and the final payload is valid
resolver.on('complete', (event) => {
  console.log('Final component:', event.componentType);
  console.log('Final props:', event.props);
  console.log('Duration:', event.durationMs, 'ms');
});

// Fired if the stream errors or the final payload fails validation
resolver.on('error', (event) => {
  console.error('Stream error:', event.error);
  console.log('Attempt:', event.attempt, 'of', event.maxAttempts);
  console.log('Will retry:', event.willRetry);
});

// Start processing a stream
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Weather in Tokyo' }),
});

resolver.start(response.body!);`}
          />
        </section>

        {/* Real-World Example */}
        <section id="real-world" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Real-World Example</h2>
          <p className="text-text-secondary mb-4">
            This end-to-end example shows a Next.js API route that streams component
            JSON from an LLM, paired with a client component that progressively renders
            the result. Both the server and client code are included.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Server: API Route</h3>
          <p className="text-text-secondary mb-4">
            The API route calls the LLM with the component tool definitions and streams
            the response back to the client as a text stream:
          </p>
          <CodeBlock
            language="typescript"
            filename="app/api/chat/route.ts"
            code={`import { NextRequest } from 'next/server';
import { registry } from '@/lib/registry';
import { generateWireFormatPrompt } from '@genuikit/core/wire-format';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const wireFormatBlock = generateWireFormatPrompt(registry);

  const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      stream: true,
      messages: [
        {
          role: 'system',
          content: \`You are a UI assistant. Respond ONLY with component JSON.
Available components:
\${registry.toToolDefinition()}

\${wireFormatBlock}\`,
        },
        { role: 'user', content: message },
      ],
    }),
  });

  // Transform the SSE stream into a plain text stream of JSON tokens
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = llmResponse.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\\n').filter((line) => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Client: Streaming Component</h3>
          <p className="text-text-secondary mb-4">
            The client component sends a message, passes the fetch response directly to{' '}
            <InlineCode>useStreamingUI</InlineCode>, and renders progressively:
          </p>
          <CodeBlock
            language="tsx"
            filename="components/chat-panel.tsx"
            code={`'use client';

import { useState, useCallback } from 'react';
import { useStreamingUI } from '@genuikit/react';
import { registry } from '@/lib/registry';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<Response | null>(null);
  const [history, setHistory] = useState<React.ReactNode[]>([]);

  const { element, phase, errors } = useStreamingUI(registry, response, {
    skeleton: (
      <div className="animate-pulse space-y-3 p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    ),
    fallback: (
      <div className="border border-red-300 bg-red-50 rounded-lg p-4">
        <p className="text-red-600 font-medium">Failed to render component</p>
        {errors && <p className="text-red-400 text-sm mt-1">{errors.join(', ')}</p>}
      </div>
    ),
    onComplete: (result) => {
      // Archive the completed component into history
      setHistory((prev) => [...prev, element]);
      setResponse(null);
    },
    retry: 2,
  });

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    setInput('');
    setResponse(res);
  }, [input]);

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((item, i) => (
          <div key={i} className="border rounded-lg p-4">
            {item}
          </div>
        ))}

        {/* Current streaming element */}
        {phase !== 'pending' && element && (
          <div className="border rounded-lg p-4 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-blue-500 font-medium uppercase">
                {phase}
              </span>
              {phase === 'partial' && (
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            {element}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Ask for a UI component..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={phase === 'partial' || phase === 'skeleton'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}`}
          />
        </section>
      </div>

      <OnThisPage headings={headings} />
    </div>
  );
}
