# GenUI Chat Demo

A real end-to-end chat app for GenUI that:

- calls a live LLM provider from a local API server
- asks the model for JSON plus a UI component
- validates the component with `@genuikit/core` on the server
- retries with GenUI correction prompts if validation fails
- renders the final component in a React chat UI with the lightweight `@genuikit/react/client` mode

## Architecture

The demo intentionally uses the new server-validated flow:

- server: `ComponentRegistry` validates and normalizes model output
- network: only the trusted `{ type, props }` payload is sent to the browser
- client: `ComponentRenderRegistry` and `useValidatedUI` render without shipping schemas or Zod

## Providers

The demo supports both OpenAI and Anthropic.

- OpenAI: set `OPENAI_API_KEY`
- Anthropic: set `ANTHROPIC_API_KEY`

You can provide one or both keys. The UI will only show configured providers.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in at least one API key
3. Run `pnpm --filter @genuikit/example-chat-demo dev`
4. Open `http://localhost:5173`

The `predev` and `prebuild` scripts rebuild `@genuikit/core` and `@genuikit/react` first so the demo always runs against the latest local workspace code.

## Scripts

- `pnpm --filter @genuikit/example-chat-demo dev`
- `pnpm --filter @genuikit/example-chat-demo build`
- `pnpm --filter @genuikit/example-chat-demo serve`
