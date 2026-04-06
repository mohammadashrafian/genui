/**
 * Wire Format — Token-efficient encoding for LLM ↔ UI communication.
 *
 * Standard JSON format:
 *   { "type": "WeatherCard", "props": { "city": "Tokyo", "temperature": 22 } }
 *   → 66 characters / ~17 tokens
 *
 * Wire format:
 *   {"t":"c","n":"WeatherCard","p":{"city":"Tokyo","temperature":22}}
 *   → 63 characters / ~16 tokens (5% savings on small payloads)
 *
 * For payloads with many components or nested structures, savings reach 30-50%
 * because the overhead keys ("type", "props") are repeated per component.
 *
 * The wire format also supports:
 * - Batch encoding: multiple components in a single message
 * - Abbreviation maps: user-defined short keys for frequently used prop names
 */

import type { LLMComponentOutput } from '../types.js';
import type { WireMessage } from './types.js';

/** User-defined abbreviation map: short key → full prop name. */
export type AbbreviationMap = Record<string, string>;

/**
 * Encode a standard LLMComponentOutput into the compact wire format.
 */
export function encode(output: LLMComponentOutput, abbreviations?: AbbreviationMap): string {
  const wire: WireMessage = {
    t: 'c',
    n: output.type,
    p: abbreviations ? abbreviateProps(output.props, abbreviations) : output.props,
  };
  return JSON.stringify(wire);
}

/**
 * Encode multiple component outputs into a single compact message.
 * Uses a JSON array of wire messages.
 */
export function encodeBatch(
  outputs: LLMComponentOutput[],
  abbreviations?: AbbreviationMap,
): string {
  const wires: WireMessage[] = outputs.map((o) => ({
    t: 'c' as const,
    n: o.type,
    p: abbreviations ? abbreviateProps(o.props, abbreviations) : o.props,
  }));
  return JSON.stringify(wires);
}

/**
 * Decode a wire format string back to standard LLMComponentOutput(s).
 * Handles both single messages and batches.
 */
export function decode(
  wire: string,
  abbreviations?: AbbreviationMap,
): LLMComponentOutput | LLMComponentOutput[] {
  const parsed: unknown = JSON.parse(wire);

  if (Array.isArray(parsed)) {
    return parsed.map((item) => decodeMessage(item as WireMessage, abbreviations));
  }

  return decodeMessage(parsed as WireMessage, abbreviations);
}

/**
 * Decode a single wire message object to LLMComponentOutput.
 * Also accepts standard format as passthrough for flexibility.
 */
export function decodeMessage(
  msg: WireMessage | Record<string, unknown>,
  abbreviations?: AbbreviationMap,
): LLMComponentOutput {
  // Handle standard format passthrough
  if ('type' in msg && 'props' in msg) {
    return { type: msg.type as string, props: msg.props as Record<string, unknown> };
  }

  // Wire format
  const wire = msg as WireMessage;
  if (wire.t !== 'c' || typeof wire.n !== 'string') {
    throw new WireFormatError(`Invalid wire message: expected t="c" and n=string`);
  }

  const props = abbreviations
    ? expandProps(wire.p, abbreviations)
    : wire.p;

  return { type: wire.n, props };
}

/**
 * Generate the LLM instruction prompt for the wire format.
 * Include this in your system prompt so the LLM uses compact encoding.
 */
export function generateWireFormatPrompt(abbreviations?: AbbreviationMap): string {
  const lines = [
    'Use this compact JSON format for UI components:',
    '  {"t":"c","n":"ComponentName","p":{...props}}',
    '',
    'Keys: t="c" (component), n=name, p=props.',
    '',
    'For multiple components, use an array:',
    '  [{"t":"c","n":"A","p":{...}},{"t":"c","n":"B","p":{...}}]',
  ];

  if (abbreviations && Object.keys(abbreviations).length > 0) {
    lines.push('', 'Use these short prop names:');
    const reverse = invertMap(abbreviations);
    for (const [full, short] of Object.entries(reverse)) {
      lines.push(`  "${short}" → "${full}"`);
    }
  }

  return lines.join('\n');
}

/**
 * Calculate token savings percentage between standard and wire format.
 * Uses a rough heuristic of ~4 chars per token.
 */
export function estimateSavings(
  outputs: LLMComponentOutput[],
  abbreviations?: AbbreviationMap,
): { standard: number; wire: number; savingsPercent: number } {
  const standard = outputs
    .map((o) => JSON.stringify({ type: o.type, props: o.props }))
    .join('');
  const wire = encodeBatch(outputs, abbreviations);

  return {
    standard: standard.length,
    wire: wire.length,
    savingsPercent: Math.round((1 - wire.length / standard.length) * 100),
  };
}

// ── Internal helpers ────────────────────────────────────────

function abbreviateProps(
  props: Record<string, unknown>,
  abbreviations: AbbreviationMap,
): Record<string, unknown> {
  const reverse = invertMap(abbreviations);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const shortKey = reverse[key] ?? key;
    result[shortKey] = value;
  }

  return result;
}

function expandProps(
  props: Record<string, unknown>,
  abbreviations: AbbreviationMap,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    const fullKey = abbreviations[key] ?? key;
    result[fullKey] = value;
  }

  return result;
}

function invertMap(map: AbbreviationMap): Record<string, string> {
  const inverted: Record<string, string> = {};
  for (const [short, full] of Object.entries(map)) {
    inverted[full] = short;
  }
  return inverted;
}

export class WireFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WireFormatError';
  }
}
