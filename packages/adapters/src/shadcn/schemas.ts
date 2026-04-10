/**
 * shadcn/ui component schemas.
 *
 * Pre-built Zod schemas matching shadcn/ui component prop APIs.
 * All string values are security-hardened (XSS-safe, length-limited).
 * All attributes are stripped from HTML, all URLs are validated.
 */

import { z } from 'zod';
import { safeString, safeUrl } from '@genuikit/core/security';
import { childrenSchema, classNameSchema, ariaLabelSchema } from '../shared/base-schemas.js';

export const buttonSchema = z.object({
  children: childrenSchema,
  variant: z
    .enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'])
    .default('default'),
  size: z.enum(['default', 'sm', 'lg', 'icon']).default('default'),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const cardSchema = z.object({
  title: safeString({ maxLength: 500 }).optional(),
  description: safeString({ maxLength: 2000 }).optional(),
  content: safeString({ maxLength: 50_000 }),
  footer: safeString({ maxLength: 1000 }).optional(),
  className: classNameSchema.optional(),
});

export const alertSchema = z.object({
  title: safeString({ maxLength: 500 }).optional(),
  description: safeString({ maxLength: 5000 }),
  variant: z.enum(['default', 'destructive']).default('default'),
  className: classNameSchema.optional(),
});

export const badgeSchema = z.object({
  children: childrenSchema,
  variant: z.enum(['default', 'secondary', 'destructive', 'outline']).default('default'),
  className: classNameSchema.optional(),
});

export const inputSchema = z.object({
  type: z.enum(['text', 'email', 'password', 'number', 'search', 'tel', 'url']).default('text'),
  placeholder: safeString({ maxLength: 256 }).optional(),
  defaultValue: safeString({ maxLength: 10_000 }).optional(),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const selectSchema = z.object({
  placeholder: safeString({ maxLength: 256 }).optional(),
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
  tabs: z
    .array(
      z.object({
        value: safeString({ maxLength: 256 }),
        label: safeString({ maxLength: 500 }),
        content: safeString({ maxLength: 50_000 }),
        disabled: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(50),
  className: classNameSchema.optional(),
});

export const tableSchema = z.object({
  caption: safeString({ maxLength: 500 }).optional(),
  headers: z.array(safeString({ maxLength: 500 })).max(100),
  rows: z.array(z.array(safeString({ maxLength: 5000 }))).max(10_000),
  className: classNameSchema.optional(),
});

export const avatarSchema = z.object({
  src: safeUrl().optional(),
  alt: safeString({ maxLength: 256 }),
  fallback: safeString({ maxLength: 10 }).optional(),
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
