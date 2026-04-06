import { describe, it, expect, beforeEach } from 'vitest';
import { StreamParser } from '../../stream/stream-parser.js';

describe('StreamParser', () => {
  let parser: StreamParser;

  beforeEach(() => {
    parser = new StreamParser();
  });

  describe('complete JSON', () => {
    it('should parse a complete JSON object in one chunk', () => {
      const result = parser.push('{"type":"Button","props":{"label":"Click"}}');
      expect(result).not.toBeNull();
      expect(result!.complete).toBe(true);
      expect(result!.value).toEqual({ type: 'Button', props: { label: 'Click' } });
    });

    it('should report consumed characters', () => {
      const input = '{"key":"value"}';
      const result = parser.push(input);
      expect(result!.consumed).toBe(input.length);
    });

    it('should mark as complete', () => {
      parser.push('{"done":true}');
      expect(parser.complete).toBe(true);
    });
  });

  describe('incremental parsing', () => {
    it('should parse progressively as chunks arrive', () => {
      const r1 = parser.push('{"type":"Card"');
      expect(r1).not.toBeNull();
      expect(r1!.complete).toBe(false);
      expect(r1!.value).toEqual({ type: 'Card' });

      const r2 = parser.push(',"props":{"title":"Hello"');
      expect(r2).not.toBeNull();
      expect(r2!.value).toHaveProperty('props');

      const r3 = parser.push('}}');
      expect(r3).not.toBeNull();
      expect(r3!.complete).toBe(true);
      expect(r3!.value).toEqual({ type: 'Card', props: { title: 'Hello' } });
    });

    it('should handle single character chunks', () => {
      const json = '{"a":"b"}';
      let result = null;
      for (const char of json) {
        result = parser.push(char);
      }
      expect(result).not.toBeNull();
      expect(result!.complete).toBe(true);
      expect(result!.value).toEqual({ a: 'b' });
    });

    it('should handle token-by-token LLM output', () => {
      // Simulate LLM streaming tokens
      const tokens = ['{"', 'type', '":"', 'Alert', '","', 'props', '":{"', 'message', '":"', 'Warning!', '"}}'];
      let lastResult = null;

      for (const token of tokens) {
        const r = parser.push(token);
        if (r) lastResult = r;
      }

      expect(lastResult).not.toBeNull();
      expect(lastResult!.complete).toBe(true);
      expect(lastResult!.value).toEqual({
        type: 'Alert',
        props: { message: 'Warning!' },
      });
    });
  });

  describe('healing incomplete JSON', () => {
    it('should close unclosed objects', () => {
      const result = parser.push('{"key":"value"');
      expect(result).not.toBeNull();
      expect(result!.value).toEqual({ key: 'value' });
      expect(result!.complete).toBe(false);
    });

    it('should close nested unclosed objects', () => {
      const result = parser.push('{"outer":{"inner":"value"');
      expect(result).not.toBeNull();
      expect(result!.value).toEqual({ outer: { inner: 'value' } });
    });

    it('should close unclosed arrays', () => {
      const result = parser.push('{"items":[1,2,3');
      expect(result).not.toBeNull();
      expect(result!.value).toEqual({ items: [1, 2, 3] });
    });

    it('should close unclosed strings', () => {
      const result = parser.push('{"name":"partial tex');
      expect(result).not.toBeNull();
      expect(result!.value).toHaveProperty('name');
      // The healed value should contain the partial text
      expect((result!.value.name as string).startsWith('partial tex')).toBe(true);
    });

    it('should handle trailing commas', () => {
      const result = parser.push('{"a":1,"b":2,');
      expect(result).not.toBeNull();
      expect(result!.value).toEqual({ a: 1, b: 2 });
    });

    it('should handle mixed nested structures', () => {
      const result = parser.push('{"data":[{"id":1},{"id":2');
      expect(result).not.toBeNull();
      const data = result!.value.data as unknown[];
      expect(data).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should return null for non-object input', () => {
      expect(parser.push('hello')).toBeNull();
      expect(parser.push('[1,2,3]')).toBeNull();
      expect(parser.push('42')).toBeNull();
    });

    it('should return null for empty input', () => {
      expect(parser.push('')).toBeNull();
    });

    it('should handle escaped characters in strings', () => {
      const result = parser.push('{"text":"he said \\"hello\\""}');
      expect(result).not.toBeNull();
      expect(result!.value.text).toBe('he said "hello"');
    });

    it('should handle unicode in strings', () => {
      const result = parser.push('{"city":"東京"}');
      expect(result).not.toBeNull();
      expect(result!.value.city).toBe('東京');
    });

    it('should handle boolean and null values', () => {
      const result = parser.push('{"active":true,"deleted":false,"note":null}');
      expect(result).not.toBeNull();
      expect(result!.value).toEqual({ active: true, deleted: false, note: null });
    });

    it('should handle number values', () => {
      const result = parser.push('{"int":42,"float":3.14,"neg":-1,"exp":1e10}');
      expect(result).not.toBeNull();
      expect(result!.value.int).toBe(42);
      expect(result!.value.float).toBe(3.14);
      expect(result!.value.neg).toBe(-1);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      parser.push('{"a":1}');
      expect(parser.complete).toBe(true);
      expect(parser.current).not.toBeNull();

      parser.reset();
      expect(parser.complete).toBe(false);
      expect(parser.current).toBeNull();
      expect(parser.consumed).toBe(0);
    });

    it('should allow reuse after reset', () => {
      parser.push('{"first":true}');
      parser.reset();
      const result = parser.push('{"second":true}');
      expect(result!.value).toEqual({ second: true });
    });
  });

  describe('current getter', () => {
    it('should return the last valid parsed object', () => {
      parser.push('{"type":"Button"');
      expect(parser.current).toEqual({ type: 'Button' });

      parser.push(',"label":"Click"');
      expect(parser.current).toEqual({ type: 'Button', label: 'Click' });
    });

    it('should not regress on unparseable chunks', () => {
      parser.push('{"type":"Button"');
      const first = parser.current;

      // This push adds incomplete content but parser should still retain last valid
      parser.push(',');
      expect(parser.current).not.toBeNull();
    });
  });
});
