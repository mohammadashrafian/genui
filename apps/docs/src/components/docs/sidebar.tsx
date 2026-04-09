'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarSection {
  title: string;
  items: { label: string; href: string }[];
}

const sections: SidebarSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/getting-started' },
      { label: 'Quick Start', href: '/docs/getting-started#quick-start' },
      { label: 'CLI', href: '/docs/getting-started#cli' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { label: 'Registry', href: '/docs/core-concepts#registry' },
      { label: 'Validation', href: '/docs/core-concepts#validation' },
      { label: 'Correction Prompts', href: '/docs/core-concepts#correction-prompts' },
      { label: 'Tool Definitions', href: '/docs/core-concepts#tool-definitions' },
    ],
  },
  {
    title: 'React Hooks',
    items: [
      { label: 'useGenerativeUI', href: '/docs/react-hooks#use-generative-ui' },
      { label: 'GenerativeUI', href: '/docs/react-hooks#generative-ui' },
      { label: 'useStreamingUI', href: '/docs/react-hooks#use-streaming-ui' },
      { label: 'DevGenerativeUI', href: '/docs/react-hooks#dev-generative-ui' },
      { label: 'useCoAgent', href: '/docs/react-hooks#use-co-agent' },
    ],
  },
  {
    title: 'Adapters',
    items: [
      { label: 'Overview', href: '/docs/adapters#overview' },
      { label: 'shadcn/ui', href: '/docs/adapters#shadcn' },
      { label: 'Tailwind CSS', href: '/docs/adapters#tailwind' },
      { label: 'Material UI', href: '/docs/adapters#mui' },
      { label: 'Custom Adapters', href: '/docs/adapters#custom' },
    ],
  },
  {
    title: 'Security',
    items: [
      { label: 'Overview', href: '/docs/security#overview' },
      { label: 'Safe Schemas', href: '/docs/security#safe-schemas' },
      { label: 'URL Validation', href: '/docs/security#url-validation' },
      { label: 'Security Policy', href: '/docs/security#security-policy' },
    ],
  },
  {
    title: 'Streaming',
    items: [
      { label: 'StreamParser', href: '/docs/streaming#stream-parser' },
      { label: 'StreamResolver', href: '/docs/streaming#stream-resolver' },
      { label: 'Wire Format', href: '/docs/streaming#wire-format' },
      { label: 'useStreamingUI', href: '/docs/streaming#use-streaming-ui' },
    ],
  },
  {
    title: 'Bidirectional',
    items: [
      { label: 'ActionRegistry', href: '/docs/react-hooks#action-registry' },
      { label: 'CoAgentProvider', href: '/docs/react-hooks#co-agent-provider' },
      { label: 'useCoAgent', href: '/docs/react-hooks#use-co-agent' },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-text-secondary transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SidebarGroup({ section }: { section: SidebarSection }) {
  const pathname = usePathname();
  const isActive = section.items.some(
    (item) => pathname === item.href || pathname === item.href.split('#')[0]
  );
  const [open, setOpen] = useState(isActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-sm font-medium text-text-primary hover:text-primary transition-colors rounded-md hover:bg-surface-light"
      >
        <span>{section.title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <ul className="ml-3 mt-0.5 border-l border-border pl-3 space-y-0.5">
          {section.items.map((item) => {
            const hasHash = item.href.includes('#');
            // Only highlight exact matches. Hash links are never "active" based on pathname alone.
            const active = !hasHash && pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                    active
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-20 left-4 z-50 rounded-lg border border-border bg-surface-card p-2 text-text-primary lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-[280px] border-r border-border bg-surface overflow-y-auto custom-scrollbar transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <span className="text-sm font-bold text-primary">G</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">GenUIKit</span>
          </Link>
          <p className="mt-1 text-xs text-text-secondary">Documentation</p>
        </div>

        <nav className="px-2 py-4">
          {sections.map((section) => (
            <SidebarGroup key={section.title} section={section} />
          ))}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <a
            href="https://github.com/mohammadashrafian/genuikit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@genuikit/core"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z" />
            </svg>
            npm
          </a>
        </div>
      </aside>
    </>
  );
}
