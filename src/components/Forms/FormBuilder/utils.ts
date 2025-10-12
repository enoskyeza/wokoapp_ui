import type { FormBuilderData, FormField, FormStep, FieldTypeUI } from './types';
import type { CreateProgramFormPayload, FormFieldPayload } from '@/services/formsService';
import type { ConditionalLogic, ConditionalRule } from '@/stores/formBuilderStore';

// String utilities
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Column utilities
export const clampColumnCount = (value?: number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 1;
  }
  return Math.min(4, Math.max(1, Math.floor(numeric)));
};

export const clampColumnSpan = (value: number | null | undefined, columns: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, columns);
  }
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

// CSS class mapping for grid columns
export const COLUMN_CLASS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-4',
};

const allowedConditionalOps = new Set<ConditionalRule['op']>([
  'equals',
  'not_equals',
  'contains',
  'is_empty',
  'not_empty',
]);

const normalizeConditionalLogic = (
  logic?: ConditionalLogic | null,
): ConditionalLogic | undefined => {
  if (!logic || !Array.isArray(logic.rules) || logic.rules.length === 0) {
    return undefined;
  }

  const mode: ConditionalLogic['mode'] = logic.mode === 'any' ? 'any' : 'all';

  const rules = logic.rules
    .map((rule) => {
      if (!rule || typeof rule !== 'object') return null;
      const field = rule.field?.trim();
      const op = allowedConditionalOps.has(rule.op) ? rule.op : undefined;
      if (!field || !op) return null;
      const value =
        rule.value == null || typeof rule.value === 'string'
          ? (rule.value ?? '')
          : String(rule.value);
      return { field, op, value } satisfies ConditionalRule;
    })
    .filter((entry): entry is ConditionalRule => Boolean(entry));

  if (!rules.length) {
    return undefined;
  }

  return { mode, rules };
};

const serializeConditionalLogic = (
  logic?: ConditionalLogic | null,
): Record<string, unknown> | null => {
  if (!logic || !Array.isArray(logic.rules) || logic.rules.length === 0) {
    return null;
  }

  const rules = logic.rules
    .map((rule) => {
      if (!rule || typeof rule !== 'object') return null;
      const field = rule.field?.trim();
      const op = allowedConditionalOps.has(rule.op) ? rule.op : undefined;
      if (!field || !op) return null;
      const value =
        rule.value == null || typeof rule.value === 'string'
          ? rule.value
          : String(rule.value);
      return { field, op, value };
    })
    .filter((entry): entry is { field: string; op: ConditionalRule['op']; value?: unknown } =>
      Boolean(entry),
    );

  if (!rules.length) {
    return null;
  }

  return {
    mode: logic.mode === 'any' ? 'any' : 'all',
    rules,
  };
};

// Form data normalization
export function normalizeFormData(data?: Partial<FormBuilderData> | null): FormBuilderData {
  const baseColumns = data?.layoutConfig?.columns ?? 4;
  const baseSteps = Array.isArray(data?.steps) && data?.steps.length
    ? data!.steps!.map((step, index) => {
        const layoutColumns = step?.layoutColumns ?? baseColumns;
        const fields = Array.isArray(step?.fields)
          ? step!.fields!.map((field, fieldIndex) => ({
              ...field,
              id: field?.id || `field-${index}-${fieldIndex}-${Date.now()}`,
              field_name: field?.field_name || slugify(field?.label || `field-${index}-${fieldIndex}`),
              columnSpan: field?.columnSpan ?? layoutColumns,
            }))
          : [];
        const key = step?.key || step?.id || `step-${index + 1}`;
        return {
          id: step?.id || key,
          key,
          title: step?.title || `Step ${index + 1}`,
          description: step?.description || '',
          fields,
          perParticipant: step?.perParticipant ?? true,
          layoutColumns,
          conditionalLogic: normalizeConditionalLogic(step?.conditionalLogic),
        } as FormStep;
      })
    : [
        {
          id: 'step-1',
          title: 'Additional Information',
          description: 'Program-specific requirements',
          fields: [
            {
              id: 'field-1',
              type: 'text' as FieldTypeUI,
              label: 'Sample Field',
              field_name: 'sample_field',
              required: false,
              columnSpan: 4,
            },
          ],
          key: 'step-1',
          perParticipant: true,
          layoutColumns: 4,
        },
      ];

  return {
    basic: {
      name: data?.basic?.name ?? '',
      description: data?.basic?.description ?? '',
      programId: data?.basic?.programId ?? '',
    },
    steps: baseSteps,
    layoutConfig: {
      columns: baseColumns,
    },
  };
}

// Field creation from payload
export function createFieldFromPayload(payload: FormFieldPayload, idPrefix = 'field'): FormField {
  const mapType = (type: string): FieldTypeUI => {
    if (type === 'dropdown') return 'select';
    if (type === 'phone') return 'tel';
    return (type as FieldTypeUI) || 'text';
  };

  return {
    id: payload.field_name || `${idPrefix}-${Math.random().toString(36).slice(2, 10)}`,
    type: mapType(payload.field_type),
    label: payload.label,
    field_name: payload.field_name || slugify(`${payload.label || idPrefix}`),
    placeholder: payload.help_text,
    required: payload.is_required,
    options: Array.isArray(payload.options) ? (payload.options as string[]) : undefined,
    help_text: payload.help_text,
    max_length: payload.max_length ?? null,
    min_value: payload.min_value ?? null,
    max_value: payload.max_value ?? null,
    allowed_file_types: Array.isArray(payload.allowed_file_types) ? payload.allowed_file_types : null,
    max_file_size: payload.max_file_size ?? null,
    order: payload.order,
    conditional_logic: payload.conditional_logic as any,
    columnSpan: payload.column_span ?? 4,
  };
}

// Payload building for backend
export function buildPayload(data: FormBuilderData): CreateProgramFormPayload {
  const mapType = (type: FieldTypeUI): FormFieldPayload['field_type'] => {
    if (type === 'select') return 'dropdown';
    if (type === 'tel') return 'phone';
    return type as FormFieldPayload['field_type'];
  };

  const stepsPayload = data.steps.map((step, sIdx) => {
    const stepKey = step.key || step.id || `step-${sIdx + 1}`;
    const layoutColumns = step.layoutColumns ?? data.layoutConfig.columns ?? 4;
    const stepConditional = serializeConditionalLogic(step.conditionalLogic);
    const fields = step.fields.map((field, fIdx) => {
      const order = sIdx * 100 + fIdx + 1;
      return {
        order,
        payload: {
          field_name: field.field_name?.trim() || slugify(field.label) || `field_${sIdx}_${fIdx}`,
          label: field.label,
          field_type: mapType(field.type),
          is_required: field.required,
          help_text: field.help_text,
          order,
          options: field.options,
          max_length: field.max_length ?? null,
          min_value: field.min_value ?? null,
          max_value: field.max_value ?? null,
          allowed_file_types: field.allowed_file_types ?? null,
          max_file_size: field.max_file_size ?? null,
          conditional_logic: field.conditional_logic,
          column_span: field.columnSpan ?? layoutColumns,
          step_key: stepKey,
        } satisfies FormFieldPayload,
      };
    });

    return {
      meta: {
        key: stepKey,
        title: step.title || `Step ${sIdx + 1}`,
        description: step.description || '',
        order: sIdx + 1,
        per_participant: step.perParticipant ?? true,
        layout: { columns: layoutColumns },
        conditional_logic: stepConditional,
      },
      fields,
    };
  });

  const fieldsPayload = stepsPayload.flatMap((step) => step.fields.map((entry) => entry.payload));
  const stepsMetadata = stepsPayload.map((step) => ({
    key: step.meta.key,
    title: step.meta.title,
    description: step.meta.description,
    order: step.meta.order,
    per_participant: step.meta.per_participant,
    layout: step.meta.layout,
    fields: step.fields.map((entry) => ({
      field_name: entry.payload.field_name,
      column_span: entry.payload.column_span,
    })),
    conditional_logic: step.meta.conditional_logic,
  }));

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

// Validation utilities
export function validateFormData(data: FormBuilderData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.basic.name.trim()) {
    errors.push('Please enter a form name');
  }

  if (!data.basic.programId) {
    errors.push('Please select a program');
  }

  if (data.steps.length === 0) {
    errors.push('Please add at least one step');
  }

  if (data.steps.some((step) => step.fields.length === 0)) {
    errors.push('Each step must have at least one field');
  }

  // Validate field names are unique
  const fieldNames = new Set<string>();
  for (const step of data.steps) {
    for (const field of step.fields) {
      const fieldName = field.field_name || slugify(field.label);
      if (fieldNames.has(fieldName)) {
        errors.push(`Duplicate field name: ${fieldName}`);
      }
      fieldNames.add(fieldName);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Local storage utilities
export function saveDraftToStorage(data: FormBuilderData, key?: string): void {
  const storageKey = key ? `form_builder_draft_${key}` : `form_builder_draft_${Date.now()}`;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function loadDraftFromStorage(key: string): FormBuilderData | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as FormBuilderData;
  } catch (error) {
    console.error('Error loading draft from storage:', error);
    return null;
  }
}

export function clearDraftFromStorage(key: string): void {
  localStorage.removeItem(key);
}

// Field type utilities
export function getFieldTypeOptions(type: FieldTypeUI) {
  const hasOptions = ['select', 'checkbox', 'radio'].includes(type);
  const hasMinMax = type === 'number';
  const hasMaxLength = ['text', 'email', 'tel', 'url', 'textarea'].includes(type);
  const hasFileOptions = type === 'file';

  return {
    hasOptions,
    hasMinMax,
    hasMaxLength,
    hasFileOptions,
  };
}

// Generate unique IDs
export function generateId(prefix = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
