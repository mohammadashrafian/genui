import type { z } from 'zod';
import type { ValidationError } from './types.js';

/**
 * Generates a structured correction prompt that can be sent back to the LLM
 * when schema validation fails. The prompt describes exactly what went wrong
 * and what the LLM should produce instead.
 */
export function generateCorrectionPrompt(
  componentName: string,
  errors: ValidationError[],
  schema: z.ZodType,
): string {
  const errorLines = errors.map((e) => {
    const path = e.path.length > 0 ? `  - "${e.path.join('.')}"` : '  - (root)';
    const details = [e.message];
    if (e.expected) details.push(`expected: ${e.expected}`);
    if (e.received) details.push(`received: ${e.received}`);
    return `${path}: ${details.join(', ')}`;
  });

  const schemaDescription = describeSchema(schema);

  return [
    `The props you provided for component "${componentName}" failed validation.`,
    '',
    'Errors:',
    ...errorLines,
    '',
    'Expected schema:',
    schemaDescription,
    '',
    `Please provide corrected props for "${componentName}" as a valid JSON object matching the schema above.`,
  ].join('\n');
}

/** Produces a human-readable description of a Zod schema for LLM consumption. */
function describeSchema(schema: z.ZodType, indent = '  '): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const def = schema._def as any;

  if (def.typeName === 'ZodObject') {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
    const lines: string[] = ['{'];
    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodType;
      const isOptional = fieldSchema.isOptional();
      const marker = isOptional ? '?' : '';
      const inner = describeSchema(fieldSchema, indent + '  ');
      lines.push(`${indent}${key}${marker}: ${inner}`);
    }
    lines.push(`${indent.slice(2)}}`);
    return lines.join('\n');
  }

  if (def.typeName === 'ZodArray') {
    const inner = describeSchema(def.type as z.ZodType);
    return `${inner}[]`;
  }

  if (def.typeName === 'ZodOptional') {
    return describeSchema(def.innerType as z.ZodType, indent);
  }

  if (def.typeName === 'ZodDefault') {
    return describeSchema(def.innerType as z.ZodType, indent);
  }

  if (def.typeName === 'ZodEnum') {
    const values = (def.values as string[]).map((v) => `"${v}"`).join(' | ');
    return values;
  }

  if (def.typeName === 'ZodLiteral') {
    return JSON.stringify(def.value);
  }

  if (def.typeName === 'ZodUnion') {
    const options = (def.options as z.ZodType[]).map((o) => describeSchema(o, indent));
    return options.join(' | ');
  }

  if (def.typeName === 'ZodRecord') {
    const valType = describeSchema(def.valueType as z.ZodType, indent);
    return `Record<string, ${valType}>`;
  }

  const typeMap: Record<string, string> = {
    ZodString: 'string',
    ZodNumber: 'number',
    ZodBoolean: 'boolean',
    ZodNull: 'null',
    ZodUndefined: 'undefined',
    ZodAny: 'any',
    ZodUnknown: 'unknown',
  };

  return typeMap[def.typeName] ?? 'unknown';
}
