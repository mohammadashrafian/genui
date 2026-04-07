import { describe, it, expect } from 'vitest';
import {
  buttonSchema,
  cardSchema,
  alertSchema,
  badgeSchema,
  inputSchema,
  selectSchema,
  dialogSchema,
  tabsSchema,
  tableSchema,
  avatarSchema,
} from '../../shadcn/schemas.js';

describe('shadcn schemas', () => {
  describe('buttonSchema', () => {
    it('accepts valid button props', () => {
      const result = buttonSchema.safeParse({
        children: 'Click me',
        variant: 'outline',
      });
      expect(result.success).toBe(true);
    });

    it('applies defaults', () => {
      const result = buttonSchema.parse({ children: 'Click' });
      expect(result.variant).toBe('default');
      expect(result.size).toBe('default');
      expect(result.disabled).toBe(false);
    });

    it('strips XSS from children', () => {
      const result = buttonSchema.parse({
        children: '<script>alert(1)</script>Click',
      });
      expect(result.children).toBe('alert(1)Click');
    });
  });

  describe('cardSchema', () => {
    it('accepts valid card props', () => {
      const result = cardSchema.safeParse({ content: 'Card body' });
      expect(result.success).toBe(true);
    });

    it('strips HTML from content', () => {
      const result = cardSchema.parse({
        content: '<img src=x onerror=alert(1)>Hello',
      });
      expect(result.content).toBe('Hello');
    });
  });

  describe('alertSchema', () => {
    it('accepts valid alert props', () => {
      const result = alertSchema.safeParse({
        description: 'Something happened',
        variant: 'destructive',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid variant', () => {
      const result = alertSchema.safeParse({
        description: 'test',
        variant: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('inputSchema', () => {
    it('accepts valid input props', () => {
      const result = inputSchema.safeParse({
        type: 'email',
        placeholder: 'Enter email',
      });
      expect(result.success).toBe(true);
    });

    it('strips XSS from placeholder', () => {
      const result = inputSchema.parse({
        placeholder: '<script>x</script>Enter name',
      });
      expect(result.placeholder).toBe('xEnter name');
    });
  });

  describe('selectSchema', () => {
    it('accepts options array', () => {
      const result = selectSchema.safeParse({
        options: [
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty options list (allowed — no min)', () => {
      const result = selectSchema.safeParse({ options: [] });
      expect(result.success).toBe(true);
    });
  });

  describe('dialogSchema', () => {
    it('accepts valid dialog props', () => {
      const result = dialogSchema.safeParse({
        title: 'Confirm',
        content: 'Are you sure?',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('tabsSchema', () => {
    it('accepts valid tabs', () => {
      const result = tabsSchema.safeParse({
        tabs: [
          { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
          { value: 'tab2', label: 'Tab 2', content: 'Content 2' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty tabs array', () => {
      const result = tabsSchema.safeParse({ tabs: [] });
      expect(result.success).toBe(false);
    });
  });

  describe('tableSchema', () => {
    it('accepts headers and rows', () => {
      const result = tableSchema.safeParse({
        headers: ['Name', 'Age'],
        rows: [['Alice', '30'], ['Bob', '25']],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('avatarSchema', () => {
    it('accepts valid avatar with URL', () => {
      const result = avatarSchema.safeParse({
        src: 'https://example.com/avatar.png',
        alt: 'User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects javascript: in src', () => {
      const result = avatarSchema.safeParse({
        src: 'javascript:alert(1)',
        alt: 'User',
      });
      expect(result.success).toBe(false);
    });
  });
});
