/**
 * Action schemas for interactive Material UI components.
 */

import {
  clickActionSchema,
  changeActionSchema,
  openChangeActionSchema,
} from '../shared/base-schemas.js';

export const buttonActions = { onClick: clickActionSchema } as const;
export const textFieldActions = { onChange: changeActionSchema } as const;
export const selectActions = { onChange: changeActionSchema } as const;
export const dialogActions = { onClose: openChangeActionSchema } as const;
export const tabsActions = { onChange: changeActionSchema } as const;
export const chipActions = { onClick: clickActionSchema, onDelete: clickActionSchema } as const;
export const alertActions = { onClose: clickActionSchema } as const;
