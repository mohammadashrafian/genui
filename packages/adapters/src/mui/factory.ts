/**
 * Material UI registry factory.
 *
 * Creates a pre-configured ActionRegistry matching MUI component APIs.
 * Uses MUI naming: variant, color, elevation, severity, etc.
 *
 * @example
 * ```ts
 * import { createMuiRegistry } from '@genui/adapters/mui';
 * import { Button } from '@mui/material/Button';
 * import { Card } from './components/MuiCard';
 *
 * const registry = createMuiRegistry({
 *   Button, Card, Alert, Chip, TextField, Select, Dialog, Tabs, Table, Avatar,
 * });
 * ```
 */

import { createRegistryFactory } from '../shared/create-registry-factory.js';
import * as schemas from './schemas.js';
import * as actions from './actions.js';
import type { ComponentDefinition } from '../types.js';

const muiDefinitions = {
  Button: { schema: schemas.buttonSchema, actions: actions.buttonActions, description: 'A Material button (text, contained, outlined) with color variants' },
  Card: { schema: schemas.cardSchema, description: 'A Material card with title, subheader, content, media, and actions' },
  Alert: { schema: schemas.alertSchema, actions: actions.alertActions, description: 'A Material alert with severity (error, warning, info, success)' },
  Chip: { schema: schemas.chipSchema, actions: actions.chipActions, description: 'A Material chip/tag with color and variant options' },
  TextField: { schema: schemas.textFieldSchema, actions: actions.textFieldActions, description: 'A Material text field (outlined, filled, standard) with validation' },
  Select: { schema: schemas.selectSchema, actions: actions.selectActions, description: 'A Material select dropdown with options' },
  Dialog: { schema: schemas.dialogSchema, actions: actions.dialogActions, description: 'A Material dialog with maxWidth control' },
  Tabs: { schema: schemas.tabsSchema, actions: actions.tabsActions, description: 'Material tabs (standard, scrollable, fullWidth)' },
  Table: { schema: schemas.tableSchema, description: 'A Material table with size and sticky header options' },
  Avatar: { schema: schemas.avatarSchema, description: 'A Material avatar (circular, rounded, square)' },
} as const satisfies Record<string, ComponentDefinition>;

export type MuiComponentName = keyof typeof muiDefinitions;

export const muiComponents = muiDefinitions;

export const createMuiRegistry = createRegistryFactory<MuiComponentName, typeof muiDefinitions>(
  muiDefinitions,
);
