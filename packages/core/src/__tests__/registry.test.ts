import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ComponentRegistry,
  ComponentNotFoundError,
  DuplicateRegistrationError,
} from '../index.js';

// Stub components for testing
const StubButton = (props: { label: string }) => props;
const StubCard = (props: { title: string; body: string }) => props;
const StubAlert = (props: { message: string; severity: string }) => props;

const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary']).optional(),
  disabled: z.boolean().default(false),
});

const cardSchema = z.object({
  title: z.string(),
  body: z.string(),
  footer: z.string().optional(),
});

const alertSchema = z.object({
  message: z.string(),
  severity: z.enum(['info', 'warning', 'error']),
});

describe('ComponentRegistry', () => {
  describe('register', () => {
    it('should register a component with a schema', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      expect(registry.has('Button')).toBe(true);
      expect(registry.size).toBe(1);
    });

    it('should support chained registration', () => {
      const registry = new ComponentRegistry();
      registry
        .register('Button', buttonSchema, StubButton)
        .register('Card', cardSchema, StubCard)
        .register('Alert', alertSchema, StubAlert);

      expect(registry.size).toBe(3);
      expect(registry.names()).toEqual(['Button', 'Card', 'Alert']);
    });

    it('should throw on duplicate registration', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      expect(() => registry.register('Button', buttonSchema, StubButton)).toThrow(
        DuplicateRegistrationError,
      );
    });

    it('should allow overwrite when option is set', () => {
      const registry = new ComponentRegistry({ allowOverwrite: true });
      const NewButton = (props: { label: string }) => props;

      registry.register('Button', buttonSchema, StubButton);
      registry.register('Button', buttonSchema, NewButton);

      const entry = registry.get('Button');
      expect(entry?.component).toBe(NewButton);
    });
  });

  describe('unregister', () => {
    it('should remove a registered component', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      expect(registry.unregister('Button')).toBe(true);
      expect(registry.has('Button')).toBe(false);
      expect(registry.size).toBe(0);
    });

    it('should return false for non-existent component', () => {
      const registry = new ComponentRegistry();
      expect(registry.unregister('Missing')).toBe(false);
    });
  });

  describe('resolve', () => {
    it('should resolve valid LLM output to component + props', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.resolve({
        type: 'Button',
        props: { label: 'Click me', variant: 'primary' },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.name).toBe('Button');
        expect(result.component).toBe(StubButton);
        expect(result.props).toEqual({ label: 'Click me', variant: 'primary', disabled: false });
      }
    });

    it('should apply default values from schema', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.resolve({
        type: 'Button',
        props: { label: 'Test' },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.props).toEqual({ label: 'Test', disabled: false });
      }
    });

    it('should return errors for invalid props', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.resolve({
        type: 'Button',
        props: { label: 123, variant: 'invalid' },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.correctionPrompt).toContain('Button');
        expect(result.correctionPrompt).toContain('failed validation');
      }
    });

    it('should return errors for missing required props', () => {
      const registry = new ComponentRegistry();
      registry.register('Alert', alertSchema, StubAlert);

      const result = registry.resolve({
        type: 'Alert',
        props: { message: 'hello' },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.path.includes('severity'))).toBe(true);
      }
    });

    it('should throw for unregistered component', () => {
      const registry = new ComponentRegistry();
      expect(() =>
        registry.resolve({ type: 'Unknown', props: {} }),
      ).toThrow(ComponentNotFoundError);
    });

    it('should strip extra properties via Zod', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.resolve({
        type: 'Button',
        props: { label: 'Test', extraProp: 'should be stripped' },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect('extraProp' in result.props).toBe(false);
      }
    });
  });

  describe('tryResolve', () => {
    it('should return null for unregistered component', () => {
      const registry = new ComponentRegistry();
      const result = registry.tryResolve({ type: 'Unknown', props: {} });
      expect(result).toBeNull();
    });

    it('should return resolve result for registered component', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.tryResolve({ type: 'Button', props: { label: 'Test' } });
      expect(result).not.toBeNull();
      expect(result?.ok).toBe(true);
    });
  });

  describe('validateOutput', () => {
    it('should return a trusted output payload with parsed props', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.validateOutput({
        type: 'Button',
        props: { label: 'Click me' },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.output).toEqual({
          type: 'Button',
          props: { label: 'Click me', disabled: false },
        });
      }
    });

    it('should return validation errors for invalid props', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const result = registry.validateOutput({
        type: 'Button',
        props: { label: 123 },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.correctionPrompt).toContain('Button');
      }
    });
  });

  describe('createRenderRegistry', () => {
    it('should create a lightweight registry that renders validated output', () => {
      const registry = new ComponentRegistry();
      registry.register('Button', buttonSchema, StubButton);

      const validated = registry.validateOutput({
        type: 'Button',
        props: { label: 'Server validated' },
      });

      expect(validated.ok).toBe(true);
      if (!validated.ok) {
        return;
      }

      const renderRegistry = registry.createRenderRegistry();
      const rendered = renderRegistry.tryResolve(validated.output);

      expect(rendered?.ok).toBe(true);
      expect(rendered?.props).toEqual({ label: 'Server validated', disabled: false });
      expect(rendered?.component).toBe(StubButton);
    });
  });

  describe('toToolDefinition', () => {
    it('should generate tool definitions for all registered components', () => {
      const registry = new ComponentRegistry();
      registry
        .register('Button', buttonSchema, StubButton)
        .register('Card', cardSchema, StubCard);

      const tools = registry.toToolDefinition();

      expect(tools).toHaveLength(2);
      expect(tools[0]?.name).toBe('Button');
      expect(tools[0]?.schema).toHaveProperty('type', 'object');
      expect(tools[0]?.schema).toHaveProperty('properties');
      expect(tools[1]?.name).toBe('Card');
    });

    it('should describe nested types correctly', () => {
      const registry = new ComponentRegistry();
      const listSchema = z.object({
        items: z.array(z.string()),
        ordered: z.boolean().optional(),
      });
      registry.register('List', listSchema, (p: { items: string[] }) => p);

      const tools = registry.toToolDefinition();
      const schema = tools[0]?.schema as Record<string, unknown>;
      const props = schema.properties as Record<string, Record<string, unknown>>;

      expect(props.items).toEqual({ type: 'array', items: { type: 'string' } });
    });
  });
});
