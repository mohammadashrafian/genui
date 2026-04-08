/**
 * Registry file templates for each supported UI adapter.
 *
 * Each template produces a ready-to-use `registry.ts` that imports the
 * adapter factory and wires up a standard set of components.
 */

export type AdapterChoice = 'shadcn' | 'tailwind' | 'mui';

const ADAPTERS: readonly AdapterChoice[] = Object.freeze(['shadcn', 'tailwind', 'mui']);

/** Validate that a string is a supported adapter name. */
export function isValidAdapter(value: string): value is AdapterChoice {
  return (ADAPTERS as readonly string[]).includes(value);
}

/** Return the list of supported adapter names. */
export function getAdapterChoices(): readonly AdapterChoice[] {
  return ADAPTERS;
}

// ---------------------------------------------------------------------------
// Template generators
// ---------------------------------------------------------------------------

function shadcnTemplate(): string {
  return `import { createShadcnRegistry } from '@genui/adapters/shadcn';

// Import your shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import { Table } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';

export const registry = createShadcnRegistry({
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
`;
}

function tailwindTemplate(): string {
  return `import { createTailwindRegistry } from '@genui/adapters/tailwind';

// Create your Tailwind CSS component implementations
// Each component receives validated props from the LLM
// See: https://github.com/mohammadashrafian/genui

import { Button } from './components/button';
import { Card } from './components/card';
import { Alert } from './components/alert';
import { Badge } from './components/badge';
import { Input } from './components/input';
import { Select } from './components/select';
import { Dialog } from './components/dialog';
import { Tabs } from './components/tabs';
import { Table } from './components/table';
import { Avatar } from './components/avatar';

export const registry = createTailwindRegistry({
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
`;
}

function muiTemplate(): string {
  return `import { createMuiRegistry } from '@genui/adapters/mui';

// Import your MUI components
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';

export const registry = createMuiRegistry({
  Button,
  Card,
  Alert,
  Chip,
  TextField,
  Select,
  Dialog,
  Tabs,
  Table,
  Avatar,
});
`;
}

const templateMap: Record<AdapterChoice, () => string> = {
  shadcn: shadcnTemplate,
  tailwind: tailwindTemplate,
  mui: muiTemplate,
};

/**
 * Generate the contents of a `registry.ts` file for the given adapter.
 *
 * @throws {Error} if the adapter name is not recognised.
 */
export function generateRegistryTemplate(adapter: AdapterChoice): string {
  const generator = templateMap[adapter];
  if (!generator) {
    throw new Error(
      `Unknown adapter "${String(adapter)}". Supported adapters: ${ADAPTERS.join(', ')}`,
    );
  }
  return generator();
}

/**
 * Return the set of npm packages a user needs to install for the chosen adapter.
 */
export function getDependencies(adapter: AdapterChoice): string[] {
  const base = ['@genui/core', '@genui/adapters', 'zod'];
  const adapterDeps: Record<AdapterChoice, string[]> = {
    shadcn: [],
    tailwind: [],
    mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
  };
  return [...base, ...adapterDeps[adapter]];
}
