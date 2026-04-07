/**
 * Generic registry factory builder used by all adapters.
 *
 * Creates a type-safe factory function that:
 * 1. Accepts user-provided component implementations
 * 2. Registers them with pre-defined schemas and action schemas
 * 3. Returns a fully configured ActionRegistry
 *
 * The factory REQUIRES all components — partial registration is not
 * allowed to prevent silent runtime failures when the LLM outputs
 * a component the user forgot to provide.
 */

import { ActionRegistry } from '@genui/core';
import type { ComponentType } from '@genui/core';
import type { ComponentDefinition, AdapterConfig } from '../types.js';

/**
 * Create a registry factory for an adapter.
 *
 * @param definitions - Map of component name → schema + action definitions
 * @returns A factory function that accepts component implementations and returns an ActionRegistry
 *
 * @example
 * ```ts
 * const createMyRegistry = createRegistryFactory({
 *   Button: { schema: buttonSchema, actions: buttonActions },
 *   Card: { schema: cardSchema },
 * });
 *
 * const registry = createMyRegistry({ Button: MyButton, Card: MyCard });
 * ```
 */
export function createRegistryFactory<
  TNames extends string,
  TDefinitions extends Record<TNames, ComponentDefinition>,
>(
  definitions: TDefinitions,
) {
  const definitionEntries = Object.entries(definitions) as [TNames, ComponentDefinition][];

  return function createRegistry(
    components: { [K in TNames]: ComponentType<unknown> },
    config?: AdapterConfig,
  ): ActionRegistry {
    // Validate all components are provided
    for (const [name] of definitionEntries) {
      if (!(name in components) || !components[name]) {
        throw new MissingComponentError(name);
      }
    }

    const registry = new ActionRegistry({
      allowOverwrite: config?.allowOverwrite ?? false,
    });

    for (const [name, definition] of definitionEntries) {
      const component = components[name];

      if (definition.actions && Object.keys(definition.actions).length > 0) {
        registry.registerWithActions(name, definition.schema, definition.actions, component);
      } else {
        registry.register(name, definition.schema, component);
      }
    }

    return registry;
  };
}

/** Thrown when a required component implementation is missing. */
export class MissingComponentError extends Error {
  constructor(componentName: string) {
    super(
      `Missing component implementation for "${componentName}". ` +
      `All adapter components must be provided.`,
    );
    this.name = 'MissingComponentError';
  }
}
