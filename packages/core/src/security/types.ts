/**
 * Security type definitions for GenUI.
 *
 * These types configure content security policies that protect against
 * XSS, injection attacks, and malicious LLM outputs.
 */

/** Immutable configuration for content security policies. */
export interface SecurityPolicyConfig {
  /** Maximum allowed string length. Default: 10_000 */
  readonly maxStringLength: number;
  /** Maximum allowed URL length. Default: 2_083 */
  readonly maxUrlLength: number;
  /** Maximum allowed CSS class string length. Default: 256 */
  readonly maxCssClassLength: number;
  /** Maximum allowed HTML content length. Default: 50_000 */
  readonly maxHtmlLength: number;
  /** Allowed URL schemes. Default: ['https', 'http', 'mailto'] */
  readonly allowedUrlSchemes: readonly string[];
  /** Blocked URL schemes (checked before allowlist). Default: ['javascript', 'data', 'vbscript', 'blob'] */
  readonly blockedUrlSchemes: readonly string[];
  /** Allowed HTML tags for safeHtml. Default: basic safe set */
  readonly allowedHtmlTags: readonly string[];
  /** Whether to strip all HTML tags by default in safeString. Default: true */
  readonly stripHtml: boolean;
  /** Regex pattern for valid CSS class names. */
  readonly cssClassPattern: RegExp;
}

/** Describes a single security violation found during validation. */
export interface SecurityViolation {
  /** The field or context where the violation occurred. */
  readonly field: string;
  /** The rule that was violated. */
  readonly rule: string;
  /** Human-readable description of the violation. */
  readonly message: string;
  /** The offending value, truncated to 100 chars for safe logging. */
  readonly value?: string;
}
