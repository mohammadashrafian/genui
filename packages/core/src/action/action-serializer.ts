import type { Action, ToolCallResult } from './types.js';

/**
 * ActionSerializer converts validated user actions into structured tool call
 * results that can be sent back to the LLM in its next turn.
 *
 * The output format is designed to be directly usable as a tool_result in
 * both OpenAI and Anthropic APIs.
 *
 * @example
 * ```ts
 * const serializer = new ActionSerializer();
 *
 * const result = serializer.serialize(action);
 * // → { tool: "ContactForm.onSubmit", result: { name: "John", ... }, timestamp: "..." }
 *
 * // Send to LLM as tool result:
 * // messages.push({ role: "tool", content: JSON.stringify(result.result), tool_call_id: "..." })
 * ```
 */
export class ActionSerializer {
  private readonly prefix: string;

  constructor(options: { prefix?: string } = {}) {
    this.prefix = options.prefix ?? '';
  }

  /** Serialize a single action to a tool call result. */
  serialize(action: Action): ToolCallResult {
    const toolName = this.prefix
      ? `${this.prefix}.${action.component}.${action.action}`
      : `${action.component}.${action.action}`;

    return {
      tool: toolName,
      result: {
        component: action.component,
        action: action.action,
        payload: action.payload as Record<string, unknown>,
        actionId: action.id,
      },
      timestamp: new Date(action.timestamp).toISOString(),
    };
  }

  /** Serialize multiple actions into a batch result. */
  serializeBatch(actions: Action[]): ToolCallResult[] {
    return actions.map((a) => this.serialize(a));
  }

  /**
   * Format an action as a human-readable string for LLM context.
   * Useful for appending to conversation history.
   */
  toPrompt(action: Action): string {
    const payload = JSON.stringify(action.payload, null, 2);
    return [
      `User interacted with "${action.component}" component:`,
      `  Action: ${action.action}`,
      `  Payload:`,
      payload.split('\n').map((l) => `    ${l}`).join('\n'),
      `  Timestamp: ${new Date(action.timestamp).toISOString()}`,
    ].join('\n');
  }

  /**
   * Format multiple actions as a conversation-ready prompt.
   */
  toBatchPrompt(actions: Action[]): string {
    if (actions.length === 0) return 'No user interactions.';
    if (actions.length === 1) return this.toPrompt(actions[0]!);

    return [
      `User performed ${actions.length} interactions:`,
      '',
      ...actions.map((a, i) => `${i + 1}. ${this.toPrompt(a)}`),
    ].join('\n');
  }
}
