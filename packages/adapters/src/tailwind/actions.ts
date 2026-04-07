/**
 * Action schemas for interactive Tailwind components.
 */

import {
  clickActionSchema,
  changeActionSchema,
  openChangeActionSchema,
} from '../shared/base-schemas.js';

export const buttonActions = { onClick: clickActionSchema } as const;
export const inputActions = { onChange: changeActionSchema } as const;
export const selectActions = { onChange: changeActionSchema } as const;
export const dialogActions = { onOpenChange: openChangeActionSchema } as const;
export const tabsActions = { onValueChange: changeActionSchema } as const;
export const alertActions = { onDismiss: clickActionSchema } as const;
