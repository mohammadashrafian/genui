'use client';

import { useState, useCallback, useMemo } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

// ---------------------------------------------------------------------------
// Single-pass tokenizer — avoids the bug where regex replaces corrupt
// previously inserted HTML tags.
// ---------------------------------------------------------------------------

interface Token {
  text: string;
  color?: string;
  italic?: boolean;
}

const KEYWORDS = new Set([
  'import','export','from','default','const','let','var','function','return',
  'if','else','for','while','do','switch','case','break','continue','throw',
  'try','catch','finally','new','class','this','super','async','await','of',
  'in','as','instanceof','yield','delete','typeof','void',
]);

const TYPE_KEYWORDS = new Set([
  'interface','type','enum','namespace','declare','readonly','keyof',
  'infer','extends','implements','abstract','override','satisfies',
]);

const LITERALS = new Set([
  'true','false','null','undefined','never','any','unknown','string',
  'number','boolean','bigint','symbol','object',
]);

const SHELL_CMDS = new Set([
  'npm','npx','pnpm','yarn','bun','cd','git','node','mkdir','echo',
]);

function tokenizeTS(code: string): Token[][] {
  return code.split('\n').map((line) => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      // Single-line comment
      if (line[i] === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.slice(i), color: 'text-slate-500', italic: true });
        i = line.length;
        continue;
      }

      // Strings (single, double, template)
      if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i]!;
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\') j++; // skip escape
          j++;
        }
        j = Math.min(j + 1, line.length);
        tokens.push({ text: line.slice(i, j), color: 'text-emerald-400' });
        i = j;
        continue;
      }

      // Numbers
      if (/\d/.test(line[i]!) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1] || ''))) {
        let j = i;
        while (j < line.length && /[\d._]/.test(line[j]!)) j++;
        tokens.push({ text: line.slice(i, j), color: 'text-orange-400' });
        i = j;
        continue;
      }

      // Words (identifiers, keywords)
      if (/[a-zA-Z_$]/.test(line[i]!)) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j]!)) j++;
        const word = line.slice(i, j);

        if (TYPE_KEYWORDS.has(word)) {
          tokens.push({ text: word, color: 'text-purple-400' });
        } else if (KEYWORDS.has(word)) {
          tokens.push({ text: word, color: 'text-pink-400' });
        } else if (LITERALS.has(word)) {
          tokens.push({ text: word, color: 'text-orange-400' });
        } else if (/^[A-Z]/.test(word)) {
          // PascalCase → likely a type/component
          tokens.push({ text: word, color: 'text-sky-300' });
        } else {
          tokens.push({ text: word });
        }
        i = j;
        continue;
      }

      // JSX angle brackets followed by identifier
      if (line[i] === '<' || line[i] === '>') {
        tokens.push({ text: line[i]!, color: 'text-slate-400' });
        i++;
        continue;
      }

      // Operators and punctuation
      if (/[=+\-*/%&|^!~?:;,.()\[\]{}@#]/.test(line[i]!)) {
        tokens.push({ text: line[i]!, color: 'text-slate-400' });
        i++;
        continue;
      }

      // Whitespace and anything else
      tokens.push({ text: line[i]! });
      i++;
    }

    return tokens;
  });
}

function tokenizeBash(code: string): Token[][] {
  return code.split('\n').map((line) => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      // Comments
      if (line[i] === '#') {
        tokens.push({ text: line.slice(i), color: 'text-slate-500', italic: true });
        i = line.length;
        continue;
      }

      // Strings
      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i]!;
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\') j++;
          j++;
        }
        j = Math.min(j + 1, line.length);
        tokens.push({ text: line.slice(i, j), color: 'text-emerald-400' });
        i = j;
        continue;
      }

      // Words
      if (/[a-zA-Z_@]/.test(line[i]!)) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_@/\-.]/.test(line[j]!)) j++;
        const word = line.slice(i, j);
        if (SHELL_CMDS.has(word)) {
          tokens.push({ text: word, color: 'text-accent' });
        } else if (word.startsWith('@') || word.startsWith('-')) {
          tokens.push({ text: word, color: 'text-sky-300' });
        } else {
          tokens.push({ text: word });
        }
        i = j;
        continue;
      }

      tokens.push({ text: line[i]! });
      i++;
    }

    return tokens;
  });
}

function tokenizeJSON(code: string): Token[][] {
  return code.split('\n').map((line) => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      // Strings
      if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && line[j] !== '"') {
          if (line[j] === '\\') j++;
          j++;
        }
        j = Math.min(j + 1, line.length);
        const str = line.slice(i, j);
        // Check if it's a key (followed by colon)
        const rest = line.slice(j).trimStart();
        const isKey = rest.startsWith(':');
        tokens.push({ text: str, color: isKey ? 'text-sky-300' : 'text-emerald-400' });
        i = j;
        continue;
      }

      // Numbers
      if (/[\d-]/.test(line[i]!) && (i === 0 || /[\s:,\[]/.test(line[i - 1] || ''))) {
        let j = i;
        if (line[j] === '-') j++;
        while (j < line.length && /[\d.]/.test(line[j]!)) j++;
        if (j > i) {
          tokens.push({ text: line.slice(i, j), color: 'text-orange-400' });
          i = j;
          continue;
        }
      }

      // Booleans/null
      if (/[tfn]/.test(line[i]!)) {
        const rest = line.slice(i);
        const m = rest.match(/^(true|false|null)\b/);
        if (m) {
          tokens.push({ text: m[1]!, color: 'text-orange-400' });
          i += m[1]!.length;
          continue;
        }
      }

      tokens.push({ text: line[i]! });
      i++;
    }

    return tokens;
  });
}

function tokenize(code: string, language: string): Token[][] {
  const lang = language.toLowerCase();
  if (['bash', 'shell', 'sh'].includes(lang)) return tokenizeBash(code);
  if (lang === 'json') return tokenizeJSON(code);
  return tokenizeTS(code); // ts, tsx, js, jsx, typescript, javascript
}

// ---------------------------------------------------------------------------
// React components
// ---------------------------------------------------------------------------

function HighlightedLine({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (t.color || t.italic) {
          return (
            <span key={i} className={`${t.color || ''} ${t.italic ? 'italic' : ''}`}>
              {t.text}
            </span>
          );
        }
        return <span key={i}>{t.text}</span>;
      })}
    </>
  );
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const tokenizedLines = useMemo(() => tokenize(code, language), [code, language]);

  return (
    <div className="group relative rounded-lg border border-border overflow-hidden my-4">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-light border-b border-border">
          <span className="text-xs font-mono text-text-secondary">{filename}</span>
          <span className="text-xs text-text-secondary/60">{language}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 z-10 rounded-md border border-border bg-surface-light px-2.5 py-1.5 text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-text-primary hover:border-primary/50"
          aria-label="Copy code"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </span>
          )}
        </button>
        <div className="overflow-x-auto bg-[#0d1117]">
          <table className="w-full border-collapse">
            <tbody>
              {tokenizedLines.map((tokens, i) => (
                <tr key={i} className="hover:bg-white/[0.03]">
                  <td className="select-none px-4 py-0 text-right text-xs font-mono text-text-secondary/30 w-[1%] whitespace-nowrap align-top leading-6">
                    {i + 1}
                  </td>
                  <td className="px-4 py-0 text-sm font-mono whitespace-pre text-text-primary leading-6">
                    {tokens.length > 0 ? <HighlightedLine tokens={tokens} /> : '\u00A0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}

/** Inline code span for use within paragraphs. */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-light px-1.5 py-0.5 text-sm font-mono text-accent">
      {children}
    </code>
  );
}
