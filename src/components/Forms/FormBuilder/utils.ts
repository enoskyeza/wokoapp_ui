/**
 * Utility functions for Form Builder
 * Pure functions for string manipulation, validation, and data transformation
 */

import type { ConditionalOperator, FormBuilderData, FormStep, FormField } from './types';

/**
 * Convert a string to a URL-safe slug
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Convert a label to a slug for use as field name
 */
export function slugifyLabel(label: string): string {
  return slugify(label);
}

/**
 * Clamp column count to valid range (1-4)
 */
export function clampColumnCount(value?: number | null): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 1;
  }
  return Math.min(4, Math.max(1, Math.floor(numeric)));
}

/**
 * Clamp column span to valid range based on available columns
 */
export function clampColumnSpan(
  value: number | null | undefined, 
  columns: number
): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, columns);
  }
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
}

/**
 * Check if an operator requires a value
 */
export function operatorRequiresValue(operator: ConditionalOperator): boolean {
  return !['is_empty', 'not_empty'].includes(operator);
}

/**
 * Type guard for conditional operators
 */
export function isConditionalOperator(value: unknown): value is ConditionalOperator {
  return typeof value === 'string' && 
    ['equals', 'not_equals', 'contains', 'is_empty', 'not_empty', '>', '>=', '<', '<='].includes(value);
}

/**
 * Get all fields from all steps (flattened)
 */
export function getAllFields(steps: FormStep[]): FormField[] {
  return steps.flatMap((step) => step.fields);
}

/**
 * Find a field by its field_name or label
 */
export function findFieldByName(
  steps: FormStep[], 
  fieldName: string
): FormField | undefined {
  return getAllFields(steps).find(
    (field) => field.field_name === fieldName || slugifyLabel(field.label) === fieldName
  );
}

/**
 * Validate form data before save
 */
export function validateFormData(data: FormBuilderData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.basic.name.trim()) {
    errors.push('Form name is required');
  }

  if (!data.basic.programId) {
    errors.push('Program selection is required');
  }

  if (data.steps.length === 0) {
    errors.push('At least one step is required');
  }

  data.steps.forEach((step, index) => {
    if (step.fields.length === 0) {
      errors.push(`Step ${index + 1} must have at least one field`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
