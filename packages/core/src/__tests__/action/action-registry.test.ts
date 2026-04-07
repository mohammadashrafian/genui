import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ActionRegistry, ActionNotFoundError } from '../../action/action-registry.js';
import { ComponentNotFoundError } from '../../errors.js';

const propSchema = z.object({ label: z.string() });
const submitSchema = z.object({ name: z.string(), email: z.string().email() });
const clickSchema = z.object({ x: z.number(), y: z.number() });
const DummyComponent = () => null;

describe('ActionRegistry', () => {
  it('registerWithActions stores component with action schemas', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    expect(registry.has('Form')).toBe(true);
    expect(registry.hasAction('Form', 'onSubmit')).toBe(true);
  });

  it('extends ComponentRegistry — resolve still works', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    const result = registry.resolve({ type: 'Form', props: { label: 'hi' } });
    expect(result.ok).toBe(true);
  });

  it('validates action payloads correctly', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    const valid = registry.validateAction('Form', 'onSubmit', {
      name: 'John',
      email: 'john@example.com',
    });

    expect(valid.ok).toBe(true);
    expect(valid.action).toBeDefined();
    expect(valid.action!.component).toBe('Form');
    expect(valid.action!.action).toBe('onSubmit');
    expect(valid.action!.payload).toEqual({ name: 'John', email: 'john@example.com' });
    expect(valid.action!.id).toMatch(/^act_/);
  });

  it('returns errors for invalid action payloads', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    const invalid = registry.validateAction('Form', 'onSubmit', {
      name: 'John',
      email: 'not-an-email',
    });

    expect(invalid.ok).toBe(false);
    expect(invalid.errors).toBeDefined();
    expect(invalid.errors!.length).toBeGreaterThan(0);
    expect(invalid.correctionPrompt).toBeDefined();
  });

  it('throws ComponentNotFoundError for unknown component', () => {
    const registry = new ActionRegistry();

    expect(() => registry.validateAction('Unknown', 'onClick', {}))
      .toThrow(ComponentNotFoundError);
  });

  it('throws ActionNotFoundError for unknown action', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    expect(() => registry.validateAction('Form', 'onClick', {}))
      .toThrow(ActionNotFoundError);
  });

  it('getActions returns action schema map', () => {
    const registry = new ActionRegistry();
    const actions = { onSubmit: submitSchema, onClick: clickSchema };
    registry.registerWithActions('Form', propSchema, actions, DummyComponent);

    const result = registry.getActions('Form');
    expect(result).toBeDefined();
    expect(Object.keys(result!)).toEqual(['onSubmit', 'onClick']);
  });

  it('getActionSchema returns specific schema', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    expect(registry.getActionSchema('Form', 'onSubmit')).toBe(submitSchema);
    expect(registry.getActionSchema('Form', 'missing')).toBeUndefined();
  });

  it('actionNames lists all action names for a component', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions(
      'Form',
      propSchema,
      { onSubmit: submitSchema, onClick: clickSchema },
      DummyComponent,
    );

    expect(registry.actionNames('Form')).toEqual(['onSubmit', 'onClick']);
    expect(registry.actionNames('Unknown')).toEqual([]);
  });

  it('hasAction checks existence correctly', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    expect(registry.hasAction('Form', 'onSubmit')).toBe(true);
    expect(registry.hasAction('Form', 'onClick')).toBe(false);
    expect(registry.hasAction('Unknown', 'onSubmit')).toBe(false);
  });

  it('unregister removes both component and action entries', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    expect(registry.unregister('Form')).toBe(true);
    expect(registry.has('Form')).toBe(false);
    expect(registry.hasAction('Form', 'onSubmit')).toBe(false);
    expect(registry.getActions('Form')).toBeUndefined();
  });

  it('generates unique action IDs', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    const r1 = registry.validateAction('Form', 'onSubmit', { name: 'A', email: 'a@b.com' });
    const r2 = registry.validateAction('Form', 'onSubmit', { name: 'B', email: 'b@c.com' });

    expect(r1.action!.id).not.toBe(r2.action!.id);
  });

  it('action timestamp is set to approximately now', () => {
    const registry = new ActionRegistry();
    registry.registerWithActions('Form', propSchema, { onSubmit: submitSchema }, DummyComponent);

    const before = Date.now();
    const result = registry.validateAction('Form', 'onSubmit', { name: 'A', email: 'a@b.com' });
    const after = Date.now();

    expect(result.action!.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.action!.timestamp).toBeLessThanOrEqual(after);
  });
});
