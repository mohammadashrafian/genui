/**
 * Streaming Demo
 *
 * Demonstrates Phase 2 features:
 * 1. StreamParser — incremental JSON parsing
 * 2. Wire format — token-efficient encoding
 * 3. StreamResolver — progressive validation from a stream
 * 4. Retry logic — automatic recovery from stream failures
 */

import { z } from 'zod';
import {
  ComponentRegistry,
  StreamParser,
  StreamResolver,
  encode,
  decode,
  encodeBatch,
  estimateSavings,
  generateWireFormatPrompt,
} from '@genuikit/core';
import type { StreamEvent } from '@genuikit/core';

// ─── Setup ──────────────────────────────────────────────────

const weatherSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']),
});

const StubWeather = (props: z.infer<typeof weatherSchema>) => props;

const registry = new ComponentRegistry();
registry.register('WeatherCard', weatherSchema, StubWeather);

// ─── 1. StreamParser Demo ───────────────────────────────────

console.log('═══ 1. StreamParser — Incremental JSON Parsing ═══\n');

const parser = new StreamParser();
const json = '{"type":"WeatherCard","props":{"city":"Tokyo","temperature":22,"condition":"sunny"}}';

// Simulate token-by-token streaming
const tokens = json.match(/.{1,8}/g) ?? [];
console.log(`Streaming ${tokens.length} chunks:\n`);

for (const token of tokens) {
  const result = parser.push(token);
  if (result) {
    const status = result.complete ? '✓ COMPLETE' : '⋯ partial';
    const keys = Object.keys(result.value);
    console.log(`  [${status}] keys: ${keys.join(', ')}`);
  }
}

console.log(`\nFinal: ${JSON.stringify(parser.current, null, 2)}\n`);

// ─── 2. Wire Format Demo ────────────────────────────────────

console.log('═══ 2. Wire Format — Token-Efficient Encoding ═══\n');

const standard = { type: 'WeatherCard', props: { city: 'Tokyo', temperature: 22, condition: 'sunny' } };
const wire = encode(standard);
const decoded = decode(wire);

console.log(`Standard: ${JSON.stringify(standard)}`);
console.log(`   Chars: ${JSON.stringify(standard).length}\n`);
console.log(`Wire:     ${wire}`);
console.log(`   Chars: ${wire.length}\n`);
console.log(`Decoded:  ${JSON.stringify(decoded)}\n`);

// With abbreviations
const abbreviations = { c: 'city', t: 'temperature', u: 'unit', co: 'condition' };
const wireAbbr = encode(standard, abbreviations);
console.log(`Wire+Abbr: ${wireAbbr}`);
console.log(`   Chars:  ${wireAbbr.length}\n`);

// Batch savings
const batch = Array.from({ length: 5 }, (_, i) => ({
  type: 'WeatherCard',
  props: { city: `City ${i}`, temperature: 20 + i, condition: 'sunny' as const },
}));

const savings = estimateSavings(batch, abbreviations);
console.log(`Batch savings (5 components + abbreviations):`);
console.log(`  Standard: ${savings.standard} chars`);
console.log(`  Wire:     ${savings.wire} chars`);
console.log(`  Savings:  ${savings.savingsPercent}%\n`);

console.log(`LLM prompt for wire format:\n${generateWireFormatPrompt(abbreviations)}\n`);

// ─── 3. StreamResolver Demo ─────────────────────────────────

console.log('═══ 3. StreamResolver — Progressive Validation ═══\n');

async function* simulateLLMStream(): AsyncGenerator<string> {
  const output = '{"type":"WeatherCard","props":{"city":"Paris","temperature":18,"condition":"cloudy"}}';
  const chunks = output.match(/.{1,12}/g) ?? [];
  for (const chunk of chunks) {
    await new Promise((r) => setTimeout(r, 50));
    yield chunk;
  }
}

const resolver = new StreamResolver({ registry, throttleMs: 0 });

const final = await resolver.consume(
  { source: simulateLLMStream() },
  (event: StreamEvent) => {
    if (event.type === 'snapshot') {
      const s = event.data;
      const bar = '█'.repeat(Math.round(s.progress * 20)).padEnd(20, '░');
      console.log(`  [${s.phase.padEnd(8)}] ${bar} ${Math.round(s.progress * 100)}%`);
    }
    if (event.type === 'complete') {
      console.log(`  ✓ Complete! Props: ${JSON.stringify(event.data.props)}`);
    }
  },
);

console.log(`\nFinal phase: ${final.phase}\n`);

// ─── 4. Retry Demo ──────────────────────────────────────────

console.log('═══ 4. Retry Logic — Automatic Recovery ═══\n');

let attempt = 0;

const retryResolver = new StreamResolver({
  registry,
  throttleMs: 0,
  retry: {
    maxRetries: 2,
    baseDelay: 100,
    onRetry: (a) => {
      console.log(`  ⟳ Retry attempt ${a}`);
      return true;
    },
  },
});

const sourceFactory = () => {
  async function* stream(): AsyncGenerator<string> {
    attempt++;
    if (attempt < 3) {
      yield '{"type":"Weather';
      throw new Error(`Connection lost (attempt ${attempt})`);
    }
    yield '{"type":"WeatherCard","props":{"city":"London","temperature":12,"condition":"rainy"}}';
  }
  return stream();
};

const retryFinal = await retryResolver.consume(
  { source: sourceFactory },
  (event: StreamEvent) => {
    if (event.type === 'error') {
      console.log(`  ✗ Error: ${event.data.message}`);
    }
    if (event.type === 'complete') {
      console.log(`  ✓ Recovered! Props: ${JSON.stringify(event.data.props)}`);
    }
  },
);

console.log(`\nFinal phase: ${retryFinal.phase}`);
console.log(`Total attempts: ${attempt}\n`);

console.log('═══ All demos complete! ═══');
