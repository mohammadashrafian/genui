import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation - GenUIKit',
  description: 'GenUIKit documentation: type-safe, schema-validated UI rendering from LLM outputs.',
};

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Install GenUIKit and render your first LLM-driven component in under 5 minutes.',
    href: '/docs/getting-started',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
  {
    title: 'Core Concepts',
    description: 'Understand the registry pattern, schema validation, and auto-correction prompts.',
    href: '/docs/core-concepts',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: 'React Hooks',
    description: 'API reference for useGenerativeUI, useStreamingUI, useCoAgent and components.',
    href: '/docs/react-hooks',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'Adapters',
    description: 'Pre-built registries for shadcn/ui, Tailwind CSS, and Material UI.',
    href: '/docs/adapters',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
  },
  {
    title: 'Security',
    description: 'Built-in XSS protection, URL validation, and content sanitization.',
    href: '/docs/security',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Streaming',
    description: 'Progressive rendering with incremental JSON parsing and wire format encoding.',
    href: '/docs/streaming',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

const whatsNew = [
  {
    tag: 'CLI',
    title: 'CLI Scaffolding',
    description: 'Run npx @genuikit/cli init to scaffold a project with your preferred adapter.',
  },
  {
    tag: 'Security',
    title: 'Security-Hardened Schemas',
    description: 'safeString, safeUrl, safeHtml, and safeCssClass protect every string from XSS.',
  },
  {
    tag: 'Streaming',
    title: 'Streaming Pipeline',
    description: 'StreamParser, StreamResolver, and Wire Format for progressive UI rendering.',
  },
  {
    tag: 'Adapters',
    title: 'Adapter System',
    description: 'Pre-built registries for shadcn/ui, Tailwind CSS, and Material UI with 10 components each.',
  },
];

export default function DocsPage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          GenUIKit Documentation
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Type-safe, schema-validated UI rendering from LLM outputs. GenUIKit gives you a
          registry of Zod-validated components that your AI can render safely, with automatic
          error correction and streaming support.
        </p>
      </div>

      {/* Quick links grid */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-text-primary mb-6">Explore the docs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex gap-4 rounded-xl border border-border bg-surface-card p-5 transition-all hover:border-primary/50 hover:bg-surface-light"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {link.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* What's New */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-text-primary mb-6">What&apos;s new</h2>
        <div className="space-y-4">
          {whatsNew.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-lg border border-border bg-surface-card p-4"
            >
              <span className="mt-0.5 shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {item.tag}
              </span>
              <div>
                <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
                <p className="mt-0.5 text-sm text-text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick install */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick install</h2>
        <div className="rounded-lg border border-border bg-surface-card p-4 font-mono text-sm">
          <p className="text-text-secondary">
            <span className="text-accent">npm</span>{' '}
            <span className="text-text-primary">install @genuikit/core @genuikit/react zod</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          Then head to the{' '}
          <Link href="/docs/getting-started" className="text-primary hover:underline">
            Getting Started
          </Link>{' '}
          guide for a complete walkthrough.
        </p>
      </section>
    </div>
  );
}
