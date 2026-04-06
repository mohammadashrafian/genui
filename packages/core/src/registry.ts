import type { z } from 'zod';
import type {
  ComponentType,
  LLMComponentOutput,
  RegistryEntry,
  RegistryOptions,
  ResolveResult,
  ValidationError,
} from './types.js';
import { ComponentNotFoundError, DuplicateRegistrationError } from './errors.js';
import { generateCorrectionPrompt } from './correction.js';

/**
 * ComponentRegistry is the central piece of GenUI. It maps component names
 * to Zod schemas and React components, enabling safe rendering of LLM output.
 *
 * @example
 * ```ts
 * const registry = new ComponentRegistry();
 *
 * registry.register('Button', buttonSchema, ButtonComponent);
 *
 * const result = registry.resolve({ type: 'Button', props: { label: 'Click me' } });
 * if (result.ok) {
 *   // result.component and result.props are fully typed
 * }
 * ```
 */
export class ComponentRegistry {
  private readonly entries = new Map<string, RegistryEntry>();
  private readonly options: Required<RegistryOptions>;

  constructor(options: RegistryOptions = {}) {
    this.options = {
      allowOverwrite: options.allowOverwrite ?? false,
    };
  }

  /**
   * Registers a component with its Zod schema. The schema defines the props
   * the LLM must produce. TypeScript infers the prop types from the schema.
   */
  register<S extends z.ZodType>(
    name: string,
    schema: S,
    component: ComponentType<z.infer<S>>,
  ): this {
    if (!this.options.allowOverwrite && this.entries.has(name)) {
      throw new DuplicateRegistrationError(name);
    }

    this.entries.set(name, { name, schema, component });
    return this;
  }

  /**
   * Unregisters a component by name. Returns true if the component was found
   * and removed, false if it was not registered.
   */
  unregister(name: string): boolean {
    return this.entries.delete(name);
  }

  /**
   * Resolves LLM output to a validated component + props, or returns a
   * structured error with a correction prompt for the LLM.
   */
  resolve(output: LLMComponentOutput): ResolveResult {
    const entry = this.entries.get(output.type);

    if (!entry) {
      throw new ComponentNotFoundError(output.type);
    }

    const parseResult = entry.schema.safeParse(output.props);

    if (parseResult.success) {
      return {
        ok: true,
        name: entry.name,
        component: entry.component,
        props: parseResult.data,
      };
    }

    const errors: ValidationError[] = parseResult.error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      expected: 'expected' in issue ? String(issue.expected) : undefined,
      received: 'received' in issue ? String(issue.received) : undefined,
    }));

    return {
      ok: false,
      name: entry.name,
      errors,
      correctionPrompt: generateCorrectionPrompt(entry.name, errors, entry.schema),
    };
  }

  /**
   * Resolves LLM output, returning only the successful result or null.
   * Useful when you want to silently skip invalid output.
   */
  tryResolve(output: LLMComponentOutput): ResolveResult | null {
    if (!this.entries.has(output.type)) {
      return null;
    }
    return this.resolve(output);
  }

  /** Checks if a component name is registered. */
  has(name: string): boolean {
    return this.entries.has(name);
  }

  /** Returns the entry for a given component name, or undefined. */
  get(name: string): RegistryEntry | undefined {
    return this.entries.get(name);
  }

  /** Returns all registered component names. */
  names(): string[] {
    return Array.from(this.entries.keys());
  }

  /** Returns the number of registered components. */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Generates a tool definition object describing all registered components.
   * This can be sent to the LLM as part of the system prompt or tool definitions
   * so it knows which components are available and what props they expect.
   */
  toToolDefinition(): ComponentToolDefinition[] {
    return Array.from(this.entries.values()).map((entry) => ({
      name: entry.name,
      schema: describeZodSchema(entry.schema),
    }));
  }
}

export interface ComponentToolDefinition {
  name: string;
  schema: Record<string, unknown>;
}

/**
 * Converts a Zod schema to a JSON Schema-like description for LLM consumption.
 * This is a simplified conversion focused on what LLMs need to produce valid output.
 */
function describeZodSchema(schema: z.ZodType): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = schema._def as any;

  if (def.typeName === 'ZodObject') {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodType;
      properties[key] = describeZodSchema(fieldSchema);
      if (!fieldSchema.isOptional()) {
        required.push(key);
      }
    }

    return { type: 'object', properties, required };
  }

  if (def.typeName === 'ZodArray') {
    return { type: 'array', items: describeZodSchema(def.type as z.ZodType) };
  }

  if (def.typeName === 'ZodOptional') {
    return describeZodSchema(def.innerType as z.ZodType);
  }

  if (def.typeName === 'ZodDefault') {
    return { ...describeZodSchema(def.innerType as z.ZodType), default: def.defaultValue() };
  }

  if (def.typeName === 'ZodEnum') {
    return { type: 'string', enum: def.values };
  }

  if (def.typeName === 'ZodLiteral') {
    return { type: typeof def.value, const: def.value };
  }

  if (def.typeName === 'ZodUnion') {
    return { oneOf: (def.options as z.ZodType[]).map(describeZodSchema) };
  }

  const typeMap: Record<string, string> = {
    ZodString: 'string',
    ZodNumber: 'number',
    ZodBoolean: 'boolean',
    ZodNull: 'null',
  };

  return { type: typeMap[def.typeName] ?? 'unknown' };
}
