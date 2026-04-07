/**
 * String sanitization functions for XSS prevention.
 *
 * Uses a character-by-character state machine for HTML stripping
 * to avoid ReDoS vulnerabilities that regex-based approaches have.
 * All functions are pure — no side effects.
 */

import type { SecurityPolicyConfig } from './types.js';

/**
 * Remove all HTML tags from a string using a state machine parser.
 *
 * This avoids regex patterns like `/<[^>]*>/g` which are vulnerable
 * to ReDoS with crafted input (e.g., `<<<<<<<...`).
 * Runs in O(n) guaranteed time.
 */
export function stripHtmlTags(input: string): string {
  const len = input.length;
  let result = '';
  let inTag = false;

  for (let i = 0; i < len; i++) {
    const char = input[i]!;

    if (char === '<') {
      inTag = true;
      continue;
    }

    if (char === '>') {
      inTag = false;
      continue;
    }

    if (!inTag) {
      result += char;
    }
  }

  return result;
}

/**
 * Escape HTML special characters to their entity equivalents.
 * Use when you want to render user content safely without stripping.
 */
export function escapeHtml(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;
    switch (char) {
      case '&':
        result += '&amp;';
        break;
      case '<':
        result += '&lt;';
        break;
      case '>':
        result += '&gt;';
        break;
      case '"':
        result += '&quot;';
        break;
      case "'":
        result += '&#x27;';
        break;
      default:
        result += char;
    }
  }
  return result;
}

/**
 * Truncate a string to maxLength without splitting surrogate pairs.
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;

  // Don't split in the middle of a surrogate pair
  let end = maxLength;
  if (end > 0 && input.charCodeAt(end - 1) >= 0xd800 && input.charCodeAt(end - 1) <= 0xdbff) {
    end--;
  }

  return input.slice(0, end);
}

/**
 * Remove null bytes that can bypass security filters.
 * Also removes other ASCII control characters (except \t, \n, \r).
 */
export function removeControlChars(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    // Keep tabs (9), newlines (10), carriage returns (13), and all chars >= 32
    if (code === 9 || code === 10 || code === 13 || code >= 32) {
      result += input[i];
    }
  }
  return result;
}

/**
 * Collapse runs of whitespace into single spaces and trim.
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Full sanitization pipeline for untrusted string input.
 * Applies: removeControlChars → stripHtmlTags (if configured) → truncate.
 */
export function sanitizeString(input: string, policy: SecurityPolicyConfig): string {
  let result = removeControlChars(input);

  if (policy.stripHtml) {
    result = stripHtmlTags(result);
  }

  result = truncate(result, policy.maxStringLength);

  return result;
}

/**
 * Sanitize HTML content, keeping only allowed tags.
 * Uses a state machine to parse tags and filter by allowlist.
 */
export function sanitizeHtml(
  input: string,
  allowedTags: readonly string[],
  maxLength: number,
): string {
  const cleaned = removeControlChars(input);
  const allowSet = new Set(allowedTags.map((t) => t.toLowerCase()));
  const len = cleaned.length;

  let result = '';
  let i = 0;

  while (i < len && result.length < maxLength) {
    if (cleaned[i] === '<') {
      // Extract the full tag
      const tagEnd = cleaned.indexOf('>', i);
      if (tagEnd === -1) {
        // Unclosed tag — strip it
        break;
      }

      const tagContent = cleaned.slice(i + 1, tagEnd);
      const isClosing = tagContent.startsWith('/');
      const tagNameRaw = isClosing ? tagContent.slice(1) : tagContent;
      // Extract tag name (before any space or /)
      const tagName = tagNameRaw.split(/[\s/]/)[0]?.toLowerCase() ?? '';

      if (allowSet.has(tagName)) {
        // Keep the tag but strip all attributes (prevent event handlers)
        if (isClosing) {
          result += `</${tagName}>`;
        } else {
          result += `<${tagName}>`;
        }
      }
      // Skip disallowed tags entirely
      i = tagEnd + 1;
    } else {
      result += cleaned[i];
      i++;
    }
  }

  return truncate(result, maxLength);
}
