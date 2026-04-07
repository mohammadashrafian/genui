import { describe, it, expect } from 'vitest';
import {
  stripHtmlTags,
  escapeHtml,
  truncate,
  removeControlChars,
  normalizeWhitespace,
  sanitizeString,
  sanitizeHtml,
} from '../../security/sanitize.js';
import { DEFAULT_SECURITY_POLICY } from '../../security/policy.js';

const policy = DEFAULT_SECURITY_POLICY.config;

describe('stripHtmlTags', () => {
  it('removes simple tags', () => {
    expect(stripHtmlTags('<b>bold</b>')).toBe('bold');
    expect(stripHtmlTags('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('removes tags with attributes', () => {
    expect(stripHtmlTags('<img src=x onerror=alert(1)>')).toBe('');
    expect(stripHtmlTags('<a href="http://evil.com">click</a>')).toBe('click');
  });

  it('handles nested tags', () => {
    expect(stripHtmlTags('<div><p>text</p></div>')).toBe('text');
  });

  it('preserves text with no tags', () => {
    expect(stripHtmlTags('just text')).toBe('just text');
  });

  it('handles unclosed tags', () => {
    expect(stripHtmlTags('before<script after')).toBe('before');
  });

  it('handles empty input', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('handles angle brackets in text', () => {
    expect(stripHtmlTags('5 > 3 and 2 < 4')).toBe('5  3 and 2 ');
  });
});

describe('escapeHtml', () => {
  it('escapes all dangerous characters', () => {
    expect(escapeHtml('<script>"alert\'&')).toBe(
      '&lt;script&gt;&quot;alert&#x27;&amp;',
    );
  });

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('truncate', () => {
  it('returns input unchanged if within limit', () => {
    expect(truncate('short', 100)).toBe('short');
  });

  it('truncates to exact length', () => {
    expect(truncate('hello world', 5)).toBe('hello');
  });

  it('handles surrogate pairs', () => {
    // Don't split a surrogate pair
    const emoji = '😀'; // 2 chars (surrogate pair)
    const text = 'a' + emoji;
    expect(truncate(text, 2)).toBe('a'); // Would split pair at position 2, so backs up
  });
});

describe('removeControlChars', () => {
  it('removes null bytes', () => {
    expect(removeControlChars('hel\x00lo')).toBe('hello');
  });

  it('removes ASCII control chars', () => {
    expect(removeControlChars('a\x01b\x02c')).toBe('abc');
  });

  it('preserves tabs, newlines, carriage returns', () => {
    expect(removeControlChars('a\tb\nc\r')).toBe('a\tb\nc\r');
  });

  it('preserves regular text', () => {
    expect(removeControlChars('normal text')).toBe('normal text');
  });
});

describe('normalizeWhitespace', () => {
  it('collapses runs of whitespace', () => {
    expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
  });

  it('handles tabs and newlines', () => {
    expect(normalizeWhitespace('a\t\n\r  b')).toBe('a b');
  });
});

describe('sanitizeString', () => {
  it('applies full pipeline with default policy', () => {
    const result = sanitizeString('<script>alert(1)</script>', policy);
    expect(result).toBe('alert(1)');
  });

  it('removes control chars and strips HTML', () => {
    const result = sanitizeString('hel\x00lo <b>world</b>', policy);
    expect(result).toBe('hello world');
  });

  it('enforces max length', () => {
    const long = 'a'.repeat(20_000);
    const result = sanitizeString(long, policy);
    expect(result.length).toBeLessThanOrEqual(policy.maxStringLength);
  });

  it('respects stripHtml: false', () => {
    const noStripPolicy = { ...policy, stripHtml: false };
    const result = sanitizeString('<b>bold</b>', noStripPolicy);
    expect(result).toBe('<b>bold</b>');
  });
});

describe('sanitizeHtml', () => {
  it('keeps allowed tags', () => {
    const result = sanitizeHtml('<b>bold</b> <em>italic</em>', ['b', 'em'], 10000);
    expect(result).toBe('<b>bold</b> <em>italic</em>');
  });

  it('strips disallowed tags', () => {
    const result = sanitizeHtml('<b>bold</b> <script>evil</script>', ['b'], 10000);
    expect(result).toBe('<b>bold</b> evil');
  });

  it('strips all attributes from allowed tags', () => {
    const result = sanitizeHtml(
      '<a href="http://evil.com" onclick="alert(1)">click</a>',
      ['a'],
      10000,
    );
    expect(result).toBe('<a>click</a>');
  });

  it('enforces max length', () => {
    const result = sanitizeHtml('<b>a</b>'.repeat(1000), ['b'], 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('handles unclosed tags', () => {
    const result = sanitizeHtml('<b>text<br', ['b', 'br'], 10000);
    expect(result).toBe('<b>text');
  });
});
