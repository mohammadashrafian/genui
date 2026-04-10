import { ComponentRenderRegistry } from '@genuikit/core/client';
import { demoComponentCatalog, demoComponentNames } from './components.js';

function createRenderRegistry() {
  const registry = new ComponentRenderRegistry();

  for (const definition of demoComponentCatalog) {
    registry.register(definition.name, definition.component);
  }

  return registry;
}

export const demoRenderRegistry = createRenderRegistry();
export { demoComponentNames };
