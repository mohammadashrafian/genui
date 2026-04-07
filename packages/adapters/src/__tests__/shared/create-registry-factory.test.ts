import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createRegistryFactory, MissingComponentError } from '../../shared/create-registry-factory.js';
import type { ComponentDefinition } from '../../types.js';

const Dummy = () => null;

const defs = {
  Button: { schema: z.object({ label: z.string() }), description: 'A button' },
  Card: {
    schema: z.object({ title: z.string() }),
    actions: { onClick: z.object({ x: z.number() }) },
    description: 'A card',
  },
} as const satisfies Record<string, ComponentDefinition>;

describe('createRegistryFactory', () => {
  it('creates a registry with all components', () => {
    const create = createRegistryFactory(defs);
    const registry = create({ Button: Dummy, Card: Dummy });

    expect(registry.has('Button')).toBe(true);
    expect(registry.has('Card')).toBe(true);
    expect(registry.size).toBe(2);
  });

  it('registers action schemas for interactive components', () => {
    const create = createRegistryFactory(defs);
    const registry = create({ Button: Dummy, Card: Dummy });

    expect(registry.hasAction('Card', 'onClick')).toBe(true);
    expect(registry.hasAction('Button', 'onClick')).toBe(false);
  });

  it('throws MissingComponentError when a component is missing', () => {
    const create = createRegistryFactory(defs);

    expect(() => create({ Button: Dummy } as any)).toThrow(MissingComponentError);
  });

  it('MissingComponentError message includes component name', () => {
    const create = createRegistryFactory(defs);

    try {
      create({ Button: Dummy } as any);
    } catch (err) {
      expect((err as Error).message).toContain('Card');
    }
  });

  it('resolves components with valid props', () => {
    const create = createRegistryFactory(defs);
    const registry = create({ Button: Dummy, Card: Dummy });

    const result = registry.resolve({ type: 'Button', props: { label: 'Click' } });
    expect(result.ok).toBe(true);
  });

  it('rejects components with invalid props', () => {
    const create = createRegistryFactory(defs);
    const registry = create({ Button: Dummy, Card: Dummy });

    const result = registry.resolve({ type: 'Button', props: { label: 123 } });
    expect(result.ok).toBe(false);
  });

  it('supports allowOverwrite config', () => {
    const create = createRegistryFactory(defs);
    // No error when creating
    const registry = create({ Button: Dummy, Card: Dummy }, { allowOverwrite: true });
    expect(registry.size).toBe(2);
  });
});
