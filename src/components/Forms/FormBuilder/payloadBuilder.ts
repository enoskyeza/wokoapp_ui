/**
 * Payload Builder
 * Converts FormBuilderData to backend API payload format
 */

import type { FormBuilderData, FieldTypeUI } from './types';
import type { CreateProgramFormPayload, FormFieldPayload } from '@/services/formsService';
import { cleanConditionalLogic, conditionalLogicToPayload } from './conditionalLogic';

/**
 * Map UI field type to backend field type
 */
function mapFieldType(type: FieldTypeUI): FormFieldPayload['field_type'] {
  if (type === 'select') return 'dropdown';
  if (type === 'tel') return 'phone';
  return type as FormFieldPayload['field_type'];
}

/**
 * Build save payload from form builder data
 */
export function buildPayload(data: FormBuilderData): CreateProgramFormPayload {
  const stepsPayload = data.steps.map((step, sIdx) => {
    const stepKey = step.key || step.id || `step-${sIdx + 1}`;
    const layoutColumns = step.layoutColumns ?? data.layoutConfig.columns ?? 4;
    
    const fields = step.fields.map((field, fIdx) => {
      const order = sIdx * 100 + fIdx + 1;
      const fieldPayload: FormFieldPayload = {
        field_name: field.field_name || `field_${order}`,
        label: field.label,
        field_type: mapFieldType(field.type),
        is_required: field.required,
        help_text: field.help_text || null,
        order,
        options: field.options || null,
        max_length: field.max_length ?? null,
        min_value: field.min_value ?? null,
        max_value: field.max_value ?? null,
        allowed_file_types: field.allowed_file_types ?? null,
        max_file_size: field.max_file_size ?? null,
        conditional_logic: conditionalLogicToPayload(field.conditional_logic),
        column_span: field.columnSpan ?? layoutColumns,
        step_key: stepKey,
      };
      return fieldPayload;
    });

    return { fields, stepKey };
  });

  // Flatten all fields
  const fieldsPayload = stepsPayload.flatMap((s) => s.fields);

  // Build step metadata
  const stepsMetadata = stepsPayload.map((step, idx) => {
    const originalStep = data.steps[idx];
    return {
      key: step.stepKey,
      title: originalStep.title,
      description: originalStep.description,
      order: idx + 1,
      per_participant: originalStep.perParticipant ?? true,
      layout: {
        columns: originalStep.layoutColumns ?? data.layoutConfig.columns ?? 4,
      },
      conditional_logic: conditionalLogicToPayload(originalStep.conditional_logic),
      fields: step.fields.map((entry) => ({
        field_name: entry.field_name,
        column_span: entry.column_span,
      })),
    };
  });

  return {
    program: Number(data.basic.programId),
    title: data.basic.name,
    description: data.basic.description,
    layout_config: {
      columns: data.layoutConfig.columns ?? 4,
    },
    steps: stepsMetadata,
    fields: fieldsPayload,
  };
}

/**
 * Validate payload before sending to backend
 */
export function validatePayload(payload: CreateProgramFormPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload.title || !payload.title.trim()) {
    errors.push('Form title is required');
  }

  if (!payload.program || isNaN(payload.program)) {
    errors.push('Valid program ID is required');
  }

  if (!payload.fields || payload.fields.length === 0) {
    errors.push('At least one field is required');
  }

  if (!payload.steps || payload.steps.length === 0) {
    errors.push('At least one step is required');
  }

  // Validate each field
  payload.fields?.forEach((field, index) => {
    if (!field.field_name || !field.field_name.trim()) {
      errors.push(`Field ${index + 1}: field_name is required`);
    }
    if (!field.label || !field.label.trim()) {
      errors.push(`Field ${index + 1}: label is required`);
    }
    if (!field.field_type) {
      errors.push(`Field ${index + 1}: field_type is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
