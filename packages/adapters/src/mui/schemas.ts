/**
 * Material UI component schemas.
 *
 * Pre-built Zod schemas matching MUI component prop APIs.
 * Uses MUI naming conventions: variant, color, size, sx.
 */

import { z } from 'zod';
import { safeString, safeUrl } from '@genuikit/core';
import { childrenSchema, classNameSchema, ariaLabelSchema } from '../shared/base-schemas.js';

export const buttonSchema = z.object({
  children: childrenSchema,
  variant: z.enum(['text', 'contained', 'outlined']).default('contained'),
  color: z
    .enum(['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit'])
    .default('primary'),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  disabled: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const cardSchema = z.object({
  title: safeString({ maxLength: 500 }).optional(),
  subheader: safeString({ maxLength: 500 }).optional(),
  content: safeString({ maxLength: 50_000 }),
  mediaUrl: safeUrl().optional(),
  mediaAlt: safeString({ maxLength: 256 }).optional(),
  actions: z
    .array(safeString({ maxLength: 200 }))
    .max(10)
    .optional(),
  elevation: z.number().int().min(0).max(24).default(1),
  className: classNameSchema.optional(),
});

export const alertSchema = z.object({
  children: childrenSchema,
  severity: z.enum(['error', 'warning', 'info', 'success']).default('info'),
  variant: z.enum(['standard', 'filled', 'outlined']).default('standard'),
  title: safeString({ maxLength: 500 }).optional(),
  closable: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const chipSchema = z.object({
  label: safeString({ maxLength: 500 }),
  variant: z.enum(['filled', 'outlined']).default('filled'),
  color: z
    .enum(['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'])
    .default('default'),
  size: z.enum(['small', 'medium']).default('medium'),
  clickable: z.boolean().default(false),
  deletable: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const textFieldSchema = z.object({
  label: safeString({ maxLength: 256 }).optional(),
  variant: z.enum(['outlined', 'filled', 'standard']).default('outlined'),
  type: z.enum(['text', 'email', 'password', 'number', 'search', 'tel', 'url']).default('text'),
  placeholder: safeString({ maxLength: 256 }).optional(),
  defaultValue: safeString({ maxLength: 10_000 }).optional(),
  helperText: safeString({ maxLength: 500 }).optional(),
  error: z.boolean().default(false),
  disabled: z.boolean().default(false),
  required: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  multiline: z.boolean().default(false),
  rows: z.number().int().min(1).max(50).optional(),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const selectSchema = z.object({
  label: safeString({ maxLength: 256 }).optional(),
  variant: z.enum(['outlined', 'filled', 'standard']).default('outlined'),
  defaultValue: safeString({ maxLength: 256 }).optional(),
  options: z
    .array(
      z.object({
        value: safeString({ maxLength: 256 }),
        label: safeString({ maxLength: 500 }),
        disabled: z.boolean().optional(),
      }),
    )
    .max(1000),
  disabled: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const dialogSchema = z.object({
  title: safeString({ maxLength: 500 }),
  content: safeString({ maxLength: 50_000 }),
  open: z.boolean().default(false),
  maxWidth: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('sm'),
  fullWidth: z.boolean().default(true),
  className: classNameSchema.optional(),
});

export const tabsSchema = z.object({
  value: safeString({ maxLength: 256 }).optional(),
  tabs: z
    .array(
      z.object({
        value: safeString({ maxLength: 256 }),
        label: safeString({ maxLength: 500 }),
        content: safeString({ maxLength: 50_000 }),
        disabled: z.boolean().optional(),
        icon: safeString({ maxLength: 64 }).optional(),
      }),
    )
    .min(1)
    .max(50),
  variant: z.enum(['standard', 'scrollable', 'fullWidth']).default('standard'),
  centered: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const tableSchema = z.object({
  caption: safeString({ maxLength: 500 }).optional(),
  headers: z.array(safeString({ maxLength: 500 })).max(100),
  rows: z.array(z.array(safeString({ maxLength: 5000 }))).max(10_000),
  size: z.enum(['small', 'medium']).default('medium'),
  stickyHeader: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const avatarSchema = z.object({
  src: safeUrl().optional(),
  alt: safeString({ maxLength: 256 }),
  children: safeString({ maxLength: 10 }).optional(),
  variant: z.enum(['circular', 'rounded', 'square']).default('circular'),
  className: classNameSchema.optional(),
});

export {
  accordionSchema,
  breadcrumbsSchema,
  paginationSchema,
  progressBarSchema,
  skeletonSchema,
  tooltipSchema,
  textareaSchema,
  checkboxSchema,
  radioGroupSchema,
  switchSchema,
  sliderSchema,
  formSchema,
  stepperSchema,
  statCardSchema,
  timelineSchema,
  barChartSchema,
  lineChartSchema,
  pieChartSchema,
  areaChartSchema,
  mapSchema,
} from '../shared/component-schemas.js';
