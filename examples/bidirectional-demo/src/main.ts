/**
 * GenUI Phase 3 Demo — Bidirectional Sync
 *
 * Demonstrates how UI components can send validated, structured actions
 * back to the AI agent through ActionRegistry, ActionQueue, and ActionSerializer.
 *
 * Run: pnpm start
 */

import { z } from 'zod';
import {
  ActionRegistry,
  ActionQueue,
  ActionSerializer,
} from '@genuikit/core';
import type { Action, ToolCallResult } from '@genuikit/core';

// ─── Schemas ───────────────────────────────────────────────────────────

const contactFormProps = z.object({
  title: z.string(),
  fields: z.array(z.string()),
});

const submitActionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

const resetActionSchema = z.object({
  reason: z.enum(['user', 'timeout', 'error']),
});

const ratingWidgetProps = z.object({
  maxStars: z.number().int().min(1).max(10),
});

const rateActionSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// ─── Dummy Components ──────────────────────────────────────────────────

const ContactForm = () => null;
const RatingWidget = () => null;

// ─── Setup ─────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║      GenUI Phase 3 — Bidirectional Sync Demo           ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log();

// 1. Create ActionRegistry and register components with action schemas
const registry = new ActionRegistry();

registry.registerWithActions(
  'ContactForm',
  contactFormProps,
  { onSubmit: submitActionSchema, onReset: resetActionSchema },
  ContactForm,
);

registry.registerWithActions(
  'RatingWidget',
  ratingWidgetProps,
  { onRate: rateActionSchema },
  RatingWidget,
);

console.log('✅ Registry created with 2 components:');
for (const name of registry.names()) {
  const actions = registry.actionNames(name);
  console.log(`   • ${name} — actions: [${actions.join(', ')}]`);
}
console.log();

// ─── Demo 1: Action Validation ─────────────────────────────────────────

console.log('─── Demo 1: Action Validation ───');
console.log();

// Valid action
const validResult = registry.validateAction('ContactForm', 'onSubmit', {
  name: 'Mohammad',
  email: 'mohammad@example.com',
  message: 'Hello from GenUI! This is great.',
});

console.log('Valid submit action:');
console.log(`  ok: ${validResult.ok}`);
console.log(`  id: ${validResult.action?.id}`);
console.log(`  component: ${validResult.action?.component}`);
console.log(`  action: ${validResult.action?.action}`);
console.log(`  payload: ${JSON.stringify(validResult.action?.payload)}`);
console.log();

// Invalid action — bad email
const invalidResult = registry.validateAction('ContactForm', 'onSubmit', {
  name: 'John',
  email: 'not-an-email',
  message: 'Short',
});

console.log('Invalid submit action (bad email + short message):');
console.log(`  ok: ${invalidResult.ok}`);
console.log(`  errors: ${invalidResult.errors?.length} validation issues`);
for (const err of invalidResult.errors ?? []) {
  console.log(`    - ${err.path.join('.')}: ${err.message}`);
}
console.log();

// Correction prompt for LLM
console.log('Correction prompt for LLM:');
console.log(`  ${invalidResult.correctionPrompt?.split('\n')[0]}`);
console.log();

// ─── Demo 2: ActionSerializer ──────────────────────────────────────────

console.log('─── Demo 2: Action Serialization ───');
console.log();

const serializer = new ActionSerializer();

if (validResult.action) {
  // Serialize as tool call result
  const toolCall = serializer.serialize(validResult.action);
  console.log('Tool call result (for LLM API):');
  console.log(JSON.stringify(toolCall, null, 2));
  console.log();

  // Format as human-readable prompt
  const prompt = serializer.toPrompt(validResult.action);
  console.log('Human-readable prompt:');
  console.log(prompt);
  console.log();
}

// Prefixed serializer (e.g., for multi-app scenarios)
const prefixedSerializer = new ActionSerializer({ prefix: 'genui' });
if (validResult.action) {
  const result = prefixedSerializer.serialize(validResult.action);
  console.log(`Prefixed tool name: ${result.tool}`);
  console.log();
}

// ─── Demo 3: ActionQueue ───────────────────────────────────────────────

console.log('─── Demo 3: ActionQueue with Conflict Resolution ───');
console.log();

// Queue with immediate dispatch
const immediateQueue = new ActionQueue();
const dispatchedActions: Action[] = [];
const toolCallResults: ToolCallResult[] = [];

immediateQueue.onAction((action) => {
  dispatchedActions.push(action);
});

immediateQueue.onToolCall((result) => {
  toolCallResults.push(result);
});

// Simulate rapid interactions
const rating1 = registry.validateAction('RatingWidget', 'onRate', { stars: 3 });
const rating2 = registry.validateAction('RatingWidget', 'onRate', { stars: 5, comment: 'Excellent!' });
const submit = registry.validateAction('ContactForm', 'onSubmit', {
  name: 'Mohammad',
  email: 'mohammad@example.com',
  message: 'This bidirectional sync is amazing!',
});

if (rating1.action) immediateQueue.push(rating1.action);
if (rating2.action) immediateQueue.push(rating2.action);
if (submit.action) immediateQueue.push(submit.action);

console.log(`Dispatched ${dispatchedActions.length} actions immediately`);
console.log(`Generated ${toolCallResults.length} tool call results`);
console.log();

for (const tc of toolCallResults) {
  console.log(`  📤 ${tc.tool} → ${JSON.stringify(tc.result.payload)}`);
}
console.log();

// Queue with conflict strategy: latest wins
console.log('Conflict strategy "latest" — rapid clicks:');
const latestQueue = new ActionQueue({ conflictStrategy: 'latest' });
const latestDispatched: Action[] = [];
latestQueue.onAction((a) => latestDispatched.push(a));

// Simulate 3 rapid rate changes — with "latest", each replaces the previous pending
const r1 = registry.validateAction('RatingWidget', 'onRate', { stars: 1 });
const r2 = registry.validateAction('RatingWidget', 'onRate', { stars: 3 });
const r3 = registry.validateAction('RatingWidget', 'onRate', { stars: 5 });

if (r1.action) latestQueue.push(r1.action);
if (r2.action) latestQueue.push(r2.action);
if (r3.action) latestQueue.push(r3.action);

console.log(`  Total dispatched: ${latestDispatched.length} (all immediate, no debounce)`);
console.log();

// ─── Demo 4: Batch Serialization ───────────────────────────────────────

console.log('─── Demo 4: Batch Prompt for LLM Context ───');
console.log();

const batchPrompt = serializer.toBatchPrompt(dispatchedActions);
console.log(batchPrompt);
console.log();

// ─── Demo 5: Error Handling ────────────────────────────────────────────

console.log('─── Demo 5: Error Handling ───');
console.log();

try {
  registry.validateAction('UnknownComponent', 'onClick', {});
} catch (err) {
  console.log(`ComponentNotFoundError: ${(err as Error).message}`);
}

try {
  registry.validateAction('ContactForm', 'unknownAction', {});
} catch (err) {
  console.log(`ActionNotFoundError: ${(err as Error).message}`);
}

console.log();

// ─── Summary ───────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  ✅ Phase 3 Complete — Bidirectional Sync Working!      ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log('║  Features demonstrated:                                 ║');
console.log('║  • ActionRegistry with component + action schemas       ║');
console.log('║  • Zod validation for action payloads                   ║');
console.log('║  • Correction prompts for invalid actions               ║');
console.log('║  • ActionSerializer → tool call results for LLM         ║');
console.log('║  • ActionQueue with conflict resolution                 ║');
console.log('║  • Batch serialization for conversation context         ║');
console.log('║  • Type-safe error handling                             ║');
console.log('╚══════════════════════════════════════════════════════════╝');
