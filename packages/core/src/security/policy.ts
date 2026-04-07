/**
 * SecurityPolicy — centralized, immutable security configuration.
 *
 * Provides sensible defaults that protect against common LLM output attacks.
 * Create custom policies with the `with()` builder for specific needs.
 */

import type { SecurityPolicyConfig } from './types.js';

/** Default safe HTML tags allowed in safeHtml() schemas. */
const DEFAULT_ALLOWED_HTML_TAGS: readonly string[] = Object.freeze([
  'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote',
  'span', 'div', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

/**
 * CSS class pattern that allows:
 * - Standard classes: btn, btn-primary
 * - Tailwind: w-1/2, md:flex, bg-[#ff0000], hover:text-blue-500
 * - CSS modules: _hash123
 * - BEM: block__element--modifier
 *
 * Blocks:
 * - Semicolons, parentheses, curly braces (CSS injection)
 * - Quotes (attribute injection)
 * - Expression(), url() (IE CSS expressions)
 */
const DEFAULT_CSS_CLASS_PATTERN = /^[a-zA-Z0-9_\-\s:./[\]#%,!@]+$/;

/** Default security policy configuration. */
const DEFAULT_CONFIG: SecurityPolicyConfig = Object.freeze({
  maxStringLength: 10_000,
  maxUrlLength: 2_083,
  maxCssClassLength: 256,
  maxHtmlLength: 50_000,
  allowedUrlSchemes: Object.freeze(['https', 'http', 'mailto']),
  blockedUrlSchemes: Object.freeze(['javascript', 'data', 'vbscript', 'blob']),
  allowedHtmlTags: DEFAULT_ALLOWED_HTML_TAGS,
  stripHtml: true,
  cssClassPattern: DEFAULT_CSS_CLASS_PATTERN,
});

/**
 * Immutable security policy with sensible defaults.
 *
 * @example
 * ```ts
 * // Use defaults
 * const policy = DEFAULT_SECURITY_POLICY;
 *
 * // Customize
 * const strict = DEFAULT_SECURITY_POLICY.with({
 *   maxStringLength: 1_000,
 *   allowedUrlSchemes: ['https'],
 * });
 * ```
 */
export class SecurityPolicy {
  readonly config: Readonly<SecurityPolicyConfig>;

  constructor(overrides?: Partial<SecurityPolicyConfig>) {
    this.config = Object.freeze({
      ...DEFAULT_CONFIG,
      ...overrides,
      // Ensure arrays are frozen
      allowedUrlSchemes: Object.freeze([
        ...(overrides?.allowedUrlSchemes ?? DEFAULT_CONFIG.allowedUrlSchemes),
      ]),
      blockedUrlSchemes: Object.freeze([
        ...(overrides?.blockedUrlSchemes ?? DEFAULT_CONFIG.blockedUrlSchemes),
      ]),
      allowedHtmlTags: Object.freeze([
        ...(overrides?.allowedHtmlTags ?? DEFAULT_CONFIG.allowedHtmlTags),
      ]),
    });
  }

  /** Create a new policy with merged overrides. Immutable — returns a new instance. */
  with(overrides: Partial<SecurityPolicyConfig>): SecurityPolicy {
    return new SecurityPolicy({ ...this.config, ...overrides });
  }
}

/** The default security policy. Use `DEFAULT_SECURITY_POLICY.with({})` to customize. */
export const DEFAULT_SECURITY_POLICY = new SecurityPolicy();
