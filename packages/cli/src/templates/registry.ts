/**
 * Registry file templates for each supported UI adapter.
 *
 * Each template produces a ready-to-use `registry.ts` that imports the
 * adapter factory and wires up a standard set of components.
 */

export type AdapterChoice = 'shadcn' | 'tailwind' | 'mui';

const ADAPTERS: readonly AdapterChoice[] = Object.freeze(['shadcn', 'tailwind', 'mui']);

interface TemplateImport {
  readonly name: string;
  readonly source: string;
  readonly style: 'named' | 'default';
  readonly localName?: string;
}

const SHADCN_COMPONENTS: readonly TemplateImport[] = [
  { name: 'Button', source: '@/components/ui/button', style: 'named' },
  { name: 'Card', source: '@/components/ui/card', style: 'named' },
  { name: 'Alert', source: '@/components/ui/alert', style: 'named' },
  { name: 'Badge', source: '@/components/ui/badge', style: 'named' },
  { name: 'Input', source: '@/components/ui/input', style: 'named' },
  { name: 'Select', source: '@/components/ui/select', style: 'named' },
  { name: 'Dialog', source: '@/components/ui/dialog', style: 'named' },
  { name: 'Tabs', source: '@/components/ui/tabs', style: 'named' },
  { name: 'Table', source: '@/components/ui/table', style: 'named' },
  { name: 'Avatar', source: '@/components/ui/avatar', style: 'named' },
  { name: 'Accordion', source: '@/components/ui/accordion', style: 'named' },
  { name: 'Breadcrumbs', source: '@/components/ui/breadcrumbs', style: 'named' },
  { name: 'Pagination', source: '@/components/ui/pagination', style: 'named' },
  { name: 'ProgressBar', source: '@/components/ui/progress-bar', style: 'named' },
  { name: 'Skeleton', source: '@/components/ui/skeleton', style: 'named' },
  { name: 'Tooltip', source: '@/components/ui/tooltip', style: 'named' },
  { name: 'Textarea', source: '@/components/ui/textarea', style: 'named' },
  { name: 'Checkbox', source: '@/components/ui/checkbox', style: 'named' },
  { name: 'RadioGroup', source: '@/components/ui/radio-group', style: 'named' },
  { name: 'Switch', source: '@/components/ui/switch', style: 'named' },
  { name: 'Slider', source: '@/components/ui/slider', style: 'named' },
  { name: 'Form', source: '@/components/ui/form', style: 'named' },
  { name: 'Stepper', source: '@/components/ui/stepper', style: 'named' },
  { name: 'StatCard', source: '@/components/ui/stat-card', style: 'named' },
  { name: 'Timeline', source: '@/components/ui/timeline', style: 'named' },
  { name: 'BarChart', source: '@/components/ui/bar-chart', style: 'named' },
  { name: 'LineChart', source: '@/components/ui/line-chart', style: 'named' },
  { name: 'PieChart', source: '@/components/ui/pie-chart', style: 'named' },
  { name: 'AreaChart', source: '@/components/ui/area-chart', style: 'named' },
  { name: 'Map', source: '@/components/ui/map', style: 'named' },
];

const TAILWIND_COMPONENTS: readonly TemplateImport[] = [
  { name: 'Button', source: './components/button', style: 'named' },
  { name: 'Card', source: './components/card', style: 'named' },
  { name: 'Alert', source: './components/alert', style: 'named' },
  { name: 'Badge', source: './components/badge', style: 'named' },
  { name: 'Input', source: './components/input', style: 'named' },
  { name: 'Select', source: './components/select', style: 'named' },
  { name: 'Dialog', source: './components/dialog', style: 'named' },
  { name: 'Tabs', source: './components/tabs', style: 'named' },
  { name: 'Table', source: './components/table', style: 'named' },
  { name: 'Avatar', source: './components/avatar', style: 'named' },
  { name: 'Accordion', source: './components/accordion', style: 'named' },
  { name: 'Breadcrumbs', source: './components/breadcrumbs', style: 'named' },
  { name: 'Pagination', source: './components/pagination', style: 'named' },
  { name: 'ProgressBar', source: './components/progress-bar', style: 'named' },
  { name: 'Skeleton', source: './components/skeleton', style: 'named' },
  { name: 'Tooltip', source: './components/tooltip', style: 'named' },
  { name: 'Textarea', source: './components/textarea', style: 'named' },
  { name: 'Checkbox', source: './components/checkbox', style: 'named' },
  { name: 'RadioGroup', source: './components/radio-group', style: 'named' },
  { name: 'Switch', source: './components/switch', style: 'named' },
  { name: 'Slider', source: './components/slider', style: 'named' },
  { name: 'Form', source: './components/form', style: 'named' },
  { name: 'Stepper', source: './components/stepper', style: 'named' },
  { name: 'StatCard', source: './components/stat-card', style: 'named' },
  { name: 'Timeline', source: './components/timeline', style: 'named' },
  { name: 'BarChart', source: './components/bar-chart', style: 'named' },
  { name: 'LineChart', source: './components/line-chart', style: 'named' },
  { name: 'PieChart', source: './components/pie-chart', style: 'named' },
  { name: 'AreaChart', source: './components/area-chart', style: 'named' },
  { name: 'Map', source: './components/map', style: 'named' },
];

const MUI_COMPONENTS: readonly TemplateImport[] = [
  { name: 'Button', source: '@mui/material/Button', style: 'default' },
  { name: 'Card', source: '@mui/material/Card', style: 'default' },
  { name: 'Alert', source: '@mui/material/Alert', style: 'default' },
  { name: 'Chip', source: '@mui/material/Chip', style: 'default' },
  { name: 'TextField', source: '@mui/material/TextField', style: 'default' },
  { name: 'Select', source: '@mui/material/Select', style: 'default' },
  { name: 'Dialog', source: '@mui/material/Dialog', style: 'default' },
  { name: 'Tabs', source: '@mui/material/Tabs', style: 'default' },
  { name: 'Table', source: '@mui/material/Table', style: 'default' },
  { name: 'Avatar', source: '@mui/material/Avatar', style: 'default' },
  { name: 'Accordion', source: '@mui/material/Accordion', style: 'default' },
  { name: 'Breadcrumbs', source: '@mui/material/Breadcrumbs', style: 'default' },
  { name: 'Pagination', source: '@mui/material/Pagination', style: 'default' },
  { name: 'ProgressBar', source: './components/progress-bar', style: 'default' },
  { name: 'Skeleton', source: '@mui/material/Skeleton', style: 'default' },
  { name: 'Tooltip', source: '@mui/material/Tooltip', style: 'default' },
  { name: 'Textarea', source: './components/textarea', style: 'default' },
  { name: 'Checkbox', source: '@mui/material/Checkbox', style: 'default' },
  { name: 'RadioGroup', source: '@mui/material/RadioGroup', style: 'default' },
  { name: 'Switch', source: '@mui/material/Switch', style: 'default' },
  { name: 'Slider', source: '@mui/material/Slider', style: 'default' },
  { name: 'Form', source: './components/form', style: 'default' },
  { name: 'Stepper', source: '@mui/material/Stepper', style: 'default' },
  { name: 'StatCard', source: './components/stat-card', style: 'default' },
  { name: 'Timeline', source: './components/timeline', style: 'default' },
  { name: 'BarChart', source: './components/bar-chart', style: 'default' },
  { name: 'LineChart', source: './components/line-chart', style: 'default' },
  { name: 'PieChart', source: './components/pie-chart', style: 'default' },
  { name: 'AreaChart', source: './components/area-chart', style: 'default' },
  { name: 'Map', source: './components/map', style: 'default' },
];

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

function renderImports(components: readonly TemplateImport[]): string {
  return components
    .map((component) => {
      const importedName = component.localName ?? component.name;
      if (component.style === 'named') {
        return `import { ${importedName} } from '${component.source}';`;
      }
      return `import ${importedName} from '${component.source}';`;
    })
    .join('\n');
}

function renderRegistryEntries(components: readonly TemplateImport[]): string {
  return components
    .map((component) => {
      const localName = component.localName ?? component.name;
      return localName === component.name
        ? `  ${component.name},`
        : `  ${component.name}: ${localName},`;
    })
    .join('\n');
}

function shadcnTemplate(): string {
  return `import { createShadcnRegistry } from '@genuikit/adapters/shadcn';

// Import your shadcn/ui components
${renderImports(SHADCN_COMPONENTS)}

export const registry = createShadcnRegistry({
${renderRegistryEntries(SHADCN_COMPONENTS)}
});
`;
}

function tailwindTemplate(): string {
  return `import { createTailwindRegistry } from '@genuikit/adapters/tailwind';

// Create your Tailwind CSS component implementations
// Each component receives validated props from the LLM
// See: https://github.com/mohammadashrafian/genuikit

${renderImports(TAILWIND_COMPONENTS)}

export const registry = createTailwindRegistry({
${renderRegistryEntries(TAILWIND_COMPONENTS)}
});
`;
}

function muiTemplate(): string {
  return `import { createMuiRegistry } from '@genuikit/adapters/mui';

// Import your MUI components and custom wrappers for advanced visualizations
${renderImports(MUI_COMPONENTS)}

export const registry = createMuiRegistry({
${renderRegistryEntries(MUI_COMPONENTS)}
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
  const base = ['@genuikit/core', '@genuikit/adapters', 'zod'];
  const adapterDeps: Record<AdapterChoice, string[]> = {
    shadcn: [],
    tailwind: [],
    mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
  };
  return [...base, ...adapterDeps[adapter]];
}
