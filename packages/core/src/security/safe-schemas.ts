/**
 * Security-enhanced Zod schema builders.
 *
 * These factories produce Zod schemas that both validate and sanitize
 * in a single pass using `z.string().transform().pipe()`.
 *
 * The `transform` step sanitizes, the `pipe` step validates the result.
 * This ensures even after sanitization, the output meets constraints.
 *
 * @example
 * ```ts
 * import { safeString, safeUrl, safeCssClass } from '@genuikit/core';
 *
 * const schema = z.object({
 *   title: safeString({ maxLength: 200 }),
 *   link: safeUrl(),
 *   className: safeCssClass(),
 * });
 * ```
 */

import { z } from 'zod';
import type { SecurityPolicyConfig } from './types.js';
import { sanitizeString, sanitizeHtml, truncate } from './sanitize.js';
import { validateUrl } from './url-validator.js';
import { DEFAULT_SECURITY_POLICY } from './policy.js';

interface SafeStringOptions {
  /** Max allowed length after sanitization. Falls back to policy default. */
  maxLength?: number;
  /** Custom security policy. Falls back to DEFAULT_SECURITY_POLICY. */
  policy?: SecurityPolicyConfig;
}

interface SafeUrlOptions {
  /** Override allowed URL schemes. Falls back to policy default. */
  allowedSchemes?: readonly string[];
  /** Custom security policy. */
  policy?: SecurityPolicyConfig;
}

interface SafeHtmlOptions {
  /** Allowed HTML tags. Falls back to policy default. */
  allowedTags?: readonly string[];
  /** Max allowed length. Falls back to policy default. */
  maxLength?: number;
  /** Custom security policy. */
  policy?: SecurityPolicyConfig;
}

interface SafeCssClassOptions {
  /** Max allowed length. Falls back to policy default. */
  maxLength?: number;
  /** Custom security policy. */
  policy?: SecurityPolicyConfig;
}

/**
 * Create a Zod schema for safe string input.
 * Strips HTML tags, removes control characters, enforces length limits.
 */
export function safeString(opts?: SafeStringOptions): z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString> {
  const policy = opts?.policy ?? DEFAULT_SECURITY_POLICY.config;
  const maxLen = opts?.maxLength ?? policy.maxStringLength;

  const effectivePolicy = maxLen !== policy.maxStringLength
    ? { ...policy, maxStringLength: maxLen }
    : policy;

  return z.string()
    .transform((val) => sanitizeString(val, effectivePolicy))
    .pipe(z.string().max(maxLen));
}

/**
 * Create a Zod schema for safe URL input.
 * Validates scheme against allowlist/blocklist, normalizes the URL.
 */
export function safeUrl(opts?: SafeUrlOptions) {
  const policy = opts?.policy ?? DEFAULT_SECURITY_POLICY.config;
  const effectivePolicy = opts?.allowedSchemes
    ? { ...policy, allowedUrlSchemes: opts.allowedSchemes }
    : policy;

  return z.string().superRefine((val, ctx) => {
    const result = validateUrl(val, effectivePolicy);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.violation?.message ?? 'Invalid URL',
      });
    }
  }).transform((val) => {
    const result = validateUrl(val, effectivePolicy);
    return result.sanitized ?? val;
  });
}

/**
 * Create a Zod schema for safe HTML content.
 * Keeps only allowed tags (with attributes stripped), enforces length.
 */
export function safeHtml(opts?: SafeHtmlOptions): z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodString> {
  const policy = opts?.policy ?? DEFAULT_SECURITY_POLICY.config;
  const allowedTags = opts?.allowedTags ?? policy.allowedHtmlTags;
  const maxLen = opts?.maxLength ?? policy.maxHtmlLength;

  return z.string()
    .transform((val) => sanitizeHtml(val, allowedTags, maxLen))
    .pipe(z.string().max(maxLen));
}

/**
 * Create a Zod schema for safe CSS class names.
 * Validates against a safe character pattern, enforces length.
 * Blocks CSS injection attempts (semicolons, expressions, etc.).
 */
export function safeCssClass(opts?: SafeCssClassOptions) {
  const policy = opts?.policy ?? DEFAULT_SECURITY_POLICY.config;
  const maxLen = opts?.maxLength ?? policy.maxCssClassLength;

  return z.string()
    .max(maxLen)
    .superRefine((val, ctx) => {
      // Block CSS injection patterns
      const lower = val.toLowerCase();
      if (lower.includes('expression(') || lower.includes('url(')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CSS class contains forbidden pattern',
        });
        return;
      }

      if (!policy.cssClassPattern.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CSS class contains invalid characters',
        });
      }
    })
    .transform((val) => truncate(val.trim(), maxLen));
}
