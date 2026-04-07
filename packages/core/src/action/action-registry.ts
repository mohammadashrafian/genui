import type { z } from 'zod';
import type { ComponentType, RegistryOptions, ValidationError } from '../types.js';
import type { ActionSchemaMap, Action } from './types.js';
import { ComponentNotFoundError } from '../errors.js';
import { generateCorrectionPrompt } from '../correction.js';
import { ComponentRegistry } from '../registry.js';

/** Extended registry entry that includes action schemas. */
export interface ActionRegistryEntry<
  S extends z.ZodType = z.ZodType,
  A extends ActionSchemaMap = ActionSchemaMap,
> {
  readonly name: string;
  readonly schema: S;
  readonly component: ComponentType<z.infer<S>>;
  readonly actions: A;
}

/** Result of validating an action payload. */
export interface ActionValidationResult {
  readonly ok: boolean;
  readonly action?: Action;
  readonly errors?: ValidationError[];
  readonly correctionPrompt?: string;
}

/**
 * ActionRegistry extends ComponentRegistry with action schema support.
 *
 * Components can declare what interactions they emit (onClick, onSubmit, etc.)
 * with Zod schemas. When a user interacts, the payload is validated before
 * being sent back to the AI.
 *
 * @example
 * ```ts
 * const registry = new ActionRegistry();
 *
 * registry.register('ContactForm', propSchema, actionSchemas, ContactForm);
 * // actionSchemas = { onSubmit: z.object({ name: z.string(), email: z.string() }) }
 *
 * const result = registry.validateAction('ContactForm', 'onSubmit', { name: 'John', email: 'j@x.com' });
 * ```
 */
export class ActionRegistry extends ComponentRegistry {
  private readonly actionEntries = new Map<string, ActionRegistryEntry>();

  constructor(options: RegistryOptions = {}) {
    super(options);
  }

  /**
   * Register a component with prop schema, action schemas, and the component itself.
   * Overloads the base register() to also accept action schemas.
   */
  registerWithActions<S extends z.ZodType, A extends ActionSchemaMap>(
    name: string,
    propSchema: S,
    actionSchemas: A,
    component: ComponentType<z.infer<S>>,
  ): this {
    // Register in base ComponentRegistry for resolve/tryResolve
    super.register(name, propSchema, component);

    // Store action schemas
    this.actionEntries.set(name, {
      name,
      schema: propSchema,
      component,
      actions: actionSchemas,
    });

    return this;
  }

  /**
   * Validate an action payload against the registered action schema.
   * Returns a validated Action or structured errors.
   */
  validateAction(
    componentName: string,
    actionName: string,
    payload: unknown,
  ): ActionValidationResult {
    const entry = this.actionEntries.get(componentName);
    if (!entry) {
      throw new ComponentNotFoundError(componentName);
    }

    const actionSchema = entry.actions[actionName];
    if (!actionSchema) {
      throw new ActionNotFoundError(componentName, actionName);
    }

    const result = actionSchema.safeParse(payload);

    if (result.success) {
      const action: Action = {
        component: componentName,
        action: actionName,
        payload: result.data,
        timestamp: Date.now(),
        id: generateActionId(),
      };
      return { ok: true, action };
    }

    const errors: ValidationError[] = result.error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      expected: 'expected' in issue ? String(issue.expected) : undefined,
      received: 'received' in issue ? String(issue.received) : undefined,
    }));

    return {
      ok: false,
      errors,
      correctionPrompt: generateCorrectionPrompt(
        `${componentName}.${actionName}`,
        errors,
        actionSchema,
      ),
    };
  }

  /** Get action schemas for a component. */
  getActions(name: string): ActionSchemaMap | undefined {
    return this.actionEntries.get(name)?.actions;
  }

  /** Get a specific action schema. */
  getActionSchema(componentName: string, actionName: string): z.ZodType | undefined {
    return this.actionEntries.get(componentName)?.actions[actionName];
  }

  /** List all action names for a component. */
  actionNames(componentName: string): string[] {
    const entry = this.actionEntries.get(componentName);
    return entry ? Object.keys(entry.actions) : [];
  }

  /** Check if a component has a specific action. */
  hasAction(componentName: string, actionName: string): boolean {
    return !!this.actionEntries.get(componentName)?.actions[actionName];
  }

  /** Unregister a component and its actions. */
  override unregister(name: string): boolean {
    this.actionEntries.delete(name);
    return super.unregister(name);
  }
}

/** Thrown when an action is not registered for a component. */
export class ActionNotFoundError extends Error {
  constructor(componentName: string, actionName: string) {
    super(
      `Action "${actionName}" is not registered for component "${componentName}".`,
    );
    this.name = 'ActionNotFoundError';
  }
}

/** Counter-based ID generation for actions. Fast, unique within session. */
let actionCounter = 0;
function generateActionId(): string {
  return `act_${Date.now().toString(36)}_${(actionCounter++).toString(36)}`;
}
