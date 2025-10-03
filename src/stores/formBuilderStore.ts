import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

// Types
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

export interface ConditionalRule {
  field: string;
  op: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty';
  value?: string;
}

export interface ConditionalLogic {
  mode: 'all' | 'any';
  rules: ConditionalRule[];
}

export interface FormField {
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
  conditional_logic?: ConditionalLogic;
  columnSpan?: number;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  layoutColumns: number;
  fields: FormField[];
  conditionalLogic?: ConditionalLogic;
  key?: string;
  perParticipant?: boolean;
}

export interface FormBuilderData {
  basic: {
    name: string;
    description: string;
    programId: string;
  };
  steps: FormStep[];
  layoutConfig: {
    columns: number;
  };
}

export interface ProgramOption {
  id: string;
  title: string;
}

// UI State
export interface FormBuilderUIState {
  activeStep: number;
  showPreview: boolean;
  previewStep: number;
  previewAnswers: Record<string, unknown>;
  isSaving: boolean;
  isLoading: boolean;
  notFound: boolean;
}

// Store State
export interface FormBuilderState {
  // Data
  formData: FormBuilderData;
  programs: ProgramOption[];
  selectedProgram: any | null; // Full program data with category info
  
  // UI State
  ui: FormBuilderUIState;
  
  // Form ID (for edit mode)
  formId?: string;
  
  // Actions
  setFormData: (data: FormBuilderData) => void;
  setPrograms: (programs: ProgramOption[]) => void;
  setSelectedProgram: (program: any | null) => void;
  setFormId: (formId?: string) => void;
  
  // Basic form actions
  updateBasic: (field: keyof FormBuilderData['basic'], value: string) => void;
  updateLayoutConfig: (columns: number) => void;
  
  // Step actions
  addStep: () => void;
  updateStep: (index: number, key: keyof FormStep, value: FormStep[keyof FormStep]) => void;
  removeStep: (index: number) => void;
  updateStepConditionalLogic: (stepIndex: number, conditionalLogic: ConditionalLogic | undefined) => void;
  setActiveStep: (step: number) => void;
  
  // Field actions
  addField: (stepIndex: number) => void;
  updateField: (stepIndex: number, fieldIndex: number, updates: Partial<FormField>) => void;
  removeField: (stepIndex: number, fieldIndex: number) => void;
  
  // Conditional logic actions
  addConditionalRule: (stepIndex: number, fieldIndex: number) => void;
  updateConditionalRule: (stepIndex: number, fieldIndex: number, ruleIndex: number, updates: Partial<ConditionalRule>) => void;
  removeConditionalRule: (stepIndex: number, fieldIndex: number, ruleIndex: number) => void;
  updateConditionalMode: (stepIndex: number, fieldIndex: number, mode: 'all' | 'any') => void;
  
  // UI actions
  setShowPreview: (show: boolean) => void;
  setPreviewStep: (step: number) => void;
  setPreviewAnswer: (key: string, value: unknown) => void;
  setIsSaving: (saving: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setNotFound: (notFound: boolean) => void;
  
  // Reset
  reset: () => void;
}

// Default data
const createDefaultFormData = (): FormBuilderData => ({
  basic: {
    name: '',
    description: '',
    programId: '',
  },
  steps: [
    {
      id: 'step-1',
      title: 'Additional Information',
      description: 'Program-specific requirements',
      fields: [
        {
          id: 'field-1',
          type: 'text',
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
  ],
  layoutConfig: {
    columns: 4,
  },
});

const createDefaultUIState = (): FormBuilderUIState => ({
  activeStep: 0,
  showPreview: false,
  previewStep: 0,
  previewAnswers: {},
  isSaving: false,
  isLoading: false,
  notFound: false,
});

// Utility functions
const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const clampColumnCount = (value?: number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 1;
  }
  return Math.min(4, Math.max(1, Math.floor(numeric)));
};

const clampColumnSpan = (value: number | null | undefined, columns: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, columns);
  }
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

// Store
export const useFormBuilderStore = create<FormBuilderState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      formData: createDefaultFormData(),
      programs: [],
      selectedProgram: null,
      ui: createDefaultUIState(),
      formId: undefined,

      // Setters
      setFormData: (data) => set((state) => {
        state.formData = data;
      }),

      setPrograms: (programs) => set((state) => {
        state.programs = programs;
      }),

      setSelectedProgram: (program) => set((state) => {
        state.selectedProgram = program;
      }),

      setFormId: (formId) => set((state) => {
        state.formId = formId;
      }),

      // Basic form actions
      updateBasic: (field, value) => set((state) => {
        state.formData.basic[field] = value;
      }),

      updateLayoutConfig: (columns) => set((state) => {
        const clampedColumns = clampColumnCount(columns);
        state.formData.layoutConfig.columns = clampedColumns;
        
        // Update all steps to use new column count
        state.formData.steps.forEach((step) => {
          const nextColumns = clampColumnCount(step.layoutColumns ?? clampedColumns);
          step.layoutColumns = nextColumns;
          
          // Update field column spans
          step.fields.forEach((field) => {
            field.columnSpan = clampColumnSpan(field.columnSpan ?? clampedColumns, nextColumns);
          });
        });
      }),

      // Step actions
      addStep: () => set((state) => {
        const timestamp = Date.now();
        const nextIndex = state.formData.steps.length;
        const newStep: FormStep = {
          id: `step-${timestamp}`,
          key: `step-${timestamp}`,
          title: `Step ${nextIndex + 1}`,
          description: 'New form step',
          fields: [],
          perParticipant: true,
          layoutColumns: state.formData.layoutConfig.columns,
        };
        
        state.formData.steps.push(newStep);
        state.ui.activeStep = nextIndex;
      }),

      updateStep: (index, key, value) => set((state) => {
        const step = state.formData.steps[index];
        if (!step) return;

        if (key === 'layoutColumns') {
          const columns = clampColumnCount(value as number);
          step.layoutColumns = columns;
          
          // Update field column spans
          step.fields.forEach((field) => {
            field.columnSpan = clampColumnSpan(field.columnSpan, columns);
          });
        } else {
          (step as any)[key] = value;
        }
      }),

      removeStep: (index) => set((state) => {
        state.formData.steps.splice(index, 1);
        // Adjust active step if necessary
        if (state.ui.activeStep >= state.formData.steps.length) {
          state.ui.activeStep = Math.max(0, state.formData.steps.length - 1);
        }
      }),

      updateStepConditionalLogic: (stepIndex, conditionalLogic) => set((state) => {
        const step = state.formData.steps[stepIndex];
        if (step) {
          step.conditionalLogic = conditionalLogic;
        }
      }),

      setActiveStep: (step) => set((state) => {
        state.ui.activeStep = step;
      }),

      // Field actions
      addField: (stepIndex) => set((state) => {
        const step = state.formData.steps[stepIndex];
        if (!step) return;

        const generatedName = slugify(`field_${Date.now()}`);
        const targetColumns = clampColumnCount(step.layoutColumns ?? state.formData.layoutConfig.columns);
        
        const newField: FormField = {
          id: `field-${Date.now()}`,
          type: 'text',
          label: 'New Field',
          required: false,
          field_name: generatedName,
          conditional_logic: { mode: 'all', rules: [] },
          columnSpan: targetColumns,
        };

        step.fields.push(newField);
      }),

      updateField: (stepIndex, fieldIndex, updates) => set((state) => {
        const step = state.formData.steps[stepIndex];
        const field = step?.fields[fieldIndex];
        if (!step || !field) return;

        const stepColumns = clampColumnCount(step.layoutColumns ?? state.formData.layoutConfig.columns);

        // Apply updates
        Object.assign(field, updates);

        // Auto-generate field_name from label if needed
        if (typeof updates.label === 'string' && (!field.field_name || field.field_name.startsWith('field_'))) {
          field.field_name = slugify(updates.label) || field.field_name || slugify(`field_${Date.now()}`);
        }

        // Handle field_name updates
        if (typeof updates.field_name === 'string') {
          const trimmed = updates.field_name.trim();
          field.field_name = trimmed ? slugify(trimmed) : slugify(field.label || `field_${Date.now()}`);
        }

        // Clamp column span
        if (Object.prototype.hasOwnProperty.call(updates, 'columnSpan')) {
          field.columnSpan = clampColumnSpan(Number(field.columnSpan), stepColumns);
        } else {
          field.columnSpan = clampColumnSpan(field.columnSpan, stepColumns);
        }
      }),

      removeField: (stepIndex, fieldIndex) => set((state) => {
        const step = state.formData.steps[stepIndex];
        if (!step) return;

        step.fields.splice(fieldIndex, 1);
      }),

      // Conditional logic actions
      addConditionalRule: (stepIndex, fieldIndex) => set((state) => {
        const field = state.formData.steps[stepIndex]?.fields[fieldIndex];
        if (!field) return;

        if (!field.conditional_logic) {
          field.conditional_logic = { mode: 'all', rules: [] };
        }

        field.conditional_logic.rules.push({
          field: '',
          op: 'equals',
          value: '',
        });
      }),

      updateConditionalRule: (stepIndex, fieldIndex, ruleIndex, updates) => set((state) => {
        const field = state.formData.steps[stepIndex]?.fields[fieldIndex];
        const rule = field?.conditional_logic?.rules[ruleIndex];
        if (!rule) return;

        Object.assign(rule, updates);
      }),

      removeConditionalRule: (stepIndex, fieldIndex, ruleIndex) => set((state) => {
        const field = state.formData.steps[stepIndex]?.fields[fieldIndex];
        if (!field?.conditional_logic) return;

        field.conditional_logic.rules.splice(ruleIndex, 1);
      }),

      updateConditionalMode: (stepIndex, fieldIndex, mode) => set((state) => {
        const field = state.formData.steps[stepIndex]?.fields[fieldIndex];
        if (!field) return;

        if (!field.conditional_logic) {
          field.conditional_logic = { mode, rules: [] };
        } else {
          field.conditional_logic.mode = mode;
        }
      }),

      // UI actions
      setShowPreview: (show) => set((state) => {
        state.ui.showPreview = show;
      }),

      setPreviewStep: (step) => set((state) => {
        state.ui.previewStep = step;
      }),

      setPreviewAnswer: (key, value) => set((state) => {
        state.ui.previewAnswers[key] = value;
      }),

      setIsSaving: (saving) => set((state) => {
        state.ui.isSaving = saving;
      }),

      setIsLoading: (loading) => set((state) => {
        state.ui.isLoading = loading;
      }),

      setNotFound: (notFound) => set((state) => {
        state.ui.notFound = notFound;
      }),

      // Reset
      reset: () => set((state) => {
        state.formData = createDefaultFormData();
        state.programs = [];
        state.selectedProgram = null;
        state.ui = createDefaultUIState();
        state.formId = undefined;
      }),
    }))
  )
);

// Selectors
export const useFormData = () => useFormBuilderStore((state) => state.formData);
export const usePrograms = () => useFormBuilderStore((state) => state.programs);
export const useFormBuilderUI = () => useFormBuilderStore((state) => state.ui);
export const useFormId = () => useFormBuilderStore((state) => state.formId);
export const useIsEditMode = () => useFormBuilderStore((state) => Boolean(state.formId));
