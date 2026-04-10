---
"@genuikit/core": minor
"@genuikit/react": minor
"@genuikit/adapters": minor
---

Add subpath exports and lightweight client renderer for smaller bundles

- Add subpath exports (`/client`, `/stream`, `/wire-format`, `/action`, `/security`) to `@genuikit/core` so consumers can import only what they need
- Add subpath exports (`/client`, `/render`, `/streaming`, `/co-agent`, `/dev`) to `@genuikit/react`
- Add `ComponentRenderRegistry` for Zod-free client-side rendering of server-validated payloads
- Add `useValidatedUI` hook and `ValidatedUI` component for the lightweight client flow
- Mark all packages with `sideEffects: false` for better tree-shaking
- Externalize `zod` in core build to prevent inlining
