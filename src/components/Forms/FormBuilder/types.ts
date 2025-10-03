// Re-export types from store for convenience
export type {
  FieldTypeUI,
  ConditionalRule,
  ConditionalLogic,
  FormField,
  FormStep,
  FormBuilderData,
  ProgramOption,
  FormBuilderUIState,
  FormBuilderState,
} from '@/stores/formBuilderStore';

// Additional types specific to form builder components
export interface FormBuilderEditorProps {
  formId?: string;
}

export interface FieldEditorProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
}

export interface ConditionalLogicEditorProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
  availableFields: FormField[];
  programCategoryFields?: FormField[];
  participantFields?: FormField[];
}

export interface FieldRendererProps {
  field: FormField;
  mode: 'edit' | 'preview';
  value?: unknown;
  onChange?: (value: unknown) => void;
  className?: string;
}

export interface StepEditorProps {
  stepIndex: number;
}

export interface FormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormSettingsProps {
  className?: string;
}

export interface FormBuilderHeaderProps {
  onSave?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
}

// Field type options for dropdowns
export const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'file', label: 'File Upload' },
] as const;

// Conditional logic operators
export const conditionalOperators = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'not_empty', label: 'not empty' },
] as const;

// Static steps that are always present
export const defaultStaticSteps = [
  {
    id: 'static-guardian',
    title: 'Guardian Information',
    description: '',
    layoutColumns: 2,
    fields: [
      { id: 'guardian-first-name', field_name: 'guardian_first_name', type: 'text' as const, label: 'First Name', required: true },
      { id: 'guardian-last-name', field_name: 'guardian_last_name', type: 'text' as const, label: 'Last Name', required: true },
      { id: 'guardian-email', field_name: 'guardian_email', type: 'email' as const, label: 'Email Address', required: false },
      { id: 'guardian-phone', field_name: 'guardian_phone', type: 'tel' as const, label: 'Phone Number', required: true },
      { id: 'guardian-profession', field_name: 'guardian_profession', type: 'text' as const, label: 'Profession', required: false },
      { id: 'guardian-address', field_name: 'guardian_address', type: 'text' as const, label: 'Address', required: false },
    ],
  },
  {
    id: 'static-participants',
    title: 'Participant Information',
    description: '',
    layoutColumns: 2,
    fields: [
      {
        id: 'participants-list',
        field_name: 'participants_list',
        type: 'text' as const,
        label: 'Participants (Multiple participants can be added)',
        required: true,
      },
      {
        id: 'participant-school',
        field_name: 'participant_school',
        type: 'text' as const,
        label: 'School (Search and select or add new)',
        required: true,
      },
    ],
  },
] as const;

// Backend-based field definitions for conditional logic
// These match the actual backend STATIC_GUARDIAN_TEMPLATE and STATIC_PARTICIPANT_TEMPLATE

export const getGuardianFields = () => [
  {
    id: 'guardian-first-name',
    field_name: 'guardian_first_name',
    type: 'text' as const,
    label: 'First Name',
    required: false,
  },
  {
    id: 'guardian-last-name',
    field_name: 'guardian_last_name',
    type: 'text' as const,
    label: 'Last Name',
    required: false,
  },
  {
    id: 'guardian-email',
    field_name: 'guardian_email',
    type: 'email' as const,
    label: 'Email Address',
    required: false,
  },
  {
    id: 'guardian-phone',
    field_name: 'guardian_phone',
    type: 'tel' as const,
    label: 'Phone Number',
    required: false,
  },
  {
    id: 'guardian-profession',
    field_name: 'guardian_profession',
    type: 'text' as const,
    label: 'Profession',
    required: false,
  },
  {
    id: 'guardian-address',
    field_name: 'guardian_address',
    type: 'text' as const,
    label: 'Address',
    required: false,
  },
];

export const getParticipantFields = () => [
  {
    id: 'participants-list',
    field_name: 'participants_list',
    type: 'text' as const,
    label: 'Participants (Multiple participants can be added)',
    required: false,
  },
  {
    id: 'participant-school',
    field_name: 'participant_school',
    type: 'text' as const,
    label: 'School (Search and select or add new)',
    required: false,
  },
];

// Dynamic program category field based on actual program data
export const getProgramCategoryFields = (selectedProgram?: any) => {
  if (!selectedProgram?.category_label) return [];
  
  return [
    {
      id: 'participant-category',
      field_name: 'participant_category',
      type: 'select' as const,
      label: selectedProgram.category_label,
      required: false,
      options: selectedProgram.category_options || [],
    },
  ];
};
