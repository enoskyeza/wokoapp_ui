/**
 * Shared TypeScript types for Form Builder
 * Centralized type definitions used across all form builder components
 */

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
  // Additional properties for enhanced UX
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
    min?: number;
    max?: number;
  };
  helpText?: string; // Alternative camelCase for UI
  cssClass?: string;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number;
  conditional_logic?: ConditionalLogic;
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
  active?: boolean;
}

export const FIELD_TYPES = [
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

export const CONDITIONAL_OPERATORS: ConditionalOperator[] = [
  'equals',
  'not_equals',
  'contains',
  'is_empty',
  'not_empty',
  '>',
  '>=',
  '<',
  '<=',
];

export const COLUMN_CLASS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};
