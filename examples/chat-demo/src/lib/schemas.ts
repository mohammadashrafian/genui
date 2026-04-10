import { safeString, safeUrl } from '@genuikit/core/security';
import { z } from 'zod';
import type {
  ActionPanelProps,
  AlertBannerProps,
  ChecklistPanelProps,
  ComparisonTableProps,
  DemoComponentName,
  MetricBoardProps,
  TimelinePanelProps,
} from './components.js';

const badgeToneSchema = z.enum(['info', 'success', 'warning']);
const trendSchema = z.enum(['up', 'down', 'flat']);
const checklistStatusSchema = z.enum(['todo', 'doing', 'done']);
const timelineStatusSchema = z.enum(['done', 'active', 'next']);
const actionEmphasisSchema = z.enum(['primary', 'secondary']);

export const alertBannerSchema: z.ZodType<AlertBannerProps> = z.object({
  title: safeString({ maxLength: 120 }),
  description: safeString({ maxLength: 400 }),
  tone: badgeToneSchema.default('info'),
});

export const metricBoardSchema: z.ZodType<MetricBoardProps> = z.object({
  title: safeString({ maxLength: 120 }),
  caption: safeString({ maxLength: 240 }).optional(),
  items: z
    .array(
      z.object({
        label: safeString({ maxLength: 80 }),
        value: safeString({ maxLength: 120 }),
        change: safeString({ maxLength: 40 }).optional(),
        trend: trendSchema.optional(),
      }),
    )
    .min(2)
    .max(6),
});

export const checklistPanelSchema: z.ZodType<ChecklistPanelProps> = z.object({
  title: safeString({ maxLength: 120 }),
  intro: safeString({ maxLength: 240 }).optional(),
  items: z
    .array(
      z.object({
        label: safeString({ maxLength: 140 }),
        detail: safeString({ maxLength: 220 }).optional(),
        status: checklistStatusSchema.default('todo'),
      }),
    )
    .min(1)
    .max(7),
});

export const comparisonTableSchema: z.ZodType<ComparisonTableProps> = z.object({
  title: safeString({ maxLength: 120 }),
  columns: z.array(safeString({ maxLength: 80 })).min(2).max(4),
  rows: z
    .array(
      z.object({
        label: safeString({ maxLength: 120 }),
        values: z.array(safeString({ maxLength: 160 })).min(2).max(4),
      }),
    )
    .min(1)
    .max(6),
});

export const timelinePanelSchema: z.ZodType<TimelinePanelProps> = z.object({
  title: safeString({ maxLength: 120 }),
  items: z
    .array(
      z.object({
        title: safeString({ maxLength: 100 }),
        detail: safeString({ maxLength: 220 }),
        time: safeString({ maxLength: 80 }).optional(),
        status: timelineStatusSchema.default('next'),
      }),
    )
    .min(2)
    .max(6),
});

export const actionPanelSchema: z.ZodType<ActionPanelProps> = z.object({
  title: safeString({ maxLength: 120 }),
  description: safeString({ maxLength: 280 }),
  actions: z
    .array(
      z.object({
        label: safeString({ maxLength: 100 }),
        description: safeString({ maxLength: 220 }).optional(),
        href: safeUrl().optional(),
        emphasis: actionEmphasisSchema.default('secondary'),
      }),
    )
    .min(1)
    .max(4),
});

export const demoComponentSchemas: Record<DemoComponentName, z.ZodTypeAny> = {
  AlertBanner: alertBannerSchema,
  MetricBoard: metricBoardSchema,
  ChecklistPanel: checklistPanelSchema,
  ComparisonTable: comparisonTableSchema,
  TimelinePanel: timelinePanelSchema,
  ActionPanel: actionPanelSchema,
};
