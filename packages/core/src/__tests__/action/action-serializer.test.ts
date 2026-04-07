import { describe, it, expect } from 'vitest';
import { ActionSerializer } from '../../action/action-serializer.js';
import type { Action } from '../../action/types.js';

function makeAction(overrides: Partial<Action> = {}): Action {
  return {
    component: 'ContactForm',
    action: 'onSubmit',
    payload: { name: 'John', email: 'john@example.com' },
    timestamp: 1700000000000,
    id: 'act_test_0',
    ...overrides,
  };
}

describe('ActionSerializer', () => {
  it('serialize produces correct tool call result', () => {
    const serializer = new ActionSerializer();
    const result = serializer.serialize(makeAction());

    expect(result.tool).toBe('ContactForm.onSubmit');
    expect(result.result).toEqual({
      component: 'ContactForm',
      action: 'onSubmit',
      payload: { name: 'John', email: 'john@example.com' },
      actionId: 'act_test_0',
    });
    expect(result.timestamp).toBe(new Date(1700000000000).toISOString());
  });

  it('serialize with prefix prepends to tool name', () => {
    const serializer = new ActionSerializer({ prefix: 'genui' });
    const result = serializer.serialize(makeAction());

    expect(result.tool).toBe('genui.ContactForm.onSubmit');
  });

  it('serializeBatch serializes multiple actions', () => {
    const serializer = new ActionSerializer();
    const actions = [
      makeAction({ id: 'act_1' }),
      makeAction({ component: 'Button', action: 'onClick', payload: { x: 10 }, id: 'act_2' }),
    ];

    const results = serializer.serializeBatch(actions);
    expect(results).toHaveLength(2);
    expect(results[0]!.tool).toBe('ContactForm.onSubmit');
    expect(results[1]!.tool).toBe('Button.onClick');
  });

  it('toPrompt formats action as human-readable string', () => {
    const serializer = new ActionSerializer();
    const prompt = serializer.toPrompt(makeAction());

    expect(prompt).toContain('User interacted with "ContactForm" component');
    expect(prompt).toContain('Action: onSubmit');
    expect(prompt).toContain('John');
  });

  it('toBatchPrompt handles empty array', () => {
    const serializer = new ActionSerializer();
    expect(serializer.toBatchPrompt([])).toBe('No user interactions.');
  });

  it('toBatchPrompt handles single action', () => {
    const serializer = new ActionSerializer();
    const result = serializer.toBatchPrompt([makeAction()]);
    expect(result).toContain('User interacted with "ContactForm"');
    expect(result).not.toContain('interactions:');
  });

  it('toBatchPrompt handles multiple actions', () => {
    const serializer = new ActionSerializer();
    const result = serializer.toBatchPrompt([
      makeAction({ id: 'act_1' }),
      makeAction({ component: 'Button', action: 'onClick', id: 'act_2' }),
    ]);

    expect(result).toContain('2 interactions');
    expect(result).toContain('1.');
    expect(result).toContain('2.');
  });
});
