/**
 * URL validation for preventing javascript:, data:, and other
 * dangerous URI scheme injection attacks.
 *
 * Handles common bypass techniques:
 * - Case variation (jAvAsCrIpT:)
 * - Embedded whitespace/tabs (java\tscript:)
 * - Null bytes (java\x00script:)
 * - URL encoding in scheme
 */

import type { SecurityPolicyConfig, SecurityViolation } from './types.js';
import { removeControlChars } from './sanitize.js';

/** Result of URL validation. */
export interface UrlValidationResult {
  readonly valid: boolean;
  readonly sanitized?: string;
  readonly violation?: SecurityViolation;
}

/**
 * Validate and sanitize a URL against the security policy.
 *
 * Defense-in-depth approach:
 * 1. Remove control characters and whitespace from scheme
 * 2. Check against blocked schemes (fail-fast)
 * 3. Check against allowed schemes
 * 4. Validate with URL constructor
 * 5. Enforce length limit
 */
export function validateUrl(
  input: string,
  policy: SecurityPolicyConfig,
): UrlValidationResult {
  // Step 1: Remove control characters
  const cleaned = removeControlChars(input).trim();

  // Step 2: Check length
  if (cleaned.length > policy.maxUrlLength) {
    return violation('url', 'max-length', `URL exceeds maximum length of ${policy.maxUrlLength}`, cleaned);
  }

  // Step 3: Empty check
  if (cleaned.length === 0) {
    return violation('url', 'empty', 'URL is empty', '');
  }

  // Step 4: Extract and normalize scheme for security checks
  // Remove all whitespace and control chars from the potential scheme portion
  const normalizedForSchemeCheck = cleaned
    .replace(/[\s\t\n\r\0]+/g, '')
    .toLowerCase();

  // Check against blocked schemes
  for (const blocked of policy.blockedUrlSchemes) {
    const pattern = blocked.toLowerCase() + ':';
    if (normalizedForSchemeCheck.startsWith(pattern)) {
      return violation(
        'url',
        'blocked-scheme',
        `URL scheme "${blocked}" is blocked`,
        cleaned,
      );
    }
  }

  // Step 5: Try to parse as absolute URL
  try {
    const parsed = new URL(cleaned);
    const scheme = parsed.protocol.replace(':', '').toLowerCase();

    // Double-check scheme against blocklist (in case URL parser normalizes differently)
    if (policy.blockedUrlSchemes.some((b) => b.toLowerCase() === scheme)) {
      return violation('url', 'blocked-scheme', `URL scheme "${scheme}" is blocked`, cleaned);
    }

    // Check against allowlist
    if (!policy.allowedUrlSchemes.some((a) => a.toLowerCase() === scheme)) {
      return violation(
        'url',
        'scheme-not-allowed',
        `URL scheme "${scheme}" is not in the allowed list [${policy.allowedUrlSchemes.join(', ')}]`,
        cleaned,
      );
    }

    return { valid: true, sanitized: parsed.href };
  } catch {
    // Not a valid absolute URL — could be a relative path
    // Only allow if it starts with / or is a simple relative path
    if (cleaned.startsWith('/') || cleaned.startsWith('./') || cleaned.startsWith('#')) {
      // Relative URLs are allowed but must not contain scheme-like patterns
      if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedForSchemeCheck)) {
        return violation('url', 'suspicious-scheme', 'URL contains a suspicious scheme pattern', cleaned);
      }
      return { valid: true, sanitized: cleaned };
    }

    return violation('url', 'invalid', 'URL is not a valid absolute URL or relative path', cleaned);
  }
}

/**
 * Quick check if a URL scheme is in the blocked list.
 * Handles case insensitivity, whitespace, and null bytes.
 */
export function isBlockedScheme(
  url: string,
  blockedSchemes: readonly string[],
): boolean {
  const normalized = url
    .replace(/[\s\t\n\r\0]+/g, '')
    .toLowerCase();

  return blockedSchemes.some((scheme) =>
    normalized.startsWith(scheme.toLowerCase() + ':'),
  );
}

function violation(
  field: string,
  rule: string,
  message: string,
  value: string,
): UrlValidationResult {
  return {
    valid: false,
    violation: {
      field,
      rule,
      message,
      value: value.length > 100 ? value.slice(0, 100) + '...' : value,
    },
  };
}
