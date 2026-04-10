/**
 * Tailwind CSS registry factory.
 *
 * Creates a pre-configured ActionRegistry with headless, Tailwind-ready schemas.
 * Works with any Tailwind-based component library (Headless UI, Radix, custom).
 */

import { createRegistryFactory } from '../shared/create-registry-factory.js';
import * as schemas from './schemas.js';
import * as actions from './actions.js';
import type { ComponentDefinition } from '../types.js';

const tailwindDefinitions = {
  Button: {
    schema: schemas.buttonSchema,
    actions: actions.buttonActions,
    description: 'A button with primary, secondary, danger, ghost, or link variants',
  },
  Card: {
    schema: schemas.cardSchema,
    description: 'A card with title, subtitle, body, and footer',
  },
  Alert: {
    schema: schemas.alertSchema,
    actions: actions.alertActions,
    description: 'An alert message (info, success, warning, error) with optional dismiss',
  },
  Badge: { schema: schemas.badgeSchema, description: 'A colored badge/tag with size variants' },
  Input: {
    schema: schemas.inputSchema,
    actions: actions.inputActions,
    description: 'A form input field with label, helper text, and error state',
  },
  Select: {
    schema: schemas.selectSchema,
    actions: actions.selectActions,
    description: 'A dropdown select with options',
  },
  Dialog: {
    schema: schemas.dialogSchema,
    actions: actions.dialogActions,
    description: 'A modal dialog',
  },
  Tabs: {
    schema: schemas.tabsSchema,
    actions: actions.tabsActions,
    description: 'A tabbed content area',
  },
  Table: {
    schema: schemas.tableSchema,
    description: 'A data table with striped/hoverable options',
  },
  Avatar: {
    schema: schemas.avatarSchema,
    description: 'A user avatar with initials fallback and size variants',
  },
  Accordion: {
    schema: schemas.accordionSchema,
    actions: actions.accordionActions,
    description: 'A collapsible accordion with one or more expandable items',
  },
  Breadcrumbs: {
    schema: schemas.breadcrumbsSchema,
    description: 'A breadcrumb trail for hierarchical navigation',
  },
  Pagination: {
    schema: schemas.paginationSchema,
    actions: actions.paginationActions,
    description: 'Pagination controls with page counts and navigation toggles',
  },
  ProgressBar: {
    schema: schemas.progressBarSchema,
    description: 'A linear or circular progress indicator',
  },
  Skeleton: { schema: schemas.skeletonSchema, description: 'A placeholder loading skeleton' },
  Tooltip: {
    schema: schemas.tooltipSchema,
    description: 'A tooltip wrapper with placement and optional arrow',
  },
  Textarea: {
    schema: schemas.textareaSchema,
    actions: actions.textareaActions,
    description: 'A multi-line text input with helper and error text',
  },
  Checkbox: {
    schema: schemas.checkboxSchema,
    actions: actions.checkboxActions,
    description: 'A checkbox control with label and optional description',
  },
  RadioGroup: {
    schema: schemas.radioGroupSchema,
    actions: actions.radioGroupActions,
    description: 'A radio-group selection control with labeled options',
  },
  Switch: {
    schema: schemas.switchSchema,
    actions: actions.switchActions,
    description: 'A boolean toggle switch',
  },
  Slider: {
    schema: schemas.sliderSchema,
    actions: actions.sliderActions,
    description: 'A numeric range slider with marks and current value',
  },
  Form: {
    schema: schemas.formSchema,
    actions: actions.formActions,
    description: 'A structured form definition with validated fields',
  },
  Stepper: {
    schema: schemas.stepperSchema,
    actions: actions.stepperActions,
    description: 'A multi-step progress indicator with active step state',
  },
  StatCard: {
    schema: schemas.statCardSchema,
    description: 'A compact metric card with trend and summary text',
  },
  Timeline: {
    schema: schemas.timelineSchema,
    description: 'A vertical or horizontal timeline of dated events',
  },
  BarChart: {
    schema: schemas.barChartSchema,
    description: 'A categorical bar chart with one or more series',
  },
  LineChart: {
    schema: schemas.lineChartSchema,
    description: 'A line chart with configurable curves and point display',
  },
  PieChart: {
    schema: schemas.pieChartSchema,
    description: 'A pie or donut chart with labeled segments',
  },
  AreaChart: {
    schema: schemas.areaChartSchema,
    description: 'An area chart for filled trend visualizations',
  },
  Map: {
    schema: schemas.mapSchema,
    actions: actions.mapActions,
    description: 'A map view with center, zoom, and clickable markers',
  },
} as const satisfies Record<string, ComponentDefinition>;

export type TailwindComponentName = keyof typeof tailwindDefinitions;

export const tailwindComponents = tailwindDefinitions;

export const createTailwindRegistry = createRegistryFactory<
  TailwindComponentName,
  typeof tailwindDefinitions
>(tailwindDefinitions);
