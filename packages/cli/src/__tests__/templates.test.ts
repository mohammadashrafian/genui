import { describe, expect, it } from 'vitest';
import {
  type AdapterChoice,
  generateRegistryTemplate,
  getAdapterChoices,
  getDependencies,
  isValidAdapter,
} from '../templates/registry.js';

// ---------------------------------------------------------------------------
// isValidAdapter
// ---------------------------------------------------------------------------

describe('isValidAdapter', () => {
  it('returns true for each supported adapter', () => {
    expect(isValidAdapter('shadcn')).toBe(true);
    expect(isValidAdapter('tailwind')).toBe(true);
    expect(isValidAdapter('mui')).toBe(true);
  });

  it('returns false for unknown strings', () => {
    expect(isValidAdapter('bootstrap')).toBe(false);
    expect(isValidAdapter('')).toBe(false);
    expect(isValidAdapter('SHADCN')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAdapterChoices
// ---------------------------------------------------------------------------

describe('getAdapterChoices', () => {
  it('returns all three adapters', () => {
    const choices = getAdapterChoices();
    expect(choices).toEqual(['shadcn', 'tailwind', 'mui']);
  });

  it('returns a frozen/readonly array', () => {
    const choices = getAdapterChoices();
    expect(() => {
      (choices as string[]).push('invalid');
    }).toThrow();
  });
});

// ---------------------------------------------------------------------------
// generateRegistryTemplate
// ---------------------------------------------------------------------------

describe('generateRegistryTemplate', () => {
  it('generates a shadcn template with correct factory import', () => {
    const result = generateRegistryTemplate('shadcn');
    expect(result).toContain("import { createShadcnRegistry } from '@genuikit/adapters/shadcn'");
    expect(result).toContain("from '@/components/ui/button'");
    expect(result).toContain('createShadcnRegistry({');
  });

  it('generates a tailwind template with correct factory import', () => {
    const result = generateRegistryTemplate('tailwind');
    expect(result).toContain(
      "import { createTailwindRegistry } from '@genuikit/adapters/tailwind'",
    );
    expect(result).toContain("from './components/button'");
    expect(result).toContain('createTailwindRegistry({');
  });

  it('generates a MUI template with correct factory import', () => {
    const result = generateRegistryTemplate('mui');
    expect(result).toContain("import { createMuiRegistry } from '@genuikit/adapters/mui'");
    expect(result).toContain("from '@mui/material/Button'");
    expect(result).toContain('createMuiRegistry({');
  });

  it('includes all 30 standard components in every template', () => {
    const expectedComponents: Record<AdapterChoice, string[]> = {
      shadcn: [
        'Button',
        'Card',
        'Alert',
        'Badge',
        'Input',
        'Select',
        'Dialog',
        'Tabs',
        'Table',
        'Avatar',
        'Accordion',
        'Breadcrumbs',
        'Pagination',
        'ProgressBar',
        'Skeleton',
        'Tooltip',
        'Textarea',
        'Checkbox',
        'RadioGroup',
        'Switch',
        'Slider',
        'Form',
        'Stepper',
        'StatCard',
        'Timeline',
        'BarChart',
        'LineChart',
        'PieChart',
        'AreaChart',
        'Map',
      ],
      tailwind: [
        'Button',
        'Card',
        'Alert',
        'Badge',
        'Input',
        'Select',
        'Dialog',
        'Tabs',
        'Table',
        'Avatar',
        'Accordion',
        'Breadcrumbs',
        'Pagination',
        'ProgressBar',
        'Skeleton',
        'Tooltip',
        'Textarea',
        'Checkbox',
        'RadioGroup',
        'Switch',
        'Slider',
        'Form',
        'Stepper',
        'StatCard',
        'Timeline',
        'BarChart',
        'LineChart',
        'PieChart',
        'AreaChart',
        'Map',
      ],
      mui: [
        'Button',
        'Card',
        'Alert',
        'Chip',
        'TextField',
        'Select',
        'Dialog',
        'Tabs',
        'Table',
        'Avatar',
        'Accordion',
        'Breadcrumbs',
        'Pagination',
        'ProgressBar',
        'Skeleton',
        'Tooltip',
        'Textarea',
        'Checkbox',
        'RadioGroup',
        'Switch',
        'Slider',
        'Form',
        'Stepper',
        'StatCard',
        'Timeline',
        'BarChart',
        'LineChart',
        'PieChart',
        'AreaChart',
        'Map',
      ],
    };

    for (const adapter of getAdapterChoices()) {
      const template = generateRegistryTemplate(adapter);
      for (const component of expectedComponents[adapter]) {
        expect(template).toContain(component);
      }
    }
  });

  it('exports a registry constant in every template', () => {
    for (const adapter of getAdapterChoices()) {
      const template = generateRegistryTemplate(adapter);
      expect(template).toContain('export const registry =');
    }
  });

  it('throws for an unknown adapter', () => {
    expect(() => generateRegistryTemplate('bootstrap' as AdapterChoice)).toThrow(
      /Unknown adapter "bootstrap"/,
    );
  });

  it('produces valid TypeScript (no stray characters / well-formed)', () => {
    for (const adapter of getAdapterChoices()) {
      const template = generateRegistryTemplate(adapter);
      // Ends with a newline (file hygiene)
      expect(template.endsWith('\n')).toBe(true);
      // Contains balanced braces
      const opens = (template.match(/{/g) ?? []).length;
      const closes = (template.match(/}/g) ?? []).length;
      expect(opens).toBe(closes);
    }
  });
});

// ---------------------------------------------------------------------------
// getDependencies
// ---------------------------------------------------------------------------

describe('getDependencies', () => {
  it('always includes core dependencies', () => {
    for (const adapter of getAdapterChoices()) {
      const deps = getDependencies(adapter);
      expect(deps).toContain('@genuikit/core');
      expect(deps).toContain('@genuikit/adapters');
      expect(deps).toContain('zod');
    }
  });

  it('adds MUI-specific packages for the mui adapter', () => {
    const deps = getDependencies('mui');
    expect(deps).toContain('@mui/material');
    expect(deps).toContain('@emotion/react');
    expect(deps).toContain('@emotion/styled');
  });

  it('does not add extra packages for shadcn', () => {
    const deps = getDependencies('shadcn');
    expect(deps).toEqual(['@genuikit/core', '@genuikit/adapters', 'zod']);
  });

  it('does not add extra packages for tailwind', () => {
    const deps = getDependencies('tailwind');
    expect(deps).toEqual(['@genuikit/core', '@genuikit/adapters', 'zod']);
  });
});
