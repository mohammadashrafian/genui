'use client';

import Link from 'next/link';
import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { OnThisPage } from '@/components/docs/on-this-page';

const headings = [
  { id: 'overview', text: 'What Are Adapters?', level: 2 },
  { id: 'shadcn', text: 'shadcn/ui Adapter', level: 2 },
  { id: 'tailwind', text: 'Tailwind CSS Adapter', level: 2 },
  { id: 'mui', text: 'Material UI Adapter', level: 2 },
  { id: 'comparison', text: 'Component Comparison', level: 2 },
  { id: 'customizing', text: 'Customizing Schemas', level: 2 },
  { id: 'custom-adapters', text: 'Creating Custom Adapters', level: 2 },
];

export default function AdaptersPage() {
  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Adapters</h1>
        <p className="text-lg text-text-secondary mb-10">
          Pre-built, security-hardened Zod schemas for popular UI libraries. You bring your own
          components — adapters define the schemas and action schemas that make them LLM-safe.
        </p>

        {/* What Are Adapters? */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">What Are Adapters?</h2>
          <p className="text-text-secondary mb-4">
            An adapter is a factory function that returns a <InlineCode>ComponentRegistry</InlineCode> pre-loaded
            with Zod schemas for a specific UI library. The schemas define exactly which props and
            variants the LLM is allowed to produce — nothing more.
          </p>
          <p className="text-text-secondary mb-4">
            Adapters do <strong className="text-text-primary">not</strong> ship UI components.
            You provide your own Button, Card, Alert, and so on. The adapter only supplies the
            validated schema layer that sits between the LLM output and your component tree.
          </p>
          <p className="text-text-secondary mb-4">
            This separation means you keep full control over styling and behavior while GenUIKit
            handles validation, sanitization, and correction prompts.
          </p>
          <div className="rounded-lg border border-border bg-surface-card p-4 mb-4">
            <p className="text-sm text-text-secondary">
              <strong className="text-primary">Why adapters matter for security:</strong> Every
              prop value passes through a strict Zod schema before reaching your component.
              Free-form strings are sanitized, enum values are constrained, and unknown fields are
              stripped. This prevents the LLM from injecting arbitrary HTML, event handlers, or
              unexpected prop combinations.
            </p>
          </div>
          <p className="text-text-secondary">
            GenUIKit ships three official adapters — shadcn/ui, Tailwind CSS, and Material UI —
            each covering the same 10 core component types with library-appropriate naming and
            variant options.
          </p>
        </section>

        {/* shadcn/ui Adapter */}
        <section id="shadcn" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">shadcn/ui Adapter</h2>
          <p className="text-text-secondary mb-4">
            The shadcn/ui adapter maps to the component names and variant conventions used by
            shadcn/ui. Install the adapters package if you haven&apos;t already:
          </p>
          <CodeBlock language="bash" code="npm install @genuikit/adapters" />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Setup</h3>
          <p className="text-text-secondary mb-3">
            Import <InlineCode>createShadcnRegistry</InlineCode> from the shadcn sub-path and pass
            your component map:
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { createShadcnRegistry } from '@genuikit/adapters/shadcn';
import {
  Button, Card, Alert, Badge, Input,
  Select, Dialog, Tabs, Table, Avatar,
} from '@/components/ui';

const registry = createShadcnRegistry({
  Button,
  Card,
  Alert,
  Badge,
  Input,
  Select,
  Dialog,
  Tabs,
  Table,
  Avatar,
});

export default registry;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Included Components</h3>
          <p className="text-text-secondary mb-3">
            The shadcn/ui adapter registers schemas for 10 components. Each schema constrains the
            variants to match shadcn/ui conventions:
          </p>
          <ul className="space-y-2 text-text-secondary mb-4">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Button</strong> — variant: <InlineCode>default</InlineCode>, <InlineCode>destructive</InlineCode>, <InlineCode>outline</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>ghost</InlineCode>, <InlineCode>link</InlineCode>; size: <InlineCode>default</InlineCode>, <InlineCode>sm</InlineCode>, <InlineCode>lg</InlineCode>, <InlineCode>icon</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Card</strong> — title, description, content, and footer sections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Alert</strong> — variant: <InlineCode>default</InlineCode>, <InlineCode>destructive</InlineCode>; title and description</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Badge</strong> — variant: <InlineCode>default</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>destructive</InlineCode>, <InlineCode>outline</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Input</strong> — type, placeholder, disabled, required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Select</strong> — options array, placeholder, disabled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Dialog</strong> — title, description, open state, content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Tabs</strong> — tabs array with label and content per tab</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Table</strong> — headers array, rows as 2D array, caption</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Avatar</strong> — src, alt, fallback text</span>
            </li>
          </ul>
        </section>

        {/* Tailwind CSS Adapter */}
        <section id="tailwind" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Tailwind CSS Adapter</h2>
          <p className="text-text-secondary mb-4">
            The Tailwind adapter is library-agnostic — it uses generic variant names like
            {' '}<InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, and
            {' '}<InlineCode>danger</InlineCode> that map naturally to utility-class-based
            components. It registers the same 10 component types.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Setup</h3>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { createTailwindRegistry } from '@genuikit/adapters/tailwind';
import {
  Button, Card, Alert, Badge, Input,
  Select, Dialog, Tabs, Table, Avatar,
} from '@/components/ui';

const registry = createTailwindRegistry({
  Button,
  Card,
  Alert,
  Badge,
  Input,
  Select,
  Dialog,
  Tabs,
  Table,
  Avatar,
});

export default registry;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Variant Differences</h3>
          <p className="text-text-secondary mb-3">
            The Tailwind adapter uses simplified, library-agnostic variant names:
          </p>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Button</strong> — variant: <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>danger</InlineCode>, <InlineCode>outline</InlineCode>, <InlineCode>ghost</InlineCode>; size: <InlineCode>sm</InlineCode>, <InlineCode>md</InlineCode>, <InlineCode>lg</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Alert</strong> — variant: <InlineCode>info</InlineCode>, <InlineCode>success</InlineCode>, <InlineCode>warning</InlineCode>, <InlineCode>danger</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Badge</strong> — variant: <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>danger</InlineCode>, <InlineCode>outline</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span>All other components share the same schema shape as the shadcn adapter</span>
            </li>
          </ul>
        </section>

        {/* Material UI Adapter */}
        <section id="mui" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Material UI Adapter</h2>
          <p className="text-text-secondary mb-4">
            The MUI adapter follows Material UI naming conventions. Some component names differ
            from the other adapters to match what MUI developers expect.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Setup</h3>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { createMuiRegistry } from '@genuikit/adapters/mui';
import {
  Button, Card, Alert, Chip, TextField,
  Select, Dialog, Tabs, Table, Avatar,
} from '@mui/material';

const registry = createMuiRegistry({
  Button,
  Card,
  Alert,
  Chip,       // MUI uses Chip instead of Badge
  TextField,  // MUI uses TextField instead of Input
  Select,
  Dialog,
  Tabs,
  Table,
  Avatar,
});

export default registry;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">MUI-specific Naming</h3>
          <p className="text-text-secondary mb-3">
            Key differences from the other adapters:
          </p>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Button</strong> — variant: <InlineCode>text</InlineCode>, <InlineCode>contained</InlineCode>, <InlineCode>outlined</InlineCode>; color: <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>error</InlineCode>, <InlineCode>warning</InlineCode>, <InlineCode>info</InlineCode>, <InlineCode>success</InlineCode>; size: <InlineCode>small</InlineCode>, <InlineCode>medium</InlineCode>, <InlineCode>large</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Chip</strong> (instead of Badge) — variant: <InlineCode>filled</InlineCode>, <InlineCode>outlined</InlineCode>; color: <InlineCode>default</InlineCode>, <InlineCode>primary</InlineCode>, <InlineCode>secondary</InlineCode>, <InlineCode>error</InlineCode>, <InlineCode>warning</InlineCode>, <InlineCode>info</InlineCode>, <InlineCode>success</InlineCode></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">TextField</strong> (instead of Input) — variant: <InlineCode>filled</InlineCode>, <InlineCode>outlined</InlineCode>, <InlineCode>standard</InlineCode>; includes label and helperText props</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">--</span>
              <span><strong className="text-text-primary">Alert</strong> — severity: <InlineCode>error</InlineCode>, <InlineCode>warning</InlineCode>, <InlineCode>info</InlineCode>, <InlineCode>success</InlineCode>; variant: <InlineCode>filled</InlineCode>, <InlineCode>outlined</InlineCode>, <InlineCode>standard</InlineCode></span>
            </li>
          </ul>
        </section>

        {/* Component Comparison */}
        <section id="comparison" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Component Comparison</h2>
          <p className="text-text-secondary mb-4">
            All three adapters cover the same 10 component types. This table shows how naming and
            variants differ across each adapter:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-light border-b border-border">
                  <th className="text-left px-4 py-3 text-text-primary font-semibold">Component</th>
                  <th className="text-left px-4 py-3 text-text-primary font-semibold">shadcn/ui</th>
                  <th className="text-left px-4 py-3 text-text-primary font-semibold">Tailwind</th>
                  <th className="text-left px-4 py-3 text-text-primary font-semibold">Material UI</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">Button</td>
                  <td className="px-4 py-3">default, destructive, outline, secondary, ghost, link</td>
                  <td className="px-4 py-3">primary, secondary, danger, outline, ghost</td>
                  <td className="px-4 py-3">text, contained, outlined</td>
                </tr>
                <tr className="border-b border-border bg-surface-light/30">
                  <td className="px-4 py-3 font-medium text-text-primary">Card</td>
                  <td className="px-4 py-3">title, description, content, footer</td>
                  <td className="px-4 py-3">title, description, content, footer</td>
                  <td className="px-4 py-3">title, description, content, footer</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">Alert</td>
                  <td className="px-4 py-3">default, destructive</td>
                  <td className="px-4 py-3">info, success, warning, danger</td>
                  <td className="px-4 py-3">error, warning, info, success</td>
                </tr>
                <tr className="border-b border-border bg-surface-light/30">
                  <td className="px-4 py-3 font-medium text-text-primary">Badge / Chip</td>
                  <td className="px-4 py-3">Badge: default, secondary, destructive, outline</td>
                  <td className="px-4 py-3">Badge: primary, secondary, danger, outline</td>
                  <td className="px-4 py-3">Chip: filled, outlined (+ color prop)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">Input / TextField</td>
                  <td className="px-4 py-3">Input: type, placeholder, disabled</td>
                  <td className="px-4 py-3">Input: type, placeholder, disabled</td>
                  <td className="px-4 py-3">TextField: filled, outlined, standard</td>
                </tr>
                <tr className="border-b border-border bg-surface-light/30">
                  <td className="px-4 py-3 font-medium text-text-primary">Select</td>
                  <td className="px-4 py-3">options[], placeholder</td>
                  <td className="px-4 py-3">options[], placeholder</td>
                  <td className="px-4 py-3">options[], label, variant</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">Dialog</td>
                  <td className="px-4 py-3">title, description, open</td>
                  <td className="px-4 py-3">title, description, open</td>
                  <td className="px-4 py-3">title, description, open, maxWidth</td>
                </tr>
                <tr className="border-b border-border bg-surface-light/30">
                  <td className="px-4 py-3 font-medium text-text-primary">Tabs</td>
                  <td className="px-4 py-3">tabs[]: label, content</td>
                  <td className="px-4 py-3">tabs[]: label, content</td>
                  <td className="px-4 py-3">tabs[]: label, content, icon</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-medium text-text-primary">Table</td>
                  <td className="px-4 py-3">headers[], rows[][], caption</td>
                  <td className="px-4 py-3">headers[], rows[][], caption</td>
                  <td className="px-4 py-3">headers[], rows[][], caption, stickyHeader</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">Avatar</td>
                  <td className="px-4 py-3">src, alt, fallback</td>
                  <td className="px-4 py-3">src, alt, fallback</td>
                  <td className="px-4 py-3">src, alt, variant: circular, rounded, square</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Customizing Schemas */}
        <section id="customizing" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Customizing Schemas</h2>
          <p className="text-text-secondary mb-4">
            Adapter schemas are standard Zod objects. You can extend them with <InlineCode>.extend()</InlineCode> to
            add custom fields, override defaults, or tighten constraints before registering.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Extending a schema</h3>
          <p className="text-text-secondary mb-3">
            Import the raw schema from the adapter, extend it, then register the customized version:
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { buttonSchema } from '@genuikit/adapters/shadcn';
import { ComponentRegistry } from '@genuikit/core';
import { Button } from '@/components/ui/button';

// Add icon and tooltip props to the default button schema
const extendedButtonSchema = buttonSchema.extend({
  icon: z.enum(['plus', 'trash', 'edit', 'download']).optional(),
  tooltip: z.string().max(100).optional(),
});

const registry = new ComponentRegistry();
registry.register('Button', extendedButtonSchema, Button);`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Overriding defaults</h3>
          <p className="text-text-secondary mb-3">
            Use <InlineCode>.extend()</InlineCode> with a field that already exists to replace its
            definition. For example, restrict button variants to a smaller set:
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { buttonSchema } from '@genuikit/adapters/shadcn';

// Only allow 'default' and 'outline' variants in your app
const restrictedButton = buttonSchema.extend({
  variant: z.enum(['default', 'outline']).default('default'),
});`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Adding action schemas</h3>
          <p className="text-text-secondary mb-3">
            Action schemas define callbacks the LLM can attach to interactive components. They are
            registered separately from prop schemas:
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { z } from 'zod';
import { ComponentRegistry } from '@genuikit/core';
import { buttonSchema } from '@genuikit/adapters/shadcn';
import { Button } from '@/components/ui/button';

const buttonActionSchema = z.object({
  onClick: z.object({
    action: z.enum(['navigate', 'submit', 'dismiss']),
    payload: z.record(z.string()).optional(),
  }).optional(),
});

const registry = new ComponentRegistry();
registry.register('Button', buttonSchema, Button, {
  actionSchema: buttonActionSchema,
});`}
          />
        </section>

        {/* Creating Custom Adapters */}
        <section id="custom-adapters" className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Creating Custom Adapters</h2>
          <p className="text-text-secondary mb-4">
            If none of the built-in adapters fit your design system, you can create your own using
            {' '}<InlineCode>createRegistryFactory</InlineCode> from <InlineCode>@genuikit/core</InlineCode>.
            This gives you the same factory pattern the official adapters use.
          </p>

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Factory function</h3>
          <p className="text-text-secondary mb-3">
            Define your component schemas, then wrap them in a factory that accepts a component map:
          </p>
          <CodeBlock
            language="typescript"
            filename="my-adapter.ts"
            code={`import { z } from 'zod';
import { createRegistryFactory } from '@genuikit/core';

// Define schemas for your design system
const schemas = {
  Button: z.object({
    label: z.string().max(50),
    intent: z.enum(['primary', 'neutral', 'caution']).default('neutral'),
    size: z.enum(['xs', 'sm', 'md', 'lg']).default('md'),
    disabled: z.boolean().default(false),
  }),
  Card: z.object({
    heading: z.string().max(120),
    body: z.string().max(2000),
    elevated: z.boolean().default(false),
  }),
  Notice: z.object({
    message: z.string().max(500),
    level: z.enum(['info', 'warn', 'error', 'success']).default('info'),
    dismissible: z.boolean().default(true),
  }),
};

// Create the factory — consumers call this with their component map
export const createMyRegistry = createRegistryFactory(schemas);`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Using the custom adapter</h3>
          <p className="text-text-secondary mb-3">
            Consumers of your adapter use it exactly like the built-in adapters:
          </p>
          <CodeBlock
            language="typescript"
            filename="registry.ts"
            code={`import { createMyRegistry } from '@my-org/design-system-adapter';
import { Button, Card, Notice } from '@my-org/design-system';

const registry = createMyRegistry({
  Button,
  Card,
  Notice,
});

export default registry;`}
          />

          <h3 className="text-lg font-medium text-text-primary mb-2 mt-8">Including action schemas</h3>
          <p className="text-text-secondary mb-3">
            Pass a second argument to <InlineCode>createRegistryFactory</InlineCode> to define
            action schemas alongside your component schemas:
          </p>
          <CodeBlock
            language="typescript"
            filename="my-adapter.ts"
            code={`import { z } from 'zod';
import { createRegistryFactory } from '@genuikit/core';

const schemas = {
  Button: z.object({
    label: z.string().max(50),
    intent: z.enum(['primary', 'neutral', 'caution']).default('neutral'),
  }),
};

const actionSchemas = {
  Button: z.object({
    onClick: z.object({
      action: z.enum(['navigate', 'submit', 'dismiss']),
      url: z.string().url().optional(),
    }).optional(),
  }),
};

export const createMyRegistry = createRegistryFactory(schemas, actionSchemas);`}
          />
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Next Steps</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/docs/core-concepts"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Core Concepts</h3>
              <p className="mt-1 text-sm text-text-secondary">Understand registries, validation, and correction prompts.</p>
            </Link>
            <Link
              href="/docs/security"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Security</h3>
              <p className="mt-1 text-sm text-text-secondary">Learn about XSS protection and safe schemas.</p>
            </Link>
            <Link
              href="/docs/react-hooks"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">React Hooks</h3>
              <p className="mt-1 text-sm text-text-secondary">API reference for useGenerativeUI and useStreamingUI.</p>
            </Link>
            <Link
              href="/docs/streaming"
              className="rounded-lg border border-border bg-surface-card p-4 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-sm font-medium text-primary">Streaming</h3>
              <p className="mt-1 text-sm text-text-secondary">Progressive rendering with incremental JSON parsing.</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Table of Contents */}
      <OnThisPage headings={headings} />
    </div>
  );
}
