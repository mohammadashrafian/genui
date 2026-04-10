# @genuikit/core

## 0.6.0

### Minor Changes

- [`67da305`](https://github.com/mohammadashrafian/genuikit/commit/67da3052f954a857b675c596ab9ce2ab6898bc4f) Thanks [@mohammadashrafian](https://github.com/mohammadashrafian)! - Add subpath exports and lightweight client renderer for smaller bundles
  - Add subpath exports (`/client`, `/stream`, `/wire-format`, `/action`, `/security`) to `@genuikit/core` so consumers can import only what they need
  - Add subpath exports (`/client`, `/render`, `/streaming`, `/co-agent`, `/dev`) to `@genuikit/react`
  - Add `ComponentRenderRegistry` for Zod-free client-side rendering of server-validated payloads
  - Add `useValidatedUI` hook and `ValidatedUI` component for the lightweight client flow
  - Mark all packages with `sideEffects: false` for better tree-shaking
  - Externalize `zod` in core build to prevent inlining

## 0.5.3

### Patch Changes

- [`39feb02`](https://github.com/mohammadashrafian/genuikit/commit/39feb02a6b9fe3dd8b21756faa0ecd620208216e) Thanks [@mohammadashrafian](https://github.com/mohammadashrafian)! - Fix release workflow: add registry-url for OIDC authentication

## 0.5.2

### Patch Changes

- [`f0b4d33`](https://github.com/mohammadashrafian/genuikit/commit/f0b4d33a5d43716c9f436c1527ad0141cc2cc117) Thanks [@mohammadashrafian](https://github.com/mohammadashrafian)! - Fix release workflow to use npm publish with OIDC provenance directly

## 0.5.1

### Patch Changes

- [`c701f05`](https://github.com/mohammadashrafian/genuikit/commit/c701f05d46bb26e8b14a09fb745de70ae2ab7a60) Thanks [@mohammadashrafian](https://github.com/mohammadashrafian)! - Retrigger npm publish for v0.5.0 release

## 0.5.0

### Minor Changes

- [`0ea3bd6`](https://github.com/mohammadashrafian/genuikit/commit/0ea3bd6547d958706927b6ffa0ffab0501c06b18) Thanks [@mohammadashrafian](https://github.com/mohammadashrafian)! - Expand adapters to 30 components per adapter (10 base + 20 shared advanced), add LLM retry flow integration test, update CLI templates, and publish documentation site.

  New shared components: Accordion, Breadcrumbs, Pagination, ProgressBar, Skeleton, Tooltip, Textarea, Checkbox, RadioGroup, Switch, Slider, Form, Stepper, StatCard, Timeline, BarChart, LineChart, PieChart, AreaChart, Map.
