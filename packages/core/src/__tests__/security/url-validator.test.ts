import { describe, it, expect } from 'vitest';
import { validateUrl, isBlockedScheme } from '../../security/url-validator.js';
import { DEFAULT_SECURITY_POLICY } from '../../security/policy.js';

const policy = DEFAULT_SECURITY_POLICY.config;

describe('validateUrl', () => {
  // --- Allowed URLs ---

  it('allows https URLs', () => {
    const result = validateUrl('https://example.com', policy);
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('https://example.com/');
  });

  it('allows http URLs', () => {
    const result = validateUrl('http://example.com/path', policy);
    expect(result.valid).toBe(true);
  });

  it('allows mailto URLs', () => {
    const result = validateUrl('mailto:user@example.com', policy);
    expect(result.valid).toBe(true);
  });

  it('allows relative URLs starting with /', () => {
    const result = validateUrl('/images/logo.png', policy);
    expect(result.valid).toBe(true);
  });

  it('allows relative URLs starting with ./', () => {
    const result = validateUrl('./style.css', policy);
    expect(result.valid).toBe(true);
  });

  it('allows hash URLs', () => {
    const result = validateUrl('#section-1', policy);
    expect(result.valid).toBe(true);
  });

  // --- Blocked schemes ---

  it('blocks javascript: URLs', () => {
    const result = validateUrl('javascript:alert(1)', policy);
    expect(result.valid).toBe(false);
    expect(result.violation?.rule).toBe('blocked-scheme');
  });

  it('blocks JAVASCRIPT: (case insensitive)', () => {
    const result = validateUrl('JAVASCRIPT:alert(1)', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks jAvAsCrIpT: (mixed case)', () => {
    const result = validateUrl('jAvAsCrIpT:alert(1)', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks javascript with embedded whitespace', () => {
    const result = validateUrl('java\tscript:alert(1)', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks javascript with null bytes', () => {
    const result = validateUrl('java\x00script:alert(1)', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks data: URIs', () => {
    const result = validateUrl('data:text/html,<script>alert(1)</script>', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks vbscript: URIs', () => {
    const result = validateUrl('vbscript:alert(1)', policy);
    expect(result.valid).toBe(false);
  });

  it('blocks blob: URIs', () => {
    const result = validateUrl('blob:https://evil.com/abc', policy);
    expect(result.valid).toBe(false);
  });

  // --- Edge cases ---

  it('rejects empty URLs', () => {
    const result = validateUrl('', policy);
    expect(result.valid).toBe(false);
    expect(result.violation?.rule).toBe('empty');
  });

  it('rejects URLs exceeding max length', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(3000);
    const result = validateUrl(longUrl, policy);
    expect(result.valid).toBe(false);
    expect(result.violation?.rule).toBe('max-length');
  });

  it('rejects non-allowed schemes', () => {
    const result = validateUrl('ftp://files.example.com', policy);
    expect(result.valid).toBe(false);
    expect(result.violation?.rule).toBe('scheme-not-allowed');
  });

  it('truncates violation value for safe logging', () => {
    const longUrl = 'javascript:' + 'a'.repeat(200);
    const result = validateUrl(longUrl, policy);
    expect(result.violation?.value?.length).toBeLessThanOrEqual(103); // 100 + "..."
  });
});

describe('isBlockedScheme', () => {
  const blocked = ['javascript', 'data', 'vbscript'];

  it('detects blocked schemes', () => {
    expect(isBlockedScheme('javascript:void(0)', blocked)).toBe(true);
    expect(isBlockedScheme('data:text/html,x', blocked)).toBe(true);
  });

  it('handles case insensitivity', () => {
    expect(isBlockedScheme('JAVASCRIPT:x', blocked)).toBe(true);
  });

  it('handles whitespace bypass attempts', () => {
    expect(isBlockedScheme('java\tscript:x', blocked)).toBe(true);
  });

  it('returns false for safe schemes', () => {
    expect(isBlockedScheme('https://safe.com', blocked)).toBe(false);
  });
});
