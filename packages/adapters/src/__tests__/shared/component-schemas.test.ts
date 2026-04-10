import { describe, expect, it } from 'vitest';
import {
  accordionSchema,
  barChartSchema,
  formSchema,
  mapSchema,
  progressBarSchema,
  sliderSchema,
} from '../../shared/component-schemas.js';

describe('shared component schemas', () => {
  it('accepts accordion defaults', () => {
    const result = accordionSchema.parse({
      items: [{ value: 'overview', title: 'Overview', content: 'Body' }],
    });

    expect(result.allowMultiple).toBe(false);
    expect(result.collapsible).toBe(true);
  });

  it('requires value for determinate progress bars', () => {
    const result = progressBarSchema.safeParse({
      indeterminate: false,
    });

    expect(result.success).toBe(false);
  });

  it('requires option lists for select form fields', () => {
    const result = formSchema.safeParse({
      fields: [{ name: 'plan', label: 'Plan', type: 'select' }],
    });

    expect(result.success).toBe(false);
  });

  it('validates chart category alignment', () => {
    const result = barChartSchema.safeParse({
      categories: ['Jan', 'Feb'],
      series: [{ id: 'revenue', label: 'Revenue', values: [10] }],
    });

    expect(result.success).toBe(false);
  });

  it('rejects slider values outside the configured range', () => {
    const result = sliderSchema.safeParse({
      min: 0,
      max: 10,
      value: 12,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid map coordinates', () => {
    const result = mapSchema.safeParse({
      center: { lat: 120, lng: 0 },
    });

    expect(result.success).toBe(false);
  });
});
