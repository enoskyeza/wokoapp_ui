import type { FormFieldPayload } from '@/services/formsService';
import { buildAuthHeaders } from '@/lib/authHeaders';

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

const createAuthHeaders = (headers?: HeadersInit): Headers => {
  const merged = new Headers(headers ?? {});
  const authHeaders = buildAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value && !merged.has(key)) {
      merged.set(key, value);
    }
  });
  return merged;
};

const normalizeFormIdentifier = (value: string | number): string => {
  const str = String(value).trim();
  const match = str.match(/(\d+)$/);
  return match ? match[1] : str;
};

const clampColumns = (value?: number | null, fallback = 4) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.min(4, Math.max(1, Math.floor(numeric)));
};

const clampColumnSpan = (value?: number | null, columns = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return columns;
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

type ConditionOp = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty' | '>' | '>=' | '<' | '<=';

interface ConditionRule {
  field: string;
  op: ConditionOp;
  value?: string | number | boolean | null;
}

export interface ConditionalLogicConfig {
  mode: 'all' | 'any';
  rules: ConditionRule[];
}

const normalizeOptions = (options: unknown): string[] | undefined => {
  if (!Array.isArray(options)) return undefined;
  const normalized = options
    .map((option) => {
      if (typeof option === 'string') return option;
      if (option && typeof option === 'object') {
        const candidate = option as { label?: string; value?: string };
        return candidate.label ?? candidate.value ?? '';
      }
      return '';
    })
    .filter((option) => Boolean(option));
  return normalized.length ? normalized : undefined;
};

const createAuthRequest = (input: string, init: RequestInit = {}) => {
  const headers = createAuthHeaders(init.headers);
  return fetch(input, { ...init, headers, credentials: 'include' });
};

const normalizeConditionalLogic = (raw: unknown): ConditionalLogicConfig | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  const incomingRules = Array.isArray(record.rules) ? (record.rules as unknown[]) : [];
  if (!incomingRules.length) return undefined;

  const cleanedRules: ConditionRule[] = [];
  incomingRules.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const rule = entry as Record<string, unknown>;
    const field = typeof rule.field === 'string' ? rule.field.trim() : '';
    const op = typeof rule.op === 'string' ? (rule.op as ConditionOp) : undefined;
    if (!field || !op) return;
    cleanedRules.push({
      field,
      op,
      value: rule.value as ConditionRule['value'],
    });
  });

  if (!cleanedRules.length) return undefined;

  const mode = record.mode === 'any' ? 'any' : 'all';
  return { mode, rules: cleanedRules };
};

const normalizeStructureFromDetail = (raw: unknown): FormStructure | null => {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const baseColumns = clampColumns(
    record?.layout_config && typeof record.layout_config === 'object'
      ? (record.layout_config as Record<string, unknown>).columns as number | undefined
      : record?.layout && typeof record.layout === 'object'
        ? (record.layout as Record<string, unknown>).columns as number | undefined
        : (record.columns as number | undefined),
  );

  const sourceFields: unknown[] = Array.isArray(record.fields) ? (record.fields as unknown[]) : [];
  if (!sourceFields.length) return null;

  const normalizedFields: FormStructureField[] = sourceFields.map((field, index) => {
    const fieldRecord = (field ?? {}) as Record<string, unknown>;
    const stepKey = (fieldRecord.step_key ?? fieldRecord.step ?? fieldRecord.meta_step_key) as string | undefined;
    const orderValue = fieldRecord.order as number | undefined;
    const columnSpan = clampColumnSpan(fieldRecord.column_span as number | null | undefined, baseColumns);

    return {
      id: (fieldRecord.id ?? fieldRecord.field_name ?? `field-${index}`) as string | number,
      field_name: (fieldRecord.field_name ?? fieldRecord.name ?? `field_${index}`) as string,
      label: (fieldRecord.label ?? fieldRecord.name ?? `Field ${index + 1}`) as string,
      field_type: (fieldRecord.field_type ?? fieldRecord.type ?? 'text') as string,
      is_required: Boolean(fieldRecord.is_required ?? fieldRecord.required),
      required: Boolean(fieldRecord.required ?? fieldRecord.is_required),
      help_text: (fieldRecord.help_text ?? fieldRecord.placeholder ?? '') as string,
      options: normalizeOptions(fieldRecord.options),
      order: typeof orderValue === 'number' ? orderValue : index + 1,
      max_length: (fieldRecord.max_length ?? null) as number | null,
      min_value: (fieldRecord.min_value ?? null) as number | null,
      max_value: (fieldRecord.max_value ?? null) as number | null,
      allowed_file_types: (fieldRecord.allowed_file_types ?? null) as string[] | null,
      max_file_size: (fieldRecord.max_file_size ?? null) as number | null,
      conditional_logic: normalizeConditionalLogic(fieldRecord.conditional_logic),
      is_static: Boolean(fieldRecord.is_static),
      column_span: columnSpan,
      step_key: stepKey,
    };
  });

  const metadataSteps: unknown[] = Array.isArray(record.steps) ? (record.steps as unknown[]) : [];
  let steps: FormStructureStep[] = [];

  if (metadataSteps.length) {
    steps = metadataSteps
      .map((step, index) => {
        const stepRecord = (step ?? {}) as Record<string, unknown>;
        const key = (stepRecord.key ?? stepRecord.step_key ?? stepRecord.id ?? `step-${index + 1}`) as string;
        const stepColumns = clampColumns(
          stepRecord.layout && typeof stepRecord.layout === 'object'
            ? (stepRecord.layout as Record<string, unknown>).columns as number | undefined
            : undefined,
          baseColumns,
        );

        const stepFields = normalizedFields
          .filter((field) => {
            if (field.step_key) return field.step_key === key;
            const order = field.order ?? (index + 1) * 100;
            const bucket = Math.floor((order - 1) / 100) + 1;
            return `step-${bucket}` === key;
          })
          .map((field) => ({
            ...field,
            column_span: clampColumnSpan(field.column_span, stepColumns),
          }));

        if (!stepFields.length) return null;

        return {
          key,
          title: (stepRecord.title ?? `Step ${index + 1}`) as string,
          description: (stepRecord.description ?? '') as string,
          order: (stepRecord.order as number | undefined) ?? index + 1,
          per_participant: Boolean(stepRecord.per_participant ?? true),
          layout: { columns: stepColumns },
          is_static: Boolean(stepRecord.is_static),
          conditional_logic: normalizeConditionalLogic(stepRecord.conditional_logic),
          fields: stepFields,
        } satisfies FormStructureStep;
      })
      .filter((step): step is FormStructureStep => Boolean(step));
  }

  if (!steps.length) {
    const grouped = new Map<string, FormStructureField[]>();

    normalizedFields.forEach((field) => {
      const order = field.order ?? 0;
      const bucket = Math.max(1, Math.floor((order - 1) / 100) + 1);
      const key = field.step_key || `step-${bucket}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push({
        ...field,
        column_span: clampColumnSpan(field.column_span, baseColumns),
      });
    });

    steps = Array.from(grouped.entries()).map(([key, fields], index) => ({
      key,
      title: `Additional Information ${index + 1}`,
      description: '',
      order: index + 1,
      per_participant: true,
      layout: { columns: baseColumns },
      conditional_logic: undefined,
      fields,
    }));
  }

  return {
    id: record.id ?? record.pk ?? null,
    title: (record.title ?? record.name ?? '') as string,
    description: (record.description ?? '') as string,
    program: record.program ?? record.program_id ?? null,
    fields: normalizedFields,
    steps,
    layout_config: { columns: baseColumns },
  };
};

const fetchFormDetailStructure = async (formId: string): Promise<FormStructure | null> => {
  try {
    const detailResponse = await createAuthRequest(`${API_BASE}/program_forms/${formId}/`);
    if (!detailResponse.ok) {
      return null;
    }
    const data = await detailResponse.json();
    return normalizeStructureFromDetail(data);
  } catch (error) {
    console.error('Error fetching form detail:', error);
    return null;
  }
};

const authFetch = createAuthRequest;

export interface FormField {
  id: string;
  field_name?: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  field_type?: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  required: boolean;
  is_required?: boolean;
  options?: string[];
  order?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  allowed_file_types?: string;
  max_file_size?: number;
  conditional_logic?: ConditionalLogicConfig;
  column_span?: number;
  step_key?: string;
  is_static?: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  key?: string;
  per_participant?: boolean;
  layout_columns?: number;
  conditional_logic?: ConditionalLogicConfig;
}

// Backend structure returned by /forms/{id}/structure/
export interface FormStructureField {
  id?: number | string;
  field_name?: string;
  label: string;
  field_type: string;
  is_required?: boolean;
  required?: boolean;
  help_text?: string;
  options?: string[];
  order?: number;
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  allowed_file_types?: string[] | null;
  max_file_size?: number | null;
  conditional_logic?: ConditionalLogicConfig;
  is_static?: boolean;
  column_span?: number | null;
  step_key?: string;
}

export interface FormStructureStep {
  key: string;
  title: string;
  description?: string;
  order?: number;
  is_static?: boolean;
  per_participant?: boolean;
  layout?: {
    columns?: number;
    [key: string]: unknown;
  };
  conditional_logic?: ConditionalLogicConfig;
  fields: FormStructureField[];
}

export interface FormStructure {
  id?: number | string;
  title?: string;
  name?: string;
  description?: string;
  program?: number | string;
  fields: FormStructureField[];
  steps?: FormStructureStep[];
  layout_config?: {
    columns?: number;
    [key: string]: unknown;
  };
}

export interface ProgramForm {
  id: string;
  name: string;
  title?: string;
  description?: string;
  fields: number;
  submissions: number;
  isActive: boolean;
  createdAt: string;
  steps?: FormStep[];
  program?: number; // Program ID
}

export interface FormResponse {
  id: string;
  form: string;
  participant_name: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  created_at: string;
  responses: Record<string, unknown>;
}

export const programFormService = {
  async getProgramForms(programId: string): Promise<ProgramForm[]> {
    try {
      // Try the nested endpoint first
      let response = await authFetch(`${API_BASE}/programs/${programId}/forms/`);
      
      // If 404, try the flat endpoint as fallback
      if (response.status === 404) {
        response = await authFetch(`${API_BASE}/program_forms/?program=${programId}`);
      }
      
      if (!response.ok) {
        // Gracefully handle errors as empty list to avoid hard runtime errors in UI
        console.warn(`Failed to fetch program forms: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      type BackendProgramForm = {
        id: number | string;
        title?: string;
        name?: string;
        description?: string;
        fields?: number | unknown[];
        submissions?: number;
        is_active?: boolean;
        isActive?: boolean;
        created_at?: string;
        createdAt?: string;
        steps?: unknown[];
      };
      const forms: BackendProgramForm[] = data.results || data;
      
      // Transform backend data to frontend format
      return forms.map((form) => ({
        id: form.id?.toString() || '',
        name: form.title || form.name || 'Untitled Form',
        description: form.description || '',
        fields: typeof form.fields === 'number' ? form.fields : (Array.isArray(form.fields) ? form.fields.length : 0),
        submissions: typeof form.submissions === 'number' ? form.submissions : 0,
        isActive: Boolean(form.is_active || form.isActive),
        createdAt: form.created_at || form.createdAt || new Date().toISOString(),
        steps: [] as FormStep[]
      }));
    } catch (error) {
      console.error('Error fetching program forms:', error);
      return [];
    }
  },

  async inactivateForm(programId: string, formId: string): Promise<boolean> {
    try {
      // Try nested endpoint first
      const targetId = normalizeFormIdentifier(formId);
      let response = await authFetch(`${API_BASE}/programs/${programId}/forms/${targetId}/inactivate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 404) {
        // Fallback to flat endpoint
        response = await authFetch(`${API_BASE}/program_forms/${targetId}/inactivate/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to inactivate form: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error inactivating form:', error);
      return false;
    }
  },

  async getFormStructure(formId: string): Promise<FormStructure | null> {
    const targetId = normalizeFormIdentifier(formId);

    try {
      const response = await authFetch(`${API_BASE}/program_forms/${targetId}/structure/`);
      if (response.ok) {
        const raw = await response.json();
        const fields: FormStructureField[] = Array.isArray(raw.fields) ? raw.fields : [];
        const steps: FormStructureStep[] = Array.isArray(raw.steps) ? raw.steps : [];
        const layout_config = raw.layout_config && typeof raw.layout_config === 'object'
          ? raw.layout_config
          : { columns: 4 };
        return {
          ...raw,
          fields,
          steps,
          layout_config,
        };
      }

      console.warn(
        `Structure endpoint responded with ${response.status} ${response.statusText}; attempting fallback structure for form ${targetId}`,
      );
    } catch (error) {
      console.error('Primary structure fetch failed, attempting fallback:', error);
    }

    return fetchFormDetailStructure(targetId);
  },

  async getFormById(formId: string): Promise<ProgramForm | null> {
    try {
      const targetId = normalizeFormIdentifier(formId);
      const response = await authFetch(`${API_BASE}/program_forms/${targetId}/`);
      if (!response.ok) {
        // Gracefully return null to let callers show fallback UI
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching form:', error);
      return null;
    }
  },

  async setActiveForm(programId: string, formId: string): Promise<boolean> {
    try {
      // Try nested endpoint first
      const targetId = normalizeFormIdentifier(formId);
      let response = await authFetch(`${API_BASE}/programs/${programId}/forms/${targetId}/set-active/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 404) {
        // Fallback to flat endpoint
        response = await authFetch(`${API_BASE}/program_forms/${targetId}/set-active/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to set active form: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting active form:', error);
      return false;
    }
  },

  async deleteForm(formId: string): Promise<boolean> {
    try {
      const targetId = normalizeFormIdentifier(formId);
      const response = await authFetch(`${API_BASE}/program_forms/${targetId}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete form: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      return false;
    }
  },

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    try {
      const targetId = normalizeFormIdentifier(formId);
      const response = await authFetch(`${API_BASE}/program_forms/${targetId}/responses/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch form responses: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching form responses:', error);
      return [];
    }
  },

  async createForm(formData: {
    name: string;
    description?: string;
    program: number;
    steps: FormStep[];
  }): Promise<ProgramForm | null> {
    try {
      const response = await authFetch(`${API_BASE}/program_forms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to create form: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Form creation failed:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}). Please check the server logs.`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating form:', error);
      return null;
    }
  },

  async updateForm(formId: string, formData: {
    title?: string;
    description?: string;
    fields?: FormFieldPayload[];
    steps?: Array<Record<string, unknown>>;
    layout_config?: Record<string, unknown>;
  }): Promise<ProgramForm | null> {
    try {
      const targetId = normalizeFormIdentifier(formId);
      const response = await authFetch(`${API_BASE}/program_forms/${targetId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to update form: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Form update failed:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}). Please check the server logs.`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating form:', error);
      return null;
    }
  }
};
