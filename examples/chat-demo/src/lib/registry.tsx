import { ComponentRegistry } from '@genuikit/core';
import { demoComponentCatalog, demoComponentNames } from './components.js';
import { demoComponentSchemas } from './schemas.js';

function createRegistry() {
  const registry = new ComponentRegistry();

  for (const definition of demoComponentCatalog) {
    registry.register(
      definition.name,
      demoComponentSchemas[definition.name],
      definition.component,
    );
  }

  return registry;
}

export const demoRegistry = createRegistry();

const schemaMap = new Map(
  demoRegistry.toToolDefinition().map((definition) => [definition.name, definition.schema]),
);

export const demoToolDefinitions = demoComponentCatalog.map((definition) => ({
  name: definition.name,
  description: definition.description,
  schema: schemaMap.get(definition.name) ?? {},
}));

export { demoComponentNames };
