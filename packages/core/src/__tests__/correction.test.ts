import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { generateCorrectionPrompt } from '../correction.js';
import type { ValidationError } from '../types.js';

describe('generateCorrectionPrompt', () => {
  it('should include the component name', () => {
    const errors: ValidationError[] = [
      { path: ['label'], message: 'Expected string, received number' },
    ];
    const schema = z.object({ label: z.string() });
    const prompt = generateCorrectionPrompt('Button', errors, schema);

    expect(prompt).toContain('"Button"');
    expect(prompt).toContain('failed validation');
  });

  it('should list all field errors with paths', () => {
    const errors: ValidationError[] = [
      { path: ['label'], message: 'Required', expected: 'string', received: 'undefined' },
      { path: ['count'], message: 'Expected number', expected: 'number', received: 'string' },
    ];
    const schema = z.object({ label: z.string(), count: z.number() });
    const prompt = generateCorrectionPrompt('Widget', errors, schema);

    expect(prompt).toContain('"label"');
    expect(prompt).toContain('"count"');
    expect(prompt).toContain('expected: string');
    expect(prompt).toContain('received: string');
  });

  it('should describe the expected schema', () => {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
      active: z.boolean().optional(),
    });
    const prompt = generateCorrectionPrompt('Card', [], schema);

    expect(prompt).toContain('title');
    expect(prompt).toContain('string');
    expect(prompt).toContain('count');
    expect(prompt).toContain('number');
  });

  it('should handle nested paths', () => {
    const errors: ValidationError[] = [
      { path: ['data', 0, 'value'], message: 'Required' },
    ];
    const schema = z.object({ data: z.array(z.object({ value: z.string() })) });
    const prompt = generateCorrectionPrompt('Chart', errors, schema);

    expect(prompt).toContain('"data.0.value"');
  });

  it('should handle enum types in schema description', () => {
    const schema = z.object({
      severity: z.enum(['info', 'warning', 'error']),
    });
    const prompt = generateCorrectionPrompt('Alert', [], schema);

    expect(prompt).toContain('"info"');
    expect(prompt).toContain('"warning"');
    expect(prompt).toContain('"error"');
  });

  it('should end with a correction instruction', () => {
    const schema = z.object({ text: z.string() });
    const prompt = generateCorrectionPrompt('Label', [], schema);

    expect(prompt).toContain('Please provide corrected props');
    expect(prompt).toContain('"Label"');
  });
});
