/**
 * Material UI registry factory.
 *
 * Creates a pre-configured ActionRegistry matching MUI component APIs.
 * Uses MUI naming: variant, color, elevation, severity, etc.
 *
 * @example
 * ```ts
 * import { createMuiRegistry } from '@genuikit/adapters/mui';
 * import { Button } from '@mui/material/Button';
 * import { Card } from './components/MuiCard';
 *
 * const registry = createMuiRegistry({
 *   Button, Card, Alert, Chip, TextField, Select, Dialog, Tabs, Table, Avatar,
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

const muiDefinitions = {
  Button: {
    schema: schemas.buttonSchema,
    actions: actions.buttonActions,
    description: 'A Material button (text, contained, outlined) with color variants',
  },
  Card: {
    schema: schemas.cardSchema,
    description: 'A Material card with title, subheader, content, media, and actions',
  },
  Alert: {
    schema: schemas.alertSchema,
    actions: actions.alertActions,
    description: 'A Material alert with severity (error, warning, info, success)',
  },
  Chip: {
    schema: schemas.chipSchema,
    actions: actions.chipActions,
    description: 'A Material chip/tag with color and variant options',
  },
  TextField: {
    schema: schemas.textFieldSchema,
    actions: actions.textFieldActions,
    description: 'A Material text field (outlined, filled, standard) with validation',
  },
  Select: {
    schema: schemas.selectSchema,
    actions: actions.selectActions,
    description: 'A Material select dropdown with options',
  },
  Dialog: {
    schema: schemas.dialogSchema,
    actions: actions.dialogActions,
    description: 'A Material dialog with maxWidth control',
  },
  Tabs: {
    schema: schemas.tabsSchema,
    actions: actions.tabsActions,
    description: 'Material tabs (standard, scrollable, fullWidth)',
  },
  Table: {
    schema: schemas.tableSchema,
    description: 'A Material table with size and sticky header options',
  },
  Avatar: {
    schema: schemas.avatarSchema,
    description: 'A Material avatar (circular, rounded, square)',
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

export type MuiComponentName = keyof typeof muiDefinitions;

export const muiComponents = muiDefinitions;

export const createMuiRegistry = createRegistryFactory<MuiComponentName, typeof muiDefinitions>(
  muiDefinitions,
);
