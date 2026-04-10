import { describe, it, expect } from 'vitest';
import { createTailwindRegistry } from '../../tailwind/factory.js';

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

describe('createTailwindRegistry', () => {
  it('creates registry with all 30 components', () => {
    const registry = createTailwindRegistry(allComponents);
    expect(registry.size).toBe(30);
  });

  it('registers action schemas for interactive components', () => {
    const registry = createTailwindRegistry(allComponents);

    expect(registry.hasAction('Button', 'onClick')).toBe(true);
    expect(registry.hasAction('Input', 'onChange')).toBe(true);
    expect(registry.hasAction('Alert', 'onDismiss')).toBe(true);
    expect(registry.hasAction('Slider', 'onValueChange')).toBe(true);
    expect(registry.hasAction('Checkbox', 'onCheckedChange')).toBe(true);
    expect(registry.hasAction('Pagination', 'onPageChange')).toBe(true);
  });

  it('resolves valid button with Tailwind variants', () => {
    const registry = createTailwindRegistry(allComponents);
    const result = registry.resolve({
      type: 'Button',
      props: { children: 'Submit', variant: 'primary', size: 'lg' },
    });
    expect(result.ok).toBe(true);
  });

  it('resolves alert with type enum', () => {
    const registry = createTailwindRegistry(allComponents);
    const result = registry.resolve({
      type: 'Alert',
      props: { message: 'Warning!', type: 'warning' },
    });
    expect(result.ok).toBe(true);
  });

  it('strips XSS from all string props', () => {
    const registry = createTailwindRegistry(allComponents);
    const result = registry.resolve({
      type: 'Card',
      props: { body: '<img onerror=alert(1)>Content' },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.props.body).toBe('Content');
    }
  });

  it('resolves shared map schema', () => {
    const registry = createTailwindRegistry(allComponents);
    const result = registry.resolve({
      type: 'Map',
      props: {
        center: { lat: 41.0082, lng: 28.9784 },
        markers: [{ id: 'ist', position: { lat: 41.0082, lng: 28.9784 }, label: 'Istanbul' }],
      },
    });
    expect(result.ok).toBe(true);
  });
});
