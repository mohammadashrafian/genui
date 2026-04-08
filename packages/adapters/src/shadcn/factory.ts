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
 * });
 * ```
 */

import { createRegistryFactory } from '../shared/create-registry-factory.js';
import * as schemas from './schemas.js';
import * as actions from './actions.js';
import type { ComponentDefinition } from '../types.js';

const shadcnDefinitions = {
  Button: { schema: schemas.buttonSchema, actions: actions.buttonActions, description: 'A clickable button with variants (default, destructive, outline, secondary, ghost, link)' },
  Card: { schema: schemas.cardSchema, description: 'A card container with title, description, content, and footer' },
  Alert: { schema: schemas.alertSchema, description: 'An alert/notice message with default or destructive variant' },
  Badge: { schema: schemas.badgeSchema, description: 'A small status indicator label' },
  Input: { schema: schemas.inputSchema, actions: actions.inputActions, description: 'A text input field (text, email, password, number, search, tel, url)' },
  Select: { schema: schemas.selectSchema, actions: actions.selectActions, description: 'A dropdown selection control with options' },
  Dialog: { schema: schemas.dialogSchema, actions: actions.dialogActions, description: 'A modal dialog with title, description, and content' },
  Tabs: { schema: schemas.tabsSchema, actions: actions.tabsActions, description: 'A tabbed content switcher' },
  Table: { schema: schemas.tableSchema, description: 'A data table with headers and rows' },
  Avatar: { schema: schemas.avatarSchema, description: 'A user avatar image with text fallback' },
} as const satisfies Record<string, ComponentDefinition>;

/** Component names available in the shadcn/ui adapter. */
export type ShadcnComponentName = keyof typeof shadcnDefinitions;

/** All shadcn component definitions (for advanced customization). */
export const shadcnComponents = shadcnDefinitions;

/**
 * Create a pre-configured ActionRegistry with shadcn/ui schemas.
 * All components must be provided.
 */
export const createShadcnRegistry = createRegistryFactory<ShadcnComponentName, typeof shadcnDefinitions>(
  shadcnDefinitions,
);
