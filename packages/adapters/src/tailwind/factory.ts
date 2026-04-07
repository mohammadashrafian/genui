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
  Button: { schema: schemas.buttonSchema, actions: actions.buttonActions, description: 'A button with primary, secondary, danger, ghost, or link variants' },
  Card: { schema: schemas.cardSchema, description: 'A card with title, subtitle, body, and footer' },
  Alert: { schema: schemas.alertSchema, actions: actions.alertActions, description: 'An alert message (info, success, warning, error) with optional dismiss' },
  Badge: { schema: schemas.badgeSchema, description: 'A colored badge/tag with size variants' },
  Input: { schema: schemas.inputSchema, actions: actions.inputActions, description: 'A form input field with label, helper text, and error state' },
  Select: { schema: schemas.selectSchema, actions: actions.selectActions, description: 'A dropdown select with options' },
  Dialog: { schema: schemas.dialogSchema, actions: actions.dialogActions, description: 'A modal dialog' },
  Tabs: { schema: schemas.tabsSchema, actions: actions.tabsActions, description: 'A tabbed content area' },
  Table: { schema: schemas.tableSchema, description: 'A data table with striped/hoverable options' },
  Avatar: { schema: schemas.avatarSchema, description: 'A user avatar with initials fallback and size variants' },
} as const satisfies Record<string, ComponentDefinition>;

export type TailwindComponentName = keyof typeof tailwindDefinitions;

export const tailwindComponents = tailwindDefinitions;

export const createTailwindRegistry = createRegistryFactory<TailwindComponentName, typeof tailwindDefinitions>(
  tailwindDefinitions,
);
