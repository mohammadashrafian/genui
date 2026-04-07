import type {
  Action,
  ActionListener,
  DispatchOptions,
  QueuedAction,
  ToolCallListener,
  ToolCallResult,
} from './types.js';
import { ActionSerializer } from './action-serializer.js';

/**
 * ActionQueue manages the flow of user actions with debouncing,
 * conflict resolution, and ordered dispatch.
 *
 * It sits between the UI components and the AI agent, ensuring that
 * rapid interactions don't flood the LLM and that conflicting actions
 * (e.g., double-clicks) are handled gracefully.
 *
 * @example
 * ```ts
 * const queue = new ActionQueue({
 *   debounceMs: 300,
 *   conflictStrategy: 'latest',
 *   maxQueueSize: 50,
 * });
 *
 * queue.onAction((action) => console.log('Dispatched:', action));
 * queue.onToolCall((result) => sendToLLM(result));
 *
 * queue.push(action); // Debounced and deduplicated
 * ```
 */
export class ActionQueue {
  private readonly queue: QueuedAction[] = [];
  private readonly options: Required<DispatchOptions>;
  private readonly serializer: ActionSerializer;
  private readonly actionListeners = new Set<ActionListener>();
  private readonly toolCallListeners = new Set<ToolCallListener>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(options: DispatchOptions = {}, serializer?: ActionSerializer) {
    this.options = {
      debounceMs: options.debounceMs ?? 0,
      maxQueueSize: options.maxQueueSize ?? 100,
      conflictStrategy: options.conflictStrategy ?? 'latest',
    };
    this.serializer = serializer ?? new ActionSerializer();
  }

  /** Subscribe to dispatched actions. Returns an unsubscribe function. */
  onAction(listener: ActionListener): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  /** Subscribe to tool call results (formatted for LLM). Returns unsubscribe. */
  onToolCall(listener: ToolCallListener): () => void {
    this.toolCallListeners.add(listener);
    return () => this.toolCallListeners.delete(listener);
  }

  /** Push an action into the queue. Respects debounce and conflict settings. */
  push(action: Action): void {
    const key = `${action.component}:${action.action}`;

    // Handle debouncing
    if (this.options.debounceMs > 0) {
      const existing = this.debounceTimers.get(key);
      if (existing) {
        clearTimeout(existing);
      }

      this.debounceTimers.set(
        key,
        setTimeout(() => {
          this.debounceTimers.delete(key);
          this.enqueue(action);
        }, this.options.debounceMs),
      );
      return;
    }

    this.enqueue(action);
  }

  /** Immediately flush all pending actions, bypassing debounce. */
  flush(): Action[] {
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Dispatch all pending
    const pending = this.queue.filter((a) => a.status === 'pending');
    for (const action of pending) {
      action.status = 'dispatched';
      this.dispatch(action);
    }

    return pending;
  }

  /** Get all actions currently in the queue. */
  pending(): readonly QueuedAction[] {
    return this.queue.filter((a) => a.status === 'pending');
  }

  /** Get the full queue including dispatched actions. */
  all(): readonly QueuedAction[] {
    return [...this.queue];
  }

  /** Number of pending actions. */
  get size(): number {
    return this.queue.filter((a) => a.status === 'pending').length;
  }

  /** Clear all pending actions and timers. */
  clear(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.queue.length = 0;
  }

  /** Remove all listeners. */
  removeAllListeners(): void {
    this.actionListeners.clear();
    this.toolCallListeners.clear();
  }

  private enqueue(action: Action): void {
    const key = `${action.component}:${action.action}`;

    // Handle conflict strategy
    if (this.options.conflictStrategy !== 'merge') {
      const existingIdx = this.queue.findIndex(
        (a) => a.status === 'pending' && `${a.component}:${a.action}` === key,
      );

      if (existingIdx >= 0) {
        if (this.options.conflictStrategy === 'latest') {
          // Replace the existing pending action
          this.queue.splice(existingIdx, 1);
        } else if (this.options.conflictStrategy === 'first') {
          // Keep the first, discard the new one
          return;
        }
      }
    }

    // Enforce max queue size
    while (this.queue.length >= this.options.maxQueueSize) {
      this.queue.shift();
    }

    const queued: QueuedAction = { ...action, status: 'pending' };
    this.queue.push(queued);

    // If no debounce, dispatch immediately
    if (this.options.debounceMs === 0) {
      queued.status = 'dispatched';
      this.dispatch(queued);
    }
  }

  private dispatch(action: Action): void {
    // Notify action listeners
    for (const listener of this.actionListeners) {
      try {
        listener(action);
      } catch {
        // Swallow listener errors to prevent cascade
      }
    }

    // Notify tool call listeners with serialized result
    if (this.toolCallListeners.size > 0) {
      const result: ToolCallResult = this.serializer.serialize(action);
      for (const listener of this.toolCallListeners) {
        try {
          listener(result);
        } catch {
          // Swallow listener errors
        }
      }
    }
  }
}
