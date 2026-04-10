/**
 * Action schemas for interactive shadcn/ui components.
 */

import {
  clickActionSchema,
  changeActionSchema,
  openChangeActionSchema,
  numberChangeActionSchema,
  booleanChangeActionSchema,
  submitActionSchema,
  pageChangeActionSchema,
  stepChangeActionSchema,
  markerSelectActionSchema,
} from '../shared/base-schemas.js';

export const buttonActions = { onClick: clickActionSchema } as const;
export const inputActions = { onChange: changeActionSchema } as const;
export const selectActions = { onChange: changeActionSchema } as const;
export const dialogActions = { onOpenChange: openChangeActionSchema } as const;
export const tabsActions = { onValueChange: changeActionSchema } as const;
export const accordionActions = { onValueChange: changeActionSchema } as const;
export const paginationActions = { onPageChange: pageChangeActionSchema } as const;
export const textareaActions = { onChange: changeActionSchema } as const;
export const checkboxActions = { onCheckedChange: booleanChangeActionSchema } as const;
export const radioGroupActions = { onValueChange: changeActionSchema } as const;
export const switchActions = { onCheckedChange: booleanChangeActionSchema } as const;
export const sliderActions = { onValueChange: numberChangeActionSchema } as const;
export const formActions = { onSubmit: submitActionSchema } as const;
export const stepperActions = { onStepChange: stepChangeActionSchema } as const;
export const mapActions = { onMarkerSelect: markerSelectActionSchema } as const;
