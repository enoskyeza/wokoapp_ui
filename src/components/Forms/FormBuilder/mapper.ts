// Mapper: Convert backend DTO (unified structure or legacy) to FormBuilderData shape used locally

export type FieldTypeUI =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'number'
  | 'date'
  | 'url';

export interface FormFieldState {
  id: string;
  type: FieldTypeUI;
  label: string;
  field_name?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  help_text?: string;
  order?: number;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  allowed_file_types?: string[] | null;
  max_file_size?: number | null;
  conditional_logic?: { mode: 'all' | 'any'; rules: Array<{ field: string; op: string; value?: any }> };
  columnSpan?: number;
}

export interface FormStepState {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldState[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number;
  conditional_logic?: { mode: 'all' | 'any'; rules: Array<{ field: string; op: string; value?: any }> };
}

export interface FormBuilderData {
  basic: { name: string; description: string; programId: string };
  steps: FormStepState[];
  layoutConfig: { columns: number };
}

const clampColumns = (value?: number | null) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 4;
  return Math.min(12, Math.max(1, Math.floor(n)));
};

const clampSpan = (value?: number | null, maxCols = 4) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return Math.min(4, maxCols);
  return Math.min(maxCols, Math.max(1, Math.floor(n)));
};

const mapType = (backend: string): FieldTypeUI => {
  if (backend === 'dropdown') return 'select';
  if (backend === 'phone') return 'tel';
  const known = [
    'text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'file', 'number', 'date', 'url',
  ];
  return (known.includes(backend) ? (backend as FieldTypeUI) : 'text');
};

export function mapCompleteFormToBuilder(source: any): FormBuilderData {
  // Support both unified DTO and legacy shapes
  const title = source?.title ?? source?.name ?? '';
  const description = source?.description ?? '';
  const programId = String(source?.program?.id ?? source?.program ?? '');

  const layoutColumns = clampColumns(
    source?.layout_config?.columns ?? source?.layoutConfig?.columns ?? 4
  );

  const stepsArray: any[] = Array.isArray(source?.steps) ? source.steps : [];

  const steps: FormStepState[] = stepsArray.map((s: any, sIdx: number) => {
    const stepCols = clampColumns(s?.layoutColumns ?? s?.layout_columns ?? layoutColumns);
    const fieldsArray: any[] = Array.isArray(s?.fields) ? s.fields : [];

    const fields: FormFieldState[] = fieldsArray.map((f: any, fIdx: number) => {
      const id = String(
        f?.id ?? f?.field_name ?? `field-${sIdx}-${fIdx}-${Date.now()}`
      );
      const type = mapType(String(f?.field_type ?? f?.type ?? 'text'));
      const span = clampSpan(f?.column_span ?? f?.columnSpan, stepCols);

      return {
        id,
        type,
        label: String(f?.label ?? f?.name ?? 'Field'),
        field_name: String(f?.field_name ?? ''),
        placeholder: f?.help_text ?? f?.placeholder ?? '',
        required: Boolean(f?.is_required ?? f?.required ?? false),
        options: Array.isArray(f?.options) ? f.options.filter(Boolean) : undefined,
        help_text: f?.help_text ?? '',
        order: Number.isFinite(f?.order) ? f.order : undefined,
        max_length: f?.max_length ?? null,
        min_value: f?.min_value ?? null,
        max_value: f?.max_value ?? null,
        allowed_file_types: Array.isArray(f?.allowed_file_types) ? f.allowed_file_types : null,
        max_file_size: f?.max_file_size ?? null,
        conditional_logic: s?.conditional_logic ?? f?.conditional_logic ?? undefined,
        columnSpan: span,
      };
    });

    return {
      id: String(s?.id ?? s?.key ?? `step-${sIdx + 1}`),
      title: String(s?.title ?? `Step ${sIdx + 1}`),
      description: s?.description ?? '',
      fields,
      key: s?.key ?? undefined,
      perParticipant: Boolean(s?.perParticipant ?? true),
      layoutColumns: stepCols,
      conditional_logic: s?.conditional_logic ?? undefined,
    };
  });

  return {
    basic: { name: title, description, programId },
    steps,
    layoutConfig: { columns: layoutColumns },
  };
}
