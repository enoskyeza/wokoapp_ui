import type { FormFieldPayload } from '@/services/formsService';

enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const API_BASE = process.env.NODE_ENV === Env.PRODUCTION
  ? 'https://kyeza.pythonanywhere.com/register'
  : 'http://127.0.0.1:8000/register'

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
  conditional_logic?: unknown;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
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
  conditional_logic?: unknown;
}

export interface FormStructure {
  id?: number | string;
  title?: string;
  name?: string;
  description?: string;
  program?: number | string;
  fields: FormStructureField[];
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
      let response = await fetch(`${API_BASE}/programs/${programId}/forms/`);
      
      // If 404, try the flat endpoint as fallback
      if (response.status === 404) {
        response = await fetch(`${API_BASE}/program_forms/?program=${programId}`);
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
      let response = await fetch(`${API_BASE}/programs/${programId}/forms/${formId}/inactivate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 404) {
        // Fallback to flat endpoint
        response = await fetch(`${API_BASE}/program_forms/${formId}/inactivate/`, {
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
    try {
      const response = await fetch(`${API_BASE}/program_forms/${formId}/structure/`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching form structure:', error);
      return null;
    }
  },

  async getFormById(formId: string): Promise<ProgramForm | null> {
    try {
      const response = await fetch(`${API_BASE}/program_forms/${formId}/`);
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
      let response = await fetch(`${API_BASE}/programs/${programId}/forms/${formId}/set-active/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 404) {
        // Fallback to flat endpoint
        response = await fetch(`${API_BASE}/program_forms/${formId}/set-active/`, {
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
      const response = await fetch(`${API_BASE}/program_forms/${formId}/`, {
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
      const response = await fetch(`${API_BASE}/program_forms/${formId}/responses/`);
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
      const response = await fetch(`${API_BASE}/program_forms/`, {
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
  }): Promise<ProgramForm | null> {
    try {
      const response = await fetch(`${API_BASE}/program_forms/${formId}/`, {
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
