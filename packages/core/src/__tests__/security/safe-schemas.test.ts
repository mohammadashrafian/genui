import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { safeString, safeUrl, safeHtml, safeCssClass } from '../../security/safe-schemas.js';

describe('safeString', () => {
  it('passes clean strings through', () => {
    const schema = safeString();
    expect(schema.parse('Hello World')).toBe('Hello World');
  });

  it('strips HTML tags', () => {
    const schema = safeString();
    expect(schema.parse('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('removes control characters', () => {
    const schema = safeString();
    expect(schema.parse('hel\x00lo')).toBe('hello');
  });

  it('enforces max length', () => {
    const schema = safeString({ maxLength: 10 });
    expect(schema.parse('short')).toBe('short');
    expect(schema.parse('a'.repeat(20)).length).toBeLessThanOrEqual(10);
  });

  it('rejects non-strings', () => {
    const schema = safeString();
    expect(() => schema.parse(123)).toThrow();
  });

  it('combines multiple sanitizations', () => {
    const schema = safeString({ maxLength: 50 });
    const input = '<div>\x00Hello <script>evil</script> world</div>';
    const result = schema.parse(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('\x00');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });
});

describe('safeUrl', () => {
  it('allows https URLs', () => {
    const schema = safeUrl();
    expect(schema.parse('https://example.com')).toBe('https://example.com/');
  });

  it('allows http URLs', () => {
    const schema = safeUrl();
    expect(schema.parse('http://example.com')).toBe('http://example.com/');
  });

  it('rejects javascript: URLs', () => {
    const schema = safeUrl();
    expect(() => schema.parse('javascript:alert(1)')).toThrow();
  });

  it('rejects data: URIs', () => {
    const schema = safeUrl();
    expect(() => schema.parse('data:text/html,<script>x</script>')).toThrow();
  });

  it('rejects case-insensitive javascript:', () => {
    const schema = safeUrl();
    expect(() => schema.parse('JAVASCRIPT:alert(1)')).toThrow();
  });

  it('custom allowed schemes', () => {
    const schema = safeUrl({ allowedSchemes: ['https'] });
    expect(schema.parse('https://example.com')).toBe('https://example.com/');
    expect(() => schema.parse('http://example.com')).toThrow();
  });
});

describe('safeHtml', () => {
  it('keeps allowed tags', () => {
    const schema = safeHtml();
    const result = schema.parse('<b>bold</b> <em>italic</em>');
    expect(result).toContain('<b>');
    expect(result).toContain('<em>');
  });

  it('strips disallowed tags', () => {
    const schema = safeHtml();
    const result = schema.parse('<b>ok</b><script>bad</script>');
    expect(result).toContain('<b>');
    expect(result).not.toContain('<script>');
  });

  it('strips attributes from allowed tags', () => {
    const schema = safeHtml();
    const result = schema.parse('<a href="http://x.com" onclick="evil()">link</a>');
    expect(result).toContain('<a>');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('href');
  });

  it('enforces max length', () => {
    const schema = safeHtml({ maxLength: 20 });
    const result = schema.parse('<b>a</b>'.repeat(100));
    expect(result.length).toBeLessThanOrEqual(20);
  });
});

describe('safeCssClass', () => {
  it('allows standard CSS classes', () => {
    const schema = safeCssClass();
    expect(schema.parse('btn btn-primary')).toBe('btn btn-primary');
  });

  it('allows Tailwind classes', () => {
    const schema = safeCssClass();
    expect(schema.parse('w-1/2 md:flex')).toBe('w-1/2 md:flex');
  });

  it('allows Tailwind arbitrary values', () => {
    const schema = safeCssClass();
    expect(schema.parse('bg-[#ff0000]')).toBe('bg-[#ff0000]');
  });

  it('allows BEM notation', () => {
    const schema = safeCssClass();
    expect(schema.parse('block__element--modifier')).toBe('block__element--modifier');
  });

  it('rejects CSS injection attempts', () => {
    const schema = safeCssClass();
    expect(() => schema.parse('btn; background: url(javascript:alert(1))')).toThrow();
  });

  it('rejects expression() injection', () => {
    const schema = safeCssClass();
    expect(() => schema.parse('expression(alert(1))')).toThrow();
  });

  it('rejects url() injection', () => {
    const schema = safeCssClass();
    expect(() => schema.parse('url(evil)')).toThrow();
  });

  it('enforces max length', () => {
    const schema = safeCssClass({ maxLength: 10 });
    expect(() => schema.parse('a'.repeat(20))).toThrow();
  });
});

describe('composition with z.object', () => {
  it('works as part of a larger schema', () => {
    const schema = z.object({
      title: safeString({ maxLength: 100 }),
      link: safeUrl(),
      className: safeCssClass().optional(),
    });

    const result = schema.parse({
      title: '<b>My Title</b>',
      link: 'https://example.com',
      className: 'card card-primary',
    });

    expect(result.title).toBe('My Title');
    expect(result.link).toBe('https://example.com/');
    expect(result.className).toBe('card card-primary');
  });
});
