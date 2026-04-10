import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useGenerativeUI } from '@genuikit/react';
import type {
  ChatHistoryEntry,
  ChatResponsePayload,
  DemoComponentOutput,
  DemoProvider,
  ValidationRetryTrace,
} from './lib/contracts.js';
import { fetchProviders, sendChatRequest } from './lib/api.js';
import { demoRegistry } from './lib/registry.js';

interface ChatMessage extends ChatHistoryEntry {
  readonly id: string;
  readonly meta?: {
    readonly provider: DemoProvider;
    readonly model: string;
    readonly validationRetries: number;
    readonly traces: ValidationRetryTrace[];
  };
}

const starterPrompts = [
  'Give me a launch checklist for shipping GenUI 1.0 this month.',
  'Compare OpenAI and Anthropic for a prototype that needs reliable JSON.',
  'Plan a two-week onboarding timeline for a new frontend engineer.',
  'Summarize the sprint metrics I should watch in a dashboard.',
] as const;

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Ask for a launch plan, comparison, dashboard, or execution checklist. The server will call a live model, validate the JSON with GenUI, retry if needed, and render the final component here.',
    component: {
      type: 'ActionPanel',
      props: {
        title: 'Best demo prompts',
        description: 'Use these to see different GenUI components show up in the chat.',
        actions: [
          {
            label: 'Launch checklist',
            description: 'Roadmap and shipping tasks.',
            emphasis: 'primary',
          },
          {
            label: 'Model comparison',
            description: 'Structured comparison table.',
          },
          {
            label: 'Sprint metrics',
            description: 'Headline metric board.',
          },
        ],
      },
    },
  },
];

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [providers, setProviders] = useState<
    Array<{ provider: DemoProvider; label: string; model: string; configured: boolean }>
  >([]);
  const [provider, setProvider] = useState<DemoProvider>('openai');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [, startTransition] = useTransition();
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    void fetchProviders()
      .then((payload) => {
        if (!active) {
          return;
        }

        setProviders(payload.providers);
        if (
          payload.providers.some(
            (entry) => entry.provider === payload.defaultProvider && entry.configured,
          )
        ) {
          setProvider(payload.defaultProvider);
          return;
        }

        const firstConfigured = payload.providers.find((entry) => entry.configured);
        if (firstConfigured) {
          setProvider(firstConfigured.provider);
        }
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setError(
          requestError instanceof Error ? requestError.message : 'Could not load providers.',
        );
      })
      .finally(() => {
        if (active) {
          setIsBooting(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const node = feedRef.current;
    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isSending]);

  const latestDebug = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.meta),
    [messages],
  );

  const activeProvider = providers.find((entry) => entry.provider === provider);
  const hasConfiguredProviders = providers.some((entry) => entry.configured);

  async function handleSend(override?: string) {
    const nextInput = (override ?? input).trim();
    if (!nextInput || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text: nextInput,
      component: null,
    };

    const outgoingHistory: ChatHistoryEntry[] = [
      ...messages.map((message) => ({
        role: message.role,
        text: message.text,
        component: message.component ?? null,
      })),
      {
        role: 'user',
        text: nextInput,
        component: null,
      },
    ];

    startTransition(() => {
      setMessages((current) => [...current, userMessage]);
    });

    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const reply = await sendChatRequest({
        provider,
        messages: outgoingHistory,
      });

      const assistantMessage = toAssistantMessage(reply);
      startTransition(() => {
        setMessages((current) => [...current, assistantMessage]);
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The demo request failed.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-side">
        <div className="brand-panel">
          <span className="eyebrow">GenUI workspace example</span>
          <h1>Live chat demo</h1>
          <p>
            A real chat UI with provider switching, JSON validation, correction prompts, retries,
            and final React rendering through GenUI.
          </p>
        </div>

        <section className="side-card">
          <div className="side-card-header">
            <h2>Provider</h2>
            {activeProvider && <span className="model-badge">{activeProvider.model}</span>}
          </div>
          {isBooting ? (
            <p className="muted">Checking configured API keys…</p>
          ) : hasConfiguredProviders ? (
            <div className="provider-grid">
              {providers.map((entry) => (
                <button
                  key={entry.provider}
                  type="button"
                  className={`provider-pill ${provider === entry.provider ? 'provider-pill-active' : ''}`}
                  disabled={!entry.configured || isSending}
                  onClick={() => setProvider(entry.provider)}
                >
                  <span>{entry.label}</span>
                  <small>{entry.configured ? entry.model : 'Missing API key'}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">
              Add an OpenAI or Anthropic key in <code>examples/chat-demo/.env</code> to enable the
              demo.
            </p>
          )}
        </section>

        <section className="side-card">
          <div className="side-card-header">
            <h2>Try prompts</h2>
          </div>
          <div className="prompt-list">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-chip"
                disabled={!hasConfiguredProviders || isSending}
                onClick={() => void handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <section className="side-card debug-card">
          <div className="side-card-header">
            <h2>Validation trace</h2>
            {latestDebug?.meta && (
              <span className="model-badge">
                {latestDebug.meta.validationRetries} retry
                {latestDebug.meta.validationRetries === 1 ? '' : 'ies'}
              </span>
            )}
          </div>
          {latestDebug?.meta ? (
            <div className="debug-stack">
              <p className="muted">
                Last assistant response used <strong>{latestDebug.meta.provider}</strong> with{' '}
                <strong>{latestDebug.meta.model}</strong>.
              </p>
              {latestDebug.meta.traces.length === 0 ? (
                <p className="muted">No correction retry was needed for the latest reply.</p>
              ) : (
                latestDebug.meta.traces.map((trace, index) => (
                  <details key={`${latestDebug.id}-trace-${index}`} className="debug-item">
                    <summary>Retry {index + 1}</summary>
                    <div className="debug-block">
                      <strong>Validation errors</strong>
                      <ul>
                        {trace.errors.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="debug-block">
                      <strong>Correction prompt</strong>
                      <pre>{trace.correctionPrompt}</pre>
                    </div>
                    <div className="debug-block">
                      <strong>Raw model output</strong>
                      <pre>{trace.rawText}</pre>
                    </div>
                  </details>
                ))
              )}
            </div>
          ) : (
            <p className="muted">
              Send a message to inspect the raw model JSON and any correction retries.
            </p>
          )}
        </section>
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <span className="eyebrow">examples/chat-demo</span>
            <h2>LLM JSON to live UI</h2>
          </div>
          {error && <div className="error-pill">{error}</div>}
        </header>

        <div ref={feedRef} className="chat-feed">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isSending && (
            <div className="bubble-row bubble-row-assistant">
              <div className="bubble bubble-assistant bubble-loading">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <label className="composer-label" htmlFor="chat-demo-input">
            Prompt
          </label>
          <textarea
            id="chat-demo-input"
            className="composer-input"
            placeholder="Ask for a plan, dashboard, comparison, or checklist…"
            value={input}
            disabled={!hasConfiguredProviders || isSending}
            rows={3}
            onChange={(event) => setInput(event.target.value)}
          />
          <div className="composer-actions">
            <p className="muted">
              The demo sends your full chat history, validates returned props, and retries with a
              correction prompt when needed.
            </p>
            <button
              type="submit"
              className="send-button"
              disabled={!hasConfiguredProviders || isSending || input.trim().length === 0}
            >
              {isSending ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`bubble-row ${isAssistant ? 'bubble-row-assistant' : 'bubble-row-user'}`}>
      <article className={`bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
        {message.meta && (
          <div className="bubble-meta">
            <span>{message.meta.provider}</span>
            <span>{message.meta.model}</span>
            <span>{message.meta.validationRetries} retries</span>
          </div>
        )}
        <p className="bubble-copy">{message.text}</p>
        {message.component && <RenderedGenUIComponent output={message.component} />}
      </article>
    </div>
  );
}

function RenderedGenUIComponent({ output }: { output: DemoComponentOutput }) {
  const { element, ok, correctionPrompt } = useGenerativeUI(demoRegistry, output);

  if (ok) {
    return <div className="rendered-ui">{element}</div>;
  }

  return (
    <div className="rendered-ui rendered-ui-error">
      <strong>Client-side validation failed</strong>
      <pre>{correctionPrompt}</pre>
    </div>
  );
}

function toAssistantMessage(response: ChatResponsePayload): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    text: response.reply.message,
    component: response.reply.component ?? null,
    meta: {
      provider: response.provider,
      model: response.model,
      validationRetries: response.validationRetries,
      traces: response.traces,
    },
  };
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
