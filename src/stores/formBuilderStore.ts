import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Core types shared with the builder
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

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'is_empty'
  | 'not_empty'
  | '>'
  | '>='
  | '<'
  | '<=';

export interface ConditionalRule {
  field: string;
  op: ConditionalOperator;
  value?: string | number | boolean | null;
}

export interface ConditionalLogicConfig {
  mode: 'all' | 'any';
  rules: ConditionalRule[];
}

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
  conditional_logic?: ConditionalLogicConfig;
  columnSpan?: number; // 1-4
}

export interface FormStepState {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldState[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number; // default 4
  conditional_logic?: ConditionalLogicConfig;
}

export interface FormMetadataState {
  name: string;
  description?: string;
  programId?: string;
}

export type BuilderMode = 'edit' | 'preview';

interface UIState {
  mode: BuilderMode;
  selectedStepId?: string;
  selectedFieldId?: string;
}

interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export interface FormBuilderState {
  // Core data
  basic: FormMetadataState;
  steps: FormStepState[];
  layoutConfig: { columns: number };

  // UI state
  ui: UIState;

  // History
  history: HistoryState;

  // Actions: metadata
  setBasic: (basic: Partial<FormMetadataState>) => void;

  // Actions: steps
  addStep: (step: FormStepState) => void;
  updateStep: (id: string, patch: Partial<FormStepState>) => void;
  removeStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;

  // Actions: fields
  addField: (stepId: string, field: FormFieldState) => void;
  updateField: (stepId: string, fieldId: string, patch: Partial<FormFieldState>) => void;
  removeField: (stepId: string, fieldId: string) => void;
  reorderField: (stepId: string, fromIndex: number, toIndex: number) => void;

  // Actions: UI
  setMode: (mode: BuilderMode) => void;
  selectStep: (stepId?: string) => void;
  selectField: (fieldId?: string) => void;

  // Layout
  setLayoutColumns: (columns: number) => void;

  // Utilities
  reset: () => void;
}

const initialState: Pick<FormBuilderState, 'basic' | 'steps' | 'layoutConfig' | 'ui' | 'history'> = {
  basic: { name: '', description: '', programId: '' },
  steps: [],
  layoutConfig: { columns: 4 },
  ui: { mode: 'edit', selectedStepId: undefined, selectedFieldId: undefined },
  history: { canUndo: false, canRedo: false },
};

export const useFormBuilderStore = create<FormBuilderState>()(
  devtools((set, get) => ({
    ...initialState,

    setBasic: (basic) => set((state) => ({ basic: { ...state.basic, ...basic } })),

    addStep: (step) => set((state) => ({ steps: [...state.steps, step] })),
    updateStep: (id, patch) =>
      set((state) => ({ steps: state.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
    removeStep: (id) => set((state) => ({ steps: state.steps.filter((s) => s.id !== id) })),
    reorderSteps: (fromIndex, toIndex) =>
      set((state) => {
        const steps = [...state.steps];
        const [moved] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, moved);
        return { steps };
      }),

    addField: (stepId, field) =>
      set((state) => ({
        steps: state.steps.map((s) => (s.id === stepId ? { ...s, fields: [...s.fields, field] } : s)),
      })),
    updateField: (stepId, fieldId, patch) =>
      set((state) => ({
        steps: state.steps.map((s) =>
          s.id !== stepId
            ? s
            : { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) },
        ),
      })),
    removeField: (stepId, fieldId) =>
      set((state) => ({
        steps: state.steps.map((s) =>
          s.id !== stepId ? s : { ...s, fields: s.fields.filter((f) => f.id !== fieldId) },
        ),
      })),
    reorderField: (stepId, fromIndex, toIndex) =>
      set((state) => ({
        steps: state.steps.map((s) => {
          if (s.id !== stepId) return s;
          const fields = [...s.fields];
          const [moved] = fields.splice(fromIndex, 1);
          fields.splice(toIndex, 0, moved);
          return { ...s, fields };
        }),
      })),

    setMode: (mode) => set((state) => ({ ui: { ...state.ui, mode } })),
    selectStep: (selectedStepId) => set((state) => ({ ui: { ...state.ui, selectedStepId } })),
    selectField: (selectedFieldId) => set((state) => ({ ui: { ...state.ui, selectedFieldId } })),

    setLayoutColumns: (columns) => set(() => ({ layoutConfig: { columns: Math.max(1, Math.min(12, columns)) } })),

    reset: () => set(() => ({ ...initialState })),
  }))
);
