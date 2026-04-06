/**
 * StreamParser — Incremental JSON parser for LLM output streams.
 *
 * LLMs emit tokens one at a time. This parser accumulates raw text and
 * attempts to extract a valid partial JSON object at each step by:
 * 1. Accumulating the raw string buffer
 * 2. Attempting to close any open braces/brackets/strings
 * 3. Parsing the "healed" JSON
 *
 * This is a zero-dependency, allocation-efficient implementation.
 */

export interface ParsedChunk {
  /** The parsed partial object (may have missing fields). */
  readonly value: Record<string, unknown>;
  /** Whether the JSON is fully complete (all braces closed naturally). */
  readonly complete: boolean;
  /** Number of raw characters consumed so far. */
  readonly consumed: number;
}

export class StreamParser {
  private buffer = '';
  private lastValid: Record<string, unknown> | null = null;
  private isComplete = false;

  /** Total characters accumulated. */
  get consumed(): number {
    return this.buffer.length;
  }

  /** Whether the stream has produced a complete JSON object. */
  get complete(): boolean {
    return this.isComplete;
  }

  /** The last successfully parsed partial object, or null. */
  get current(): Record<string, unknown> | null {
    return this.lastValid;
  }

  /**
   * Feed a new chunk of text into the parser.
   * Returns a ParsedChunk if a valid partial object can be extracted, or null.
   */
  push(chunk: string): ParsedChunk | null {
    this.buffer += chunk;

    // Fast path: try parsing the buffer as-is first (complete JSON)
    const directResult = this.tryParse(this.buffer);
    if (directResult !== null) {
      this.lastValid = directResult;
      this.isComplete = this.isNaturallyComplete();
      return {
        value: directResult,
        complete: this.isComplete,
        consumed: this.buffer.length,
      };
    }

    // Slow path: heal the incomplete JSON by closing open structures
    const healed = this.heal(this.buffer);
    if (healed === null) return null;

    const healedResult = this.tryParse(healed);
    if (healedResult !== null) {
      this.lastValid = healedResult;
      return {
        value: healedResult,
        complete: false,
        consumed: this.buffer.length,
      };
    }

    return null;
  }

  /** Reset the parser to initial state. */
  reset(): void {
    this.buffer = '';
    this.lastValid = null;
    this.isComplete = false;
  }

  /**
   * Attempt to parse a JSON string, returning the object or null.
   * Only accepts objects (not arrays or primitives) at the top level.
   */
  private tryParse(str: string): Record<string, unknown> | null {
    const trimmed = str.trim();
    if (!trimmed.startsWith('{')) return null;

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Not valid JSON yet
    }
    return null;
  }

  /** Check if the raw buffer is naturally complete JSON (no healing needed). */
  private isNaturallyComplete(): boolean {
    const trimmed = this.buffer.trim();
    if (!trimmed.startsWith('{')) return false;
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Heal incomplete JSON by closing open strings, arrays, and objects.
   *
   * Strategy: scan character by character tracking the structural state,
   * then append the necessary closing tokens.
   *
   * Handles:
   * - Unclosed strings (appends `"`)
   * - Unclosed arrays (appends `]`)
   * - Unclosed objects (appends `}`)
   * - Trailing commas (removes them)
   * - Incomplete key-value pairs (removes or completes them)
   */
  heal(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed.startsWith('{')) return null;

    const stack: Array<'{' | '['> = [];
    let inString = false;
    let escaped = false;
    let i = 0;

    while (i < trimmed.length) {
      const char = trimmed[i]!;

      if (escaped) {
        escaped = false;
        i++;
        continue;
      }

      if (char === '\\' && inString) {
        escaped = true;
        i++;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        i++;
        continue;
      }

      if (inString) {
        i++;
        continue;
      }

      // Outside strings — track structure
      if (char === '{') {
        stack.push('{');
        // structure tracking continues
      } else if (char === '[') {
        stack.push('[');
        // structure tracking continues
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
          // structure tracking continues
        }
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
          // structure tracking continues
        }
      } else if (char === ',' || char === ':') {
        // These are structural but we track them to detect trailing commas
      } else if (!/\s/.test(char)) {
        // structure tracking continues
      }

      i++;
    }

    // If nothing is open, the JSON might already be complete
    if (stack.length === 0 && !inString) {
      return trimmed;
    }

    // Build the healed suffix
    let result = trimmed;

    // Close an unclosed string
    if (inString) {
      result += '"';
    }

    // Remove trailing commas or colons that would make it invalid
    result = result.replace(/,\s*$/, '');
    result = result.replace(/:\s*$/, ': null');

    // Close open structures in reverse order
    for (let j = stack.length - 1; j >= 0; j--) {
      const open = stack[j];
      result += open === '{' ? '}' : ']';
    }

    return result;
  }
}
