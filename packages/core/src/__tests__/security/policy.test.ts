import { describe, it, expect } from 'vitest';
import { SecurityPolicy, DEFAULT_SECURITY_POLICY } from '../../security/policy.js';

describe('SecurityPolicy', () => {
  it('provides sensible defaults', () => {
    const policy = DEFAULT_SECURITY_POLICY;
    expect(policy.config.maxStringLength).toBe(10_000);
    expect(policy.config.maxUrlLength).toBe(2_083);
    expect(policy.config.stripHtml).toBe(true);
    expect(policy.config.blockedUrlSchemes).toContain('javascript');
    expect(policy.config.blockedUrlSchemes).toContain('data');
    expect(policy.config.allowedUrlSchemes).toContain('https');
    expect(policy.config.allowedUrlSchemes).toContain('http');
  });

  it('config is frozen (immutable)', () => {
    const policy = DEFAULT_SECURITY_POLICY;
    expect(() => {
      (policy.config as any).maxStringLength = 999;
    }).toThrow();
  });

  it('with() creates a new policy with overrides', () => {
    const custom = DEFAULT_SECURITY_POLICY.with({ maxStringLength: 500 });
    expect(custom.config.maxStringLength).toBe(500);
    // Original unchanged
    expect(DEFAULT_SECURITY_POLICY.config.maxStringLength).toBe(10_000);
  });

  it('with() preserves non-overridden values', () => {
    const custom = DEFAULT_SECURITY_POLICY.with({ maxStringLength: 500 });
    expect(custom.config.maxUrlLength).toBe(2_083);
    expect(custom.config.stripHtml).toBe(true);
  });

  it('constructor accepts partial overrides', () => {
    const policy = new SecurityPolicy({
      maxStringLength: 1_000,
      allowedUrlSchemes: ['https'],
    });
    expect(policy.config.maxStringLength).toBe(1_000);
    expect(policy.config.allowedUrlSchemes).toEqual(['https']);
    expect(policy.config.blockedUrlSchemes).toContain('javascript');
  });

  it('arrays are frozen', () => {
    const policy = DEFAULT_SECURITY_POLICY;
    expect(() => {
      (policy.config.allowedUrlSchemes as string[]).push('ftp');
    }).toThrow();
    expect(() => {
      (policy.config.blockedUrlSchemes as string[]).push('custom');
    }).toThrow();
  });

  it('with() chains correctly', () => {
    const strict = DEFAULT_SECURITY_POLICY
      .with({ maxStringLength: 100 })
      .with({ allowedUrlSchemes: ['https'] });

    expect(strict.config.maxStringLength).toBe(100);
    expect(strict.config.allowedUrlSchemes).toEqual(['https']);
  });
});
