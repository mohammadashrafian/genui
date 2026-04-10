/**
 * Shared component schemas reused by all official adapters.
 *
 * These components intentionally keep a common contract across shadcn/ui,
 * Tailwind CSS, and Material UI so users can swap implementations without
 * changing the LLM-facing schema surface.
 */

import { z } from 'zod';
import { safeString, safeUrl } from '@genuikit/core/security';
import { ariaLabelSchema, childrenSchema, classNameSchema } from './base-schemas.js';

const titleSchema = safeString({ maxLength: 500 });
const shortTextSchema = safeString({ maxLength: 256 });
const mediumTextSchema = safeString({ maxLength: 1000 });
const longTextSchema = safeString({ maxLength: 5000 });
const contentSchema = safeString({ maxLength: 50_000 });
const tokenSchema = safeString({ maxLength: 64 });
const numericValueSchema = z.number().finite();

const optionSchema = z.object({
  value: shortTextSchema,
  label: titleSchema,
  description: mediumTextSchema.optional(),
  disabled: z.boolean().optional(),
});

const accordionItemSchema = z.object({
  value: shortTextSchema,
  title: titleSchema,
  content: contentSchema,
  disabled: z.boolean().optional(),
});

const breadcrumbItemSchema = z.object({
  label: titleSchema,
  href: safeUrl().optional(),
  current: z.boolean().optional(),
});

const sliderMarkSchema = z.object({
  value: numericValueSchema,
  label: shortTextSchema.optional(),
});

const formFieldSchema = z
  .object({
    name: safeString({ maxLength: 128 }),
    label: shortTextSchema,
    type: z
      .enum(['text', 'email', 'password', 'number', 'textarea', 'select', 'radio'])
      .default('text'),
    placeholder: shortTextSchema.optional(),
    helperText: safeString({ maxLength: 500 }).optional(),
    defaultValue: safeString({ maxLength: 10_000 }).optional(),
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),
    options: z.array(optionSchema).max(100).optional(),
  })
  .superRefine((field, ctx) => {
    const needsOptions = field.type === 'select' || field.type === 'radio';
    if (needsOptions && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `Field type "${field.type}" requires at least one option`,
      });
    }

    if (!needsOptions && field.options && field.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `Field type "${field.type}" does not accept options`,
      });
    }
  });

const stepSchema = z.object({
  label: shortTextSchema,
  description: mediumTextSchema.optional(),
  optional: z.boolean().default(false),
  status: z.enum(['pending', 'active', 'complete', 'error']).default('pending'),
});

const timelineItemSchema = z.object({
  title: titleSchema,
  description: mediumTextSchema.optional(),
  timestamp: safeString({ maxLength: 128 }).optional(),
  status: z.enum(['completed', 'current', 'upcoming', 'warning']).default('upcoming'),
  icon: tokenSchema.optional(),
});

const chartSeriesSchema = z.object({
  id: tokenSchema,
  label: shortTextSchema,
  values: z.array(numericValueSchema).min(1).max(500),
  color: tokenSchema.optional(),
});

const chartCategorySchema = z.array(shortTextSchema).min(1).max(500);

const pieChartSegmentSchema = z.object({
  id: tokenSchema,
  label: shortTextSchema,
  value: z.number().nonnegative().finite(),
  color: tokenSchema.optional(),
});

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const mapMarkerSchema = z.object({
  id: safeString({ maxLength: 128 }),
  position: coordinateSchema,
  label: shortTextSchema.optional(),
  description: mediumTextSchema.optional(),
  href: safeUrl().optional(),
});

function createCartesianChartSchema(shape: z.ZodRawShape) {
  return z
    .object({
      title: titleSchema.optional(),
      description: longTextSchema.optional(),
      categories: chartCategorySchema,
      series: z.array(chartSeriesSchema).min(1).max(20),
      showLegend: z.boolean().default(true),
      className: classNameSchema.optional(),
      ...shape,
    })
    .superRefine((chart, ctx) => {
      chart.series.forEach((series, index) => {
        if (series.values.length !== chart.categories.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['series', index, 'values'],
            message: 'Each series must provide one value per category',
          });
        }
      });
    });
}

export const accordionSchema = z.object({
  items: z.array(accordionItemSchema).min(1).max(50),
  allowMultiple: z.boolean().default(false),
  collapsible: z.boolean().default(true),
  defaultValue: z.array(shortTextSchema).max(50).optional(),
  className: classNameSchema.optional(),
});

export const breadcrumbsSchema = z.object({
  items: z.array(breadcrumbItemSchema).min(1).max(20),
  separator: safeString({ maxLength: 10 }).default('/'),
  className: classNameSchema.optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageCount: z.number().int().min(1),
  siblingCount: z.number().int().min(0).max(3).default(1),
  boundaryCount: z.number().int().min(0).max(3).default(1),
  showFirstLast: z.boolean().default(false),
  showPreviousNext: z.boolean().default(true),
  className: classNameSchema.optional(),
});

export const progressBarSchema = z
  .object({
    value: z.number().min(0).max(100).optional(),
    label: shortTextSchema.optional(),
    variant: z.enum(['linear', 'circular']).default('linear'),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
    showValue: z.boolean().default(false),
    indeterminate: z.boolean().default(false),
    className: classNameSchema.optional(),
  })
  .superRefine((progress, ctx) => {
    if (!progress.indeterminate && progress.value === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'value is required when indeterminate is false',
      });
    }
  });

export const skeletonSchema = z.object({
  variant: z.enum(['text', 'rectangular', 'rounded', 'circular']).default('rectangular'),
  lines: z.number().int().min(1).max(20).default(1),
  width: z.number().int().min(1).max(2000).optional(),
  height: z.number().int().min(1).max(2000).optional(),
  animated: z.boolean().default(true),
  className: classNameSchema.optional(),
});

export const tooltipSchema = z.object({
  children: childrenSchema,
  content: mediumTextSchema,
  placement: z.enum(['top', 'right', 'bottom', 'left']).default('top'),
  open: z.boolean().optional(),
  arrow: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const textareaSchema = z.object({
  label: shortTextSchema.optional(),
  placeholder: shortTextSchema.optional(),
  defaultValue: safeString({ maxLength: 10_000 }).optional(),
  helperText: safeString({ maxLength: 500 }).optional(),
  error: safeString({ maxLength: 500 }).optional(),
  disabled: z.boolean().default(false),
  required: z.boolean().default(false),
  rows: z.number().int().min(2).max(30).default(4),
  resize: z.enum(['none', 'vertical', 'horizontal', 'both']).default('vertical'),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const checkboxSchema = z.object({
  label: shortTextSchema,
  description: mediumTextSchema.optional(),
  checked: z.boolean().default(false),
  disabled: z.boolean().default(false),
  indeterminate: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const radioGroupSchema = z.object({
  label: shortTextSchema.optional(),
  value: shortTextSchema.optional(),
  options: z.array(optionSchema).min(1).max(100),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
  disabled: z.boolean().default(false),
  helperText: safeString({ maxLength: 500 }).optional(),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const switchSchema = z.object({
  label: shortTextSchema,
  description: mediumTextSchema.optional(),
  checked: z.boolean().default(false),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
  'aria-label': ariaLabelSchema.optional(),
});

export const sliderSchema = z
  .object({
    label: shortTextSchema.optional(),
    min: numericValueSchema.default(0),
    max: numericValueSchema.default(100),
    step: z.number().positive().default(1),
    value: numericValueSchema.optional(),
    marks: z.array(sliderMarkSchema).max(20).optional(),
    disabled: z.boolean().default(false),
    showValue: z.boolean().default(true),
    className: classNameSchema.optional(),
    'aria-label': ariaLabelSchema.optional(),
  })
  .superRefine((slider, ctx) => {
    if (slider.max <= slider.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['max'],
        message: 'max must be greater than min',
      });
    }

    if (slider.value !== undefined && (slider.value < slider.min || slider.value > slider.max)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'value must be between min and max',
      });
    }

    slider.marks?.forEach((mark, index) => {
      if (mark.value < slider.min || mark.value > slider.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['marks', index, 'value'],
          message: 'mark value must be between min and max',
        });
      }
    });
  });

export const formSchema = z.object({
  title: titleSchema.optional(),
  description: longTextSchema.optional(),
  submitLabel: safeString({ maxLength: 120 }).default('Submit'),
  cancelLabel: safeString({ maxLength: 120 }).optional(),
  layout: z.enum(['vertical', 'horizontal', 'grid']).default('vertical'),
  fields: z.array(formFieldSchema).min(1).max(50),
  disabled: z.boolean().default(false),
  className: classNameSchema.optional(),
});

export const stepperSchema = z
  .object({
    activeStep: z.number().int().min(0).default(0),
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    steps: z.array(stepSchema).min(1).max(20),
    showNumbers: z.boolean().default(true),
    className: classNameSchema.optional(),
  })
  .superRefine((stepper, ctx) => {
    if (stepper.activeStep >= stepper.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['activeStep'],
        message: 'activeStep must reference an existing step',
      });
    }
  });

export const statCardSchema = z.object({
  title: shortTextSchema,
  value: z.union([safeString({ maxLength: 256 }), numericValueSchema]),
  change: safeString({ maxLength: 64 }).optional(),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  description: mediumTextSchema.optional(),
  footer: safeString({ maxLength: 500 }).optional(),
  icon: tokenSchema.optional(),
  className: classNameSchema.optional(),
});

export const timelineSchema = z.object({
  items: z.array(timelineItemSchema).min(1).max(100),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
  className: classNameSchema.optional(),
});

export const barChartSchema = createCartesianChartSchema({
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
  stacked: z.boolean().default(false),
});

export const lineChartSchema = createCartesianChartSchema({
  curve: z.enum(['linear', 'smooth', 'step']).default('linear'),
  showPoints: z.boolean().default(true),
});

export const areaChartSchema = createCartesianChartSchema({
  curve: z.enum(['linear', 'smooth', 'step']).default('smooth'),
  stacked: z.boolean().default(false),
  showPoints: z.boolean().default(false),
});

export const pieChartSchema = z.object({
  title: titleSchema.optional(),
  description: longTextSchema.optional(),
  segments: z.array(pieChartSegmentSchema).min(1).max(50),
  donut: z.boolean().default(false),
  showLegend: z.boolean().default(true),
  className: classNameSchema.optional(),
});

export const mapSchema = z.object({
  title: titleSchema.optional(),
  description: longTextSchema.optional(),
  center: coordinateSchema,
  zoom: z.number().min(0).max(22).default(10),
  markers: z.array(mapMarkerSchema).max(1000).default([]),
  style: z.enum(['roadmap', 'satellite', 'terrain', 'hybrid']).default('roadmap'),
  height: z.number().int().min(160).max(2000).default(320),
  className: classNameSchema.optional(),
});
