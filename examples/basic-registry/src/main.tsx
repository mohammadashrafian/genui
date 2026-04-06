/**
 * Basic Registry Example
 *
 * Demonstrates how to:
 * 1. Create a ComponentRegistry
 * 2. Register components with Zod schemas
 * 3. Resolve LLM output to validated components
 * 4. Handle validation errors with correction prompts
 * 5. Generate tool definitions for LLMs
 */

import { ComponentRegistry } from '@genui/core';
import type { LLMComponentOutput } from '@genui/core';
import { Button, Card, Alert, Stat, buttonSchema, cardSchema, alertSchema, statSchema } from './components.js';

// ─── 1. Create and populate the registry ───────────────────

const registry = new ComponentRegistry();

registry
  .register('Button', buttonSchema, Button)
  .register('Card', cardSchema, Card)
  .register('Alert', alertSchema, Alert)
  .register('Stat', statSchema, Stat);

console.log(`✓ Registered ${registry.size} components: ${registry.names().join(', ')}\n`);

// ─── 2. Simulate valid LLM outputs ────────────────────────

const validOutputs: LLMComponentOutput[] = [
  { type: 'Button', props: { label: 'Submit Order', variant: 'primary' } },
  { type: 'Card', props: { title: 'Welcome', body: 'Get started with GenUI' } },
  { type: 'Alert', props: { message: 'File saved successfully', severity: 'info' } },
  { type: 'Stat', props: { label: 'Revenue', value: 42500, unit: 'USD', trend: 'up' } },
];

console.log('── Resolving valid outputs ──');
for (const output of validOutputs) {
  const result = registry.resolve(output);
  if (result.ok) {
    console.log(`  ✓ ${result.name} → props:`, result.props);
  }
}

// ─── 3. Simulate invalid LLM output ───────────────────────

console.log('\n── Resolving invalid output ──');
const invalidOutput: LLMComponentOutput = {
  type: 'Button',
  props: { label: 123, variant: 'invalid_variant' },
};

const errorResult = registry.resolve(invalidOutput);
if (!errorResult.ok) {
  console.log(`  ✗ ${errorResult.name} validation failed`);
  console.log('  Errors:', errorResult.errors);
  console.log('\n  Correction prompt for LLM:');
  console.log(errorResult.correctionPrompt.split('\n').map((l) => `    ${l}`).join('\n'));
}

// ─── 4. Generate tool definitions for LLMs ─────────────────

console.log('\n── Tool definitions (send to LLM) ──');
const tools = registry.toToolDefinition();
console.log(JSON.stringify(tools, null, 2));
