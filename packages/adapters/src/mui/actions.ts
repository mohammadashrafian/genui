/**
 * Action schemas for interactive Material UI components.
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
export const textFieldActions = { onChange: changeActionSchema } as const;
export const selectActions = { onChange: changeActionSchema } as const;
export const dialogActions = { onClose: openChangeActionSchema } as const;
export const tabsActions = { onChange: changeActionSchema } as const;
export const chipActions = { onClick: clickActionSchema, onDelete: clickActionSchema } as const;
export const alertActions = { onClose: clickActionSchema } as const;
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
