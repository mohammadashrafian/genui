import { describe, it, expect } from 'vitest';
import { createMuiRegistry } from '../../mui/factory.js';

const Dummy = () => null;

const allComponents = {
  Button: Dummy,
  Card: Dummy,
  Alert: Dummy,
  Chip: Dummy,
  TextField: Dummy,
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

describe('createMuiRegistry', () => {
  it('creates registry with all 30 components', () => {
    const registry = createMuiRegistry(allComponents);
    expect(registry.size).toBe(30);
  });

  it('registers MUI-specific action schemas', () => {
    const registry = createMuiRegistry(allComponents);

    expect(registry.hasAction('Button', 'onClick')).toBe(true);
    expect(registry.hasAction('TextField', 'onChange')).toBe(true);
    expect(registry.hasAction('Dialog', 'onClose')).toBe(true);
    expect(registry.hasAction('Chip', 'onClick')).toBe(true);
    expect(registry.hasAction('Chip', 'onDelete')).toBe(true);
    expect(registry.hasAction('Stepper', 'onStepChange')).toBe(true);
    expect(registry.hasAction('Checkbox', 'onCheckedChange')).toBe(true);
    expect(registry.hasAction('Map', 'onMarkerSelect')).toBe(true);
  });

  it('resolves button with MUI variants', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Button',
      props: { children: 'Submit', variant: 'contained', color: 'primary' },
    });
    expect(result.ok).toBe(true);
  });

  it('resolves alert with MUI severity', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Alert',
      props: { children: 'Error!', severity: 'error', variant: 'filled' },
    });
    expect(result.ok).toBe(true);
  });

  it('resolves TextField with MUI-specific props', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'TextField',
      props: { label: 'Email', variant: 'outlined', fullWidth: true },
    });
    expect(result.ok).toBe(true);
  });

  it('resolves Avatar with MUI variant', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Avatar',
      props: { alt: 'User', variant: 'rounded' },
    });
    expect(result.ok).toBe(true);
  });

  it('strips XSS from all string props', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Alert',
      props: { children: '<script>x</script>Warning', severity: 'warning' },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.props.children).toBe('xWarning');
    }
  });

  it('rejects javascript: URLs in card media', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Card',
      props: {
        content: 'Body',
        mediaUrl: 'javascript:alert(1)',
        mediaAlt: 'img',
      },
    });
    expect(result.ok).toBe(false);
  });

  it('resolves shared form schema', () => {
    const registry = createMuiRegistry(allComponents);
    const result = registry.resolve({
      type: 'Form',
      props: {
        fields: [
          { name: 'email', label: 'Email', type: 'email', required: true },
          {
            name: 'plan',
            label: 'Plan',
            type: 'select',
            options: [{ value: 'pro', label: 'Pro' }],
          },
        ],
      },
    });
    expect(result.ok).toBe(true);
  });
});
