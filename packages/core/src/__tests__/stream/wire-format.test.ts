import { describe, it, expect } from 'vitest';
import {
  encode,
  encodeBatch,
  decode,
  decodeMessage,
  generateWireFormatPrompt,
  estimateSavings,
  WireFormatError,
} from '../../stream/wire-format.js';

describe('Wire Format', () => {
  describe('encode', () => {
    it('should encode a standard output to wire format', () => {
      const result = encode({ type: 'Button', props: { label: 'Click' } });
      const parsed = JSON.parse(result);

      expect(parsed.t).toBe('c');
      expect(parsed.n).toBe('Button');
      expect(parsed.p).toEqual({ label: 'Click' });
    });

    it('should apply abbreviations', () => {
      const abbreviations = { l: 'label', v: 'variant' };
      const result = encode(
        { type: 'Button', props: { label: 'Click', variant: 'primary' } },
        abbreviations,
      );
      const parsed = JSON.parse(result);

      expect(parsed.p.l).toBe('Click');
      expect(parsed.p.v).toBe('primary');
      expect(parsed.p.label).toBeUndefined();
    });
  });

  describe('encodeBatch', () => {
    it('should encode multiple outputs as an array', () => {
      const result = encodeBatch([
        { type: 'Button', props: { label: 'A' } },
        { type: 'Card', props: { title: 'B' } },
      ]);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].n).toBe('Button');
      expect(parsed[1].n).toBe('Card');
    });
  });

  describe('decode', () => {
    it('should decode a single wire message', () => {
      const wire = JSON.stringify({ t: 'c', n: 'Button', p: { label: 'Click' } });
      const result = decode(wire);

      expect(result).not.toBeInstanceOf(Array);
      const single = result as { type: string; props: Record<string, unknown> };
      expect(single.type).toBe('Button');
      expect(single.props.label).toBe('Click');
    });

    it('should decode a batch of wire messages', () => {
      const wire = JSON.stringify([
        { t: 'c', n: 'A', p: { x: 1 } },
        { t: 'c', n: 'B', p: { y: 2 } },
      ]);
      const result = decode(wire);

      expect(Array.isArray(result)).toBe(true);
      const batch = result as Array<{ type: string; props: Record<string, unknown> }>;
      expect(batch).toHaveLength(2);
      expect(batch[0]!.type).toBe('A');
      expect(batch[1]!.type).toBe('B');
    });

    it('should expand abbreviations on decode', () => {
      const abbreviations = { l: 'label' };
      const wire = JSON.stringify({ t: 'c', n: 'Button', p: { l: 'Click' } });
      const result = decode(wire, abbreviations) as { type: string; props: Record<string, unknown> };

      expect(result.props.label).toBe('Click');
      expect(result.props.l).toBeUndefined();
    });
  });

  describe('decodeMessage', () => {
    it('should handle standard format passthrough', () => {
      const result = decodeMessage({ type: 'Button', props: { label: 'Click' } } as any);
      expect(result.type).toBe('Button');
      expect(result.props.label).toBe('Click');
    });

    it('should throw on invalid wire message', () => {
      expect(() => decodeMessage({ t: 'x', n: 123 } as any)).toThrow(WireFormatError);
    });
  });

  describe('roundtrip', () => {
    it('should encode and decode back to the same data', () => {
      const original = { type: 'Card', props: { title: 'Hello', count: 42 } };
      const wire = encode(original);
      const decoded = decode(wire) as { type: string; props: Record<string, unknown> };

      expect(decoded.type).toBe(original.type);
      expect(decoded.props).toEqual(original.props);
    });

    it('should roundtrip with abbreviations', () => {
      const abbreviations = { t: 'title', c: 'count' };
      const original = { type: 'Card', props: { title: 'Hello', count: 42 } };

      const wire = encode(original, abbreviations);
      const decoded = decode(wire, abbreviations) as { type: string; props: Record<string, unknown> };

      expect(decoded.type).toBe(original.type);
      expect(decoded.props).toEqual(original.props);
    });

    it('should roundtrip batches', () => {
      const originals = [
        { type: 'A', props: { x: 1 } },
        { type: 'B', props: { y: 'hello' } },
      ];

      const wire = encodeBatch(originals);
      const decoded = decode(wire) as Array<{ type: string; props: Record<string, unknown> }>;

      expect(decoded).toHaveLength(2);
      expect(decoded[0]!.type).toBe('A');
      expect(decoded[0]!.props).toEqual({ x: 1 });
      expect(decoded[1]!.type).toBe('B');
      expect(decoded[1]!.props).toEqual({ y: 'hello' });
    });
  });

  describe('estimateSavings', () => {
    it('should calculate savings with abbreviations', () => {
      const outputs = Array.from({ length: 10 }, (_, i) => ({
        type: 'Button',
        props: { label: `Click me ${i}`, variant: 'primary', disabled: false },
      }));
      const abbreviations = { l: 'label', v: 'variant', d: 'disabled' };

      const savings = estimateSavings(outputs, abbreviations);

      // Wire format + abbreviations saves significantly
      expect(savings.wire).toBeLessThan(savings.standard);
      expect(savings.savingsPercent).toBeGreaterThan(0);
    });

    it('should return savings stats for any input', () => {
      const outputs = [{ type: 'A', props: { x: 1 } }];
      const savings = estimateSavings(outputs);

      expect(typeof savings.standard).toBe('number');
      expect(typeof savings.wire).toBe('number');
      expect(typeof savings.savingsPercent).toBe('number');
    });

    it('should show greater savings with abbreviations', () => {
      const outputs = [
        { type: 'Button', props: { label: 'Click', variant: 'primary', disabled: false } },
      ];
      const abbreviations = { l: 'label', v: 'variant', d: 'disabled' };

      const withoutAbbr = estimateSavings(outputs);
      const withAbbr = estimateSavings(outputs, abbreviations);

      expect(withAbbr.savingsPercent).toBeGreaterThanOrEqual(withoutAbbr.savingsPercent);
    });
  });

  describe('generateWireFormatPrompt', () => {
    it('should generate a prompt without abbreviations', () => {
      const prompt = generateWireFormatPrompt();
      expect(prompt).toContain('"t":"c"');
      expect(prompt).toContain('"n":"ComponentName"');
      expect(prompt).toContain('"p"');
    });

    it('should include abbreviation mappings', () => {
      const prompt = generateWireFormatPrompt({ l: 'label', v: 'variant' });
      expect(prompt).toContain('label');
      expect(prompt).toContain('variant');
      expect(prompt).toContain('short prop names');
    });
  });
});
