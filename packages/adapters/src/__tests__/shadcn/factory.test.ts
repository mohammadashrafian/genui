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
};

describe('createShadcnRegistry', () => {
  it('creates registry with all 10 components', () => {
    const registry = createShadcnRegistry(allComponents);
    expect(registry.size).toBe(10);
  });

  it('registers action schemas for interactive components', () => {
    const registry = createShadcnRegistry(allComponents);

    expect(registry.hasAction('Button', 'onClick')).toBe(true);
    expect(registry.hasAction('Input', 'onChange')).toBe(true);
    expect(registry.hasAction('Select', 'onChange')).toBe(true);
    expect(registry.hasAction('Dialog', 'onOpenChange')).toBe(true);
    expect(registry.hasAction('Tabs', 'onValueChange')).toBe(true);
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
    expect(() => createShadcnRegistry({ Button: Dummy } as any))
      .toThrow(MissingComponentError);
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
});
