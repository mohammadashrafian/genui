/**
 * shadcn/ui registry factory.
 *
 * Creates a pre-configured ActionRegistry with shadcn/ui schemas.
 * Users provide their own component implementations.
 *
 * @example
 * ```ts
 * import { createShadcnRegistry } from '@genuikit/adapters/shadcn';
 * import { Button } from '@/components/ui/button';
 * import { Card } from '@/components/ui/card';
 *
 * const registry = createShadcnRegistry({
 *   Button, Card, Alert, Badge, Input, Select, Dialog, Tabs, Table, Avatar,
 *   Accordion, Breadcrumbs, Pagination, ProgressBar, Skeleton, Tooltip,
 *   Textarea, Checkbox, RadioGroup, Switch, Slider, Form, Stepper, StatCard,
 *   Timeline, BarChart, LineChart, PieChart, AreaChart, Map,
 * });
 * ```
 */

import { createRegistryFactory } from '../shared/create-registry-factory.js';
import * as schemas from './schemas.js';
import * as actions from './actions.js';
import type { ComponentDefinition } from '../types.js';

const shadcnDefinitions = {
  Button: {
    schema: schemas.buttonSchema,
    actions: actions.buttonActions,
    description:
      'A clickable button with variants (default, destructive, outline, secondary, ghost, link)',
  },
  Card: {
    schema: schemas.cardSchema,
    description: 'A card container with title, description, content, and footer',
  },
  Alert: {
    schema: schemas.alertSchema,
    description: 'An alert/notice message with default or destructive variant',
  },
  Badge: { schema: schemas.badgeSchema, description: 'A small status indicator label' },
  Input: {
    schema: schemas.inputSchema,
    actions: actions.inputActions,
    description: 'A text input field (text, email, password, number, search, tel, url)',
  },
  Select: {
    schema: schemas.selectSchema,
    actions: actions.selectActions,
    description: 'A dropdown selection control with options',
  },
  Dialog: {
    schema: schemas.dialogSchema,
    actions: actions.dialogActions,
    description: 'A modal dialog with title, description, and content',
  },
  Tabs: {
    schema: schemas.tabsSchema,
    actions: actions.tabsActions,
    description: 'A tabbed content switcher',
  },
  Table: { schema: schemas.tableSchema, description: 'A data table with headers and rows' },
  Avatar: { schema: schemas.avatarSchema, description: 'A user avatar image with text fallback' },
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

/** Component names available in the shadcn/ui adapter. */
export type ShadcnComponentName = keyof typeof shadcnDefinitions;

/** All shadcn component definitions (for advanced customization). */
export const shadcnComponents = shadcnDefinitions;

/**
 * Create a pre-configured ActionRegistry with shadcn/ui schemas.
 * All components must be provided.
 */
export const createShadcnRegistry = createRegistryFactory<
  ShadcnComponentName,
  typeof shadcnDefinitions
>(shadcnDefinitions);
