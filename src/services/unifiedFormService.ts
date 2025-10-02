import { buildAuthHeaders } from '@/lib/authHeaders';

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

// Align with programFormService base
const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register';

const createAuthHeaders = (headers?: HeadersInit): Headers => {
  const merged = new Headers(headers ?? {});
  const authHeaders = buildAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value && !merged.has(key)) merged.set(key, value);
  });
  return merged;
};

const authFetch = (input: string, init: RequestInit = {}) => {
  const headers = createAuthHeaders(init.headers);
  return fetch(input, { ...init, headers, credentials: 'include' });
};

export type ConditionalOp = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty' | '>' | '>=' | '<' | '<=';

export interface ConditionalRuleDTO {
  field: string;
  op: ConditionalOp;
  value?: string | number | boolean | null;
}

export interface ConditionalLogicDTO {
  mode: 'all' | 'any';
  rules: ConditionalRuleDTO[];
}

export interface FormFieldDTO {
  id: string | number;
  field_name: string;
  label: string;
  field_type: string; // backend type
  is_required: boolean;
  help_text?: string;
  order?: number;
  options?: string[];
  max_length?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  allowed_file_types?: string[] | null;
  max_file_size?: number | null;
  conditional_logic?: ConditionalLogicDTO | null;
  column_span?: number | null; // 1-4
}

export interface FormStepDTO {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldDTO[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number; // default 4
  conditional_logic?: ConditionalLogicDTO | null;
  type?: 'static' | 'dynamic';
}

export interface CompleteFormDTO {
  id: number;
  title: string;
  description?: string;
  program: { id: number; name: string } | null;
  is_active?: boolean;
  steps: FormStepDTO[];
}

export const unifiedFormService = {
  // Single source of truth: complete structure by form id
  async getFormDefinition(formId: number | string): Promise<CompleteFormDTO> {
    // Primary endpoint implemented in Phase 4 backend docs
    // Fallbacks kept for compatibility
    const candidates = [
      `${API_BASE}/program_forms/${formId}/structure/`, // preferred
      `${API_BASE}/program-forms/${formId}/structure/`, // alt naming
      `${API_BASE}/forms/${formId}/complete-structure/`, // legacy
    ];

    let lastError: any;
    for (const url of candidates) {
      try {
        const res = await authFetch(url, { method: 'GET' });
        if (res.ok) return (await res.json()) as CompleteFormDTO;
        lastError = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError ?? new Error('Unable to fetch form definition');
  },

  // Get all forms for a program with complete structures, if supported
  async getProgramForms(programId: number | string): Promise<CompleteFormDTO[]> {
    const candidates = [
      `${API_BASE}/programs/${programId}/forms/complete/`,
      `${API_BASE}/programs/${programId}/forms/`, // may return basic; caller should map
    ];

    let lastError: any;
    for (const url of candidates) {
      try {
        const res = await authFetch(url, { method: 'GET' });
        if (res.ok) return (await res.json()) as CompleteFormDTO[];
        lastError = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError ?? new Error('Unable to fetch program forms');
  },
};
