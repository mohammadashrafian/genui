/**
 * Shared schema fragments used across all adapters.
 * All string types use security-hardened schemas from @genuikit/core.
 */

import { z } from 'zod';
import { safeString, safeUrl, safeCssClass } from '@genuikit/core/security';

// ─── Reusable prop schemas ────────────────────────────────────────

/** Safe text content (stripped of HTML). */
export const childrenSchema = safeString({ maxLength: 50_000 });

/** Safe CSS class name(s). */
export const classNameSchema = safeCssClass();

/** Safe element ID. */
export const idSchema = safeString({ maxLength: 128 });

/** Safe ARIA label. */
export const ariaLabelSchema = safeString({ maxLength: 256 });

/** Safe image/link URL. */
export const srcSchema = safeUrl();

// ─── Reusable action payload schemas ──────────────────────────────

/** Generic click action payload. */
export const clickActionSchema = z.object({
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Generic value change action payload. */
export const changeActionSchema = z.object({
  value: safeString({ maxLength: 10_000 }),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Generic numeric change action payload. */
export const numberChangeActionSchema = z.object({
  value: z.number().finite(),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Generic boolean toggle payload. */
export const booleanChangeActionSchema = z.object({
  checked: z.boolean(),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Form submit action payload. */
export const submitActionSchema = z.object({
  values: z.record(safeString({ maxLength: 256 }), safeString({ maxLength: 10_000 })),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Dialog/modal open state change. */
export const openChangeActionSchema = z.object({
  open: z.boolean(),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Pagination/page navigation payload. */
export const pageChangeActionSchema = z.object({
  page: z.number().int().min(1),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Stepper/current-step change payload. */
export const stepChangeActionSchema = z.object({
  step: z.number().int().min(0),
  componentId: safeString({ maxLength: 128 }).optional(),
});

/** Marker selection payload for map-like components. */
export const markerSelectActionSchema = z.object({
  markerId: safeString({ maxLength: 128 }),
  componentId: safeString({ maxLength: 128 }).optional(),
});
