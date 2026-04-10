import type {
  ComponentType,
  RegistryOptions,
  RenderRegistryEntry,
  RenderResolveResult,
  ValidatedComponentOutput,
} from './types.js';
import { ComponentNotFoundError, DuplicateRegistrationError } from './errors.js';

/**
 * Lightweight component registry for client-side rendering after server validation.
 *
 * Unlike ComponentRegistry, this registry stores only component implementations.
 * It does not know about Zod schemas and does not validate props at runtime.
 */
export class ComponentRenderRegistry {
  // The registry stores heterogeneous component prop types, so the internal
  // map needs a widened component signature.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly entries = new Map<string, RenderRegistryEntry<any>>();
  private readonly options: Required<RegistryOptions>;

  constructor(options: RegistryOptions = {}) {
    this.options = {
      allowOverwrite: options.allowOverwrite ?? false,
    };
  }

  /** Register a renderable component without its validation schema. */
  register<P>(name: string, component: ComponentType<P>): this {
    if (!this.options.allowOverwrite && this.entries.has(name)) {
      throw new DuplicateRegistrationError(name);
    }

    this.entries.set(name, { name, component });
    return this;
  }

  /** Remove a registered component. */
  unregister(name: string): boolean {
    return this.entries.delete(name);
  }

  /** Resolve previously validated output to its matching component implementation. */
  resolve<P = Record<string, unknown>>(
    output: ValidatedComponentOutput<P>,
  ): RenderResolveResult<P> {
    const entry = this.entries.get(output.type);

    if (!entry) {
      throw new ComponentNotFoundError(output.type);
    }

    return {
      ok: true,
      name: entry.name,
      component: entry.component as ComponentType<P>,
      props: output.props,
    };
  }

  /** Resolve trusted output, returning null when the component is not registered. */
  tryResolve<P = Record<string, unknown>>(
    output: ValidatedComponentOutput<P>,
  ): RenderResolveResult<P> | null {
    if (!this.entries.has(output.type)) {
      return null;
    }

    return this.resolve(output);
  }

  /** Check whether a component is registered. */
  has(name: string): boolean {
    return this.entries.has(name);
  }

  /** Read a registered component entry. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(name: string): RenderRegistryEntry<any> | undefined {
    return this.entries.get(name);
  }

  /** List all registered component names. */
  names(): string[] {
    return Array.from(this.entries.keys());
  }

  /** Return the number of registered components. */
  get size(): number {
    return this.entries.size;
  }
}
