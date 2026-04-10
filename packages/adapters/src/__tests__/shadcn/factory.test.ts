import { describe, it, expect } from 'vitest';
import { createShadcnRegistry } from '../../shadcn/factory.js';
import { MissingComponentError } from '../../shared/create-registry-factory.js';

const Dummy = () => null;

const allComponents = {
  Button: Dummy,
  Card: Dummy,
  Alert: Dummy,
  Badge: Dummy,
  Input: Dummy,
  Select: Dummy,
  Dialog: Dummy,
  Tabs: Dummy,
  Table: Dummy,
  Avatar: Dummy,
  Accordion: Dummy,
  Breadcrumbs: Dummy,
  Pagination: Dummy,
  ProgressBar: Dummy,
  Skeleton: Dummy,
  Tooltip: Dummy,
  Textarea: Dummy,
  Checkbox: Dummy,
  RadioGroup: Dummy,
  Switch: Dummy,
  Slider: Dummy,
  Form: Dummy,
  Stepper: Dummy,
  StatCard: Dummy,
  Timeline: Dummy,
  BarChart: Dummy,
  LineChart: Dummy,
  PieChart: Dummy,
  AreaChart: Dummy,
  Map: Dummy,
};

describe('createShadcnRegistry', () => {
  it('creates registry with all 30 components', () => {
    const registry = createShadcnRegistry(allComponents);
    expect(registry.size).toBe(30);
  });

  it('registers action schemas for interactive components', () => {
    const registry = createShadcnRegistry(allComponents);

    expect(registry.hasAction('Button', 'onClick')).toBe(true);
    expect(registry.hasAction('Input', 'onChange')).toBe(true);
    expect(registry.hasAction('Select', 'onChange')).toBe(true);
    expect(registry.hasAction('Dialog', 'onOpenChange')).toBe(true);
    expect(registry.hasAction('Tabs', 'onValueChange')).toBe(true);
    expect(registry.hasAction('Accordion', 'onValueChange')).toBe(true);
    expect(registry.hasAction('Form', 'onSubmit')).toBe(true);
    expect(registry.hasAction('Map', 'onMarkerSelect')).toBe(true);
  });

  it('does not register actions for non-interactive components', () => {
    const registry = createShadcnRegistry(allComponents);

    expect(registry.hasAction('Card', 'onClick')).toBe(false);
    expect(registry.hasAction('Table', 'onClick')).toBe(false);
  });

  it('resolves valid button', () => {
    const registry = createShadcnRegistry(allComponents);
    const result = registry.resolve({
      type: 'Button',
      props: { children: 'Click me' },
    });
    expect(result.ok).toBe(true);
  });

  it('validates action payloads', () => {
    const registry = createShadcnRegistry(allComponents);
    const result = registry.validateAction('Button', 'onClick', {});
    expect(result.ok).toBe(true);
  });

  it('throws when components are missing', () => {
    expect(() => createShadcnRegistry({ Button: Dummy } as any)).toThrow(MissingComponentError);
  });

  it('strips XSS from resolved props', () => {
    const registry = createShadcnRegistry(allComponents);
    const result = registry.resolve({
      type: 'Button',
      props: { children: '<script>alert(1)</script>Safe' },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.props.children).toBe('alert(1)Safe');
    }
  });

  it('rejects javascript: URLs in avatar', () => {
    const registry = createShadcnRegistry(allComponents);
    const result = registry.resolve({
      type: 'Avatar',
      props: { src: 'javascript:alert(1)', alt: 'User' },
    });
    expect(result.ok).toBe(false);
  });

  it('resolves shared advanced components', () => {
    const registry = createShadcnRegistry(allComponents);
    const result = registry.resolve({
      type: 'BarChart',
      props: {
        categories: ['Jan', 'Feb'],
        series: [{ id: 'revenue', label: 'Revenue', values: [10, 20] }],
      },
    });
    expect(result.ok).toBe(true);
  });
});
