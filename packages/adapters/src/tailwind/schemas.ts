/**
 * Tailwind CSS headless component schemas.
 *
 * These schemas are library-agnostic — designed for any Tailwind-based
 * component (Headless UI, Radix, custom). Uses generic variant names
 * and relies on className for all visual styling.
 */

import { z } from 'zod';
import { safeString, safeUrl } from '@genuikit/core';
import { childrenSchema, classNameSchema, ariaLabelSchema } from '../shared/base-schemas.js';

export const buttonSchema = z.object({
  children: childrenSchema,
  variant: z.enum(['primary', 'secondary', 'danger', 'ghost', 'link']).default('primary'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const cardSchema = z.object({
  title: safeString({ maxLength: 500 }).optional(),
  subtitle: safeString({ maxLength: 500 }).optional(),
  body: safeString({ maxLength: 50_000 }),
  footer: safeString({ maxLength: 1000 }).optional(),
  className: classNameSchema.optional(),
});

export const alertSchema = z.object({
  title: safeString({ maxLength: 500 }).optional(),
  message: safeString({ maxLength: 5000 }),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  dismissible: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const badgeSchema = z.object({
  children: childrenSchema,
  color: z.enum(['gray', 'red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink']).default('gray'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  className: classNameSchema.optional(),
});

export const inputSchema = z.object({
  type: z.enum(['text', 'email', 'password', 'number', 'search', 'tel', 'url']).default('text'),
  label: safeString({ maxLength: 256 }).optional(),
  placeholder: safeString({ maxLength: 256 }).optional(),
  defaultValue: safeString({ maxLength: 10_000 }).optional(),
  helperText: safeString({ maxLength: 500 }).optional(),
  error: safeString({ maxLength: 500 }).optional(),
  disabled: z.boolean().default(false),
  required: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const selectSchema = z.object({
  label: safeString({ maxLength: 256 }).optional(),
  placeholder: safeString({ maxLength: 256 }).optional(),
  defaultValue: safeString({ maxLength: 256 }).optional(),
  options: z.array(z.object({
    value: safeString({ maxLength: 256 }),
    label: safeString({ maxLength: 500 }),
    disabled: z.boolean().optional(),
  })).max(1000),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const dialogSchema = z.object({
  title: safeString({ maxLength: 500 }),
  description: safeString({ maxLength: 2000 }).optional(),
  content: safeString({ maxLength: 50_000 }),
  open: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const tabsSchema = z.object({
  defaultValue: safeString({ maxLength: 256 }).optional(),
  tabs: z.array(z.object({
    value: safeString({ maxLength: 256 }),
    label: safeString({ maxLength: 500 }),
    content: safeString({ maxLength: 50_000 }),
    disabled: z.boolean().optional(),
  })).min(1).max(50),
  className: classNameSchema.optional(),
});

export const tableSchema = z.object({
  caption: safeString({ maxLength: 500 }).optional(),
  headers: z.array(safeString({ maxLength: 500 })).max(100),
  rows: z.array(z.array(safeString({ maxLength: 5000 }))).max(10_000),
  striped: z.boolean().default(false),
  hoverable: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const avatarSchema = z.object({
  src: safeUrl().optional(),
  alt: safeString({ maxLength: 256 }),
  initials: safeString({ maxLength: 4 }).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  className: classNameSchema.optional(),
});
