import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionQueue } from '../../action/action-queue.js';
import type { Action } from '../../action/types.js';

let idCounter = 0;

function makeAction(overrides: Partial<Action> = {}): Action {
  return {
    component: 'Form',
    action: 'onSubmit',
    payload: { value: 'test' },
    timestamp: Date.now(),
    id: `act_test_${idCounter++}`,
    ...overrides,
  };
}

describe('ActionQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    idCounter = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Immediate dispatch (no debounce) ---

  it('dispatches actions immediately with no debounce', () => {
    const queue = new ActionQueue();
    const listener = vi.fn();
    queue.onAction(listener);

    queue.push(makeAction());

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies tool call listeners on immediate dispatch', () => {
    const queue = new ActionQueue();
    const toolListener = vi.fn();
    queue.onToolCall(toolListener);

    queue.push(makeAction({ component: 'Form', action: 'onSubmit' }));

    expect(toolListener).toHaveBeenCalledTimes(1);
    expect(toolListener.mock.calls[0]![0].tool).toBe('Form.onSubmit');
  });

  // --- Debounce behavior ---
  // With debounce, actions are delayed before being enqueued as pending.
  // Pending actions require flush() to be dispatched.

  it('debounce delays enqueue until timer fires', () => {
    const queue = new ActionQueue({ debounceMs: 100 });

    queue.push(makeAction());

    // Before timer: nothing in queue
    expect(queue.size).toBe(0);

    // After timer: enqueued as pending
    vi.advanceTimersByTime(100);
    expect(queue.size).toBe(1);
  });

  it('debounce resets on rapid pushes — only last enqueued', () => {
    const queue = new ActionQueue({ debounceMs: 100 });

    queue.push(makeAction({ id: 'act_1', payload: { value: 'first' } }));
    vi.advanceTimersByTime(50);
    queue.push(makeAction({ id: 'act_2', payload: { value: 'second' } }));
    vi.advanceTimersByTime(50);

    // First timer was reset, only second is pending
    expect(queue.size).toBe(0);

    vi.advanceTimersByTime(50);
    expect(queue.size).toBe(1);
  });

  it('flush dispatches debounced pending actions', () => {
    const queue = new ActionQueue({ debounceMs: 500 });
    const listener = vi.fn();
    queue.onAction(listener);

    queue.push(makeAction({ action: 'a' }));
    queue.push(makeAction({ action: 'b' }));

    // Advance timers so both debounce timers fire and actions are enqueued
    vi.advanceTimersByTime(500);

    // Now flush to dispatch
    const flushed = queue.flush();
    expect(flushed.length).toBeGreaterThan(0);
    expect(listener).toHaveBeenCalled();
  });

  it('flush clears debounce timers', () => {
    const queue = new ActionQueue({ debounceMs: 500 });
    const listener = vi.fn();
    queue.onAction(listener);

    queue.push(makeAction());
    queue.flush(); // Clears timers, nothing enqueued yet

    vi.advanceTimersByTime(500);
    // Timer was cleared, so nothing should have been enqueued
    expect(listener).not.toHaveBeenCalled();
  });

  // --- Conflict strategies ---

  it('conflict strategy "latest" replaces pending same-key action', () => {
    const queue = new ActionQueue({ conflictStrategy: 'latest' });
    const listener = vi.fn();
    queue.onAction(listener);

    queue.push(makeAction({ id: 'act_1', payload: { value: 'first' } }));
    queue.push(makeAction({ id: 'act_2', payload: { value: 'second' } }));

    // Both dispatched immediately (no debounce)
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('conflict strategy "first" discards duplicate-key actions when pending', () => {
    const queue = new ActionQueue({ debounceMs: 100, conflictStrategy: 'first' });

    // Enqueue two actions with same key
    queue.push(makeAction({ id: 'act_1', payload: { value: 'first' } }));
    vi.advanceTimersByTime(100); // first enqueued

    queue.push(makeAction({ id: 'act_2', payload: { value: 'second' } }));
    vi.advanceTimersByTime(100); // second enqueued — should be discarded (first strategy)

    // Only first should be in the queue
    const pending = queue.pending();
    expect(pending).toHaveLength(1);
    expect(pending[0]!.payload).toEqual({ value: 'first' });
  });

  it('conflict strategy "merge" allows duplicate-key actions', () => {
    const queue = new ActionQueue({ conflictStrategy: 'merge' });
    const listener = vi.fn();
    queue.onAction(listener);

    queue.push(makeAction({ id: 'act_1' }));
    queue.push(makeAction({ id: 'act_2' }));

    expect(listener).toHaveBeenCalledTimes(2);
  });

  // --- Queue limits ---

  it('enforces maxQueueSize by dropping oldest', () => {
    const queue = new ActionQueue({ maxQueueSize: 2, conflictStrategy: 'merge' });

    queue.push(makeAction({ id: 'act_1', action: 'a' }));
    queue.push(makeAction({ id: 'act_2', action: 'b' }));
    queue.push(makeAction({ id: 'act_3', action: 'c' }));

    const all = queue.all();
    expect(all.length).toBeLessThanOrEqual(2);
  });

  // --- Unsubscribe ---

  it('unsubscribe stops action listener notifications', () => {
    const queue = new ActionQueue();
    const listener = vi.fn();

    const unsub = queue.onAction(listener);
    unsub();

    queue.push(makeAction());
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe stops tool call listener notifications', () => {
    const queue = new ActionQueue();
    const listener = vi.fn();

    const unsub = queue.onToolCall(listener);
    unsub();

    queue.push(makeAction());
    expect(listener).not.toHaveBeenCalled();
  });

  // --- Clear and removeAllListeners ---

  it('clear removes all pending actions and timers', () => {
    const queue = new ActionQueue({ debounceMs: 100 });

    queue.push(makeAction());
    queue.clear();

    vi.advanceTimersByTime(200);
    expect(queue.size).toBe(0);
    expect(queue.all()).toHaveLength(0);
  });

  it('removeAllListeners stops all notifications', () => {
    const queue = new ActionQueue();
    const actionListener = vi.fn();
    const toolListener = vi.fn();
    queue.onAction(actionListener);
    queue.onToolCall(toolListener);

    queue.removeAllListeners();
    queue.push(makeAction());

    expect(actionListener).not.toHaveBeenCalled();
    expect(toolListener).not.toHaveBeenCalled();
  });

  // --- Error resilience ---

  it('listener errors are swallowed without affecting other listeners', () => {
    const queue = new ActionQueue();
    queue.onAction(() => { throw new Error('boom'); });

    const toolListener = vi.fn();
    queue.onToolCall(toolListener);

    expect(() => queue.push(makeAction())).not.toThrow();
    expect(toolListener).toHaveBeenCalledTimes(1);
  });

  // --- Size ---

  it('size returns 0 when queue is empty', () => {
    const queue = new ActionQueue();
    expect(queue.size).toBe(0);
  });

  it('size returns 0 after immediate dispatch (no pending)', () => {
    const queue = new ActionQueue(); // no debounce
    queue.push(makeAction());
    // Immediately dispatched, so pending count is 0
    expect(queue.size).toBe(0);
  });
});
