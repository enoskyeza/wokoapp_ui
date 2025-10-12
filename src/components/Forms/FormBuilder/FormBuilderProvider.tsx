'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { programService } from '@/services/programService';
import { programFormService, type ConditionGroup } from '@/services/programFormService';
import { createFieldFromPayload } from './utils';
import type { FormBuilderData, ProgramOption, FormStep } from './types';
import type { FormFieldPayload } from '@/services/formsService';
import type { ConditionalLogic, ConditionalRule } from '@/stores/formBuilderStore';

interface FormBuilderContextValue {
  // Store access
  store: ReturnType<typeof useFormBuilderStore>;
  
  // Computed values
  isEditMode: boolean;
  combinedSteps: FormStep[];
  
  // Actions
  loadFormData: (formId: string) => Promise<void>;
  saveForm: () => Promise<void>;
  saveDraft: () => void;
}

const FormBuilderContext = createContext<FormBuilderContextValue | null>(null);

export function useFormBuilderContext() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilderContext must be used within FormBuilderProvider');
  }
  return context;
}

interface FormBuilderProviderProps {
  children: ReactNode;
  formId?: string;
}

// Default static steps
const defaultStaticSteps = [
  {
    id: 'static-guardian',
    title: 'Guardian Information',
    description: '',
    layoutColumns: 2,
    fields: [
      { id: 'guardian-first-name', field_name: 'guardian_first_name', type: 'text', label: 'First Name', required: true },
      { id: 'guardian-last-name', field_name: 'guardian_last_name', type: 'text', label: 'Last Name', required: true },
      { id: 'guardian-email', field_name: 'guardian_email', type: 'email', label: 'Email Address', required: false },
      { id: 'guardian-phone', field_name: 'guardian_phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'guardian-profession', field_name: 'guardian_profession', type: 'text', label: 'Profession', required: false },
      { id: 'guardian-address', field_name: 'guardian_address', type: 'text', label: 'Address', required: false },
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
        type: 'text',
        label: 'Participants (Multiple participants can be added)',
        required: true,
      },
      {
        id: 'participant-school',
        field_name: 'participant_school',
        type: 'text',
        label: 'School (Search and select or add new)',
        required: true,
      },
    ],
  },
];

const STEP_ALLOWED_OPERATORS = new Set<ConditionalRule['op']>([
  'equals',
  'not_equals',
  'contains',
  'is_empty',
  'not_empty',
]);

const normalizeStepConditionalLogic = (
  group?: ConditionGroup | null,
): ConditionalLogic | undefined => {
  if (!group || !Array.isArray(group.rules) || group.rules.length === 0) {
    return undefined;
  }

  const mode: ConditionalLogic['mode'] = group.mode === 'any' ? 'any' : 'all';

  const rules = group.rules
    .map((rule) => {
      if (!rule || typeof rule !== 'object') return null;
      const field = (rule as { field?: string }).field;
      const opCandidate = ((rule as { op?: string; operator?: string }).op ??
        (rule as { operator?: string }).operator) as ConditionalRule['op'] | undefined;
      if (!field || !opCandidate) return null;
      const op = STEP_ALLOWED_OPERATORS.has(opCandidate) ? opCandidate : 'equals';
      const value =
        rule.value == null || typeof rule.value === 'string'
          ? (rule.value ?? '')
          : String(rule.value);
      return { field, op, value };
    })
    .filter((entry): entry is ConditionalRule => Boolean(entry));

  if (!rules.length) {
    return undefined;
  }

  return { mode, rules };
};

export function FormBuilderProvider({ children, formId }: FormBuilderProviderProps) {
  const store = useFormBuilderStore();

  useEffect(() => {
    store.reset();
    return () => {
      store.reset();
    };
  }, []);

  const isEditMode = Boolean(formId);
  const combinedSteps = [...defaultStaticSteps, ...store.formData.steps];

  // Load programs on mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const list = await programService.getAllPrograms();
        // Filter out inactive/archived programs - only show active programs
        const activePrograms = list.filter((p) => p.active === true);
        const programs: ProgramOption[] = activePrograms.map((p) => ({ 
          id: String(p.id), 
          title: p.name 
        }));
        store.setPrograms(programs);
      } catch (error) {
        console.error('Failed to load programs:', error);
      }
    };

    loadPrograms();
  }, []);

  // Load selected program data when programId changes
  useEffect(() => {
    const loadSelectedProgram = async () => {
      const programId = store.formData.basic.programId;
      if (!programId) {
        store.setSelectedProgram(null);
        return;
      }

      try {
        const program = await programService.getProgramById(programId);
        store.setSelectedProgram(program);
      } catch (error) {
        console.error('Failed to load selected program:', error);
        store.setSelectedProgram(null);
      }
    };

    loadSelectedProgram();
  }, [store.formData.basic.programId]); // Removed 'store' dependency to prevent loop

  // Load form data if formId is provided
  useEffect(() => {
    if (formId) {
      store.setFormId(formId);
      loadFormData(formId);
    }
  }, [formId, store]);

  const loadFormData = async (formId: string) => {
    try {
      store.setIsLoading(true);
      store.setNotFound(false);

      const structure = await programFormService.getFormStructure(formId);
      
      if (!structure) {
        // Fallback to basic form data
        const fallback = await programFormService.getFormById(formId);
        if (!fallback) {
          store.setNotFound(true);
          return;
        }

        const programIdValue = typeof fallback.program === 'number' || typeof fallback.program === 'string'
          ? String(fallback.program)
          : '';

        const mapped: FormBuilderData = {
          basic: {
            name: fallback.title || fallback.name || '',
            description: fallback.description || '',
            programId: programIdValue,
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
          layoutConfig: { columns: 4 },
        };

        store.setFormData(mapped);
        return;
      }

      // Process structure data
      const programId = structure.program;
      const layoutColumns = structure.layout_config?.columns
        ? Number(structure.layout_config.columns)
        : 4;
      
      const structureFields = Array.isArray(structure.fields) ? structure.fields : [];
      const dynamicFields = structureFields.filter((field) => !field.is_static);
      const fieldMap = new Map<string, typeof dynamicFields[number]>();
      
      dynamicFields.forEach((field) => {
        const key = field.field_name || String(field.id || '');
        if (key) {
          fieldMap.set(key, field);
        }
      });

      const structureSteps = Array.isArray(structure.steps) ? structure.steps : [];
      const dynamicStepsFromStructure = structureSteps.filter((step) => !step.is_static);

      let finalSteps;
      
      if (dynamicStepsFromStructure.length > 0) {
        // Use step metadata
        finalSteps = dynamicStepsFromStructure.map((step, index) => {
          const key = step.key || step.title || `step-${index + 1}`;
          const fields = Array.isArray(step.fields) ? step.fields : [];
          
          const builderFields = fields.map((field, fieldIndex) => {
            const lookupKey = field.field_name || String(field.id || field.name || `field-${fieldIndex}`);
            const source = lookupKey && fieldMap.has(lookupKey) ? fieldMap.get(lookupKey)! : field;
            
            const payload: FormFieldPayload = {
              field_name: source.field_name || `field_${index}_${fieldIndex}`,
              label: source.label,
              field_type: source.field_type as FormFieldPayload['field_type'],
              is_required: Boolean(source.is_required ?? source.required),
              help_text: source.help_text,
              order: typeof source.order === 'number' ? source.order : undefined,
              options: source.options,
              max_length: source.max_length ?? null,
              min_value: source.min_value ?? null,
              max_value: source.max_value ?? null,
              allowed_file_types: source.allowed_file_types ?? undefined,
              max_file_size: source.max_file_size ?? undefined,
              conditional_logic: source.conditional_logic as FormFieldPayload['conditional_logic'],
              column_span: source.column_span ?? layoutColumns,
              step_key: source.step_key || key,
            };
            
            return createFieldFromPayload(payload, `existing-${index}`);
          });

          return {
            id: key,
            key,
            title: step.title || `Additional Information ${index + 1}`,
            description: step.description || '',
            fields: builderFields,
            perParticipant: step.per_participant ?? true,
            layoutColumns: step.layout?.columns ? Number(step.layout.columns) : layoutColumns,
            conditionalLogic: normalizeStepConditionalLogic(step.conditional_logic),
          };
        });
      } else {
        // Group fields by order buckets
        const stepsByBucket = new Map<number, any[]>();
        
        dynamicFields.forEach((field) => {
          const order = typeof field.order === 'number' ? field.order : 0;
          const bucket = Math.floor(order / 100);
          
          const payload: FormFieldPayload = {
            field_name: field.field_name || `field_${bucket}`,
            label: field.label,
            field_type: field.field_type as FormFieldPayload['field_type'],
            is_required: Boolean(field.is_required ?? field.required),
            help_text: field.help_text,
            order,
            options: field.options,
            max_length: field.max_length ?? null,
            min_value: field.min_value ?? null,
            max_value: field.max_value ?? null,
            allowed_file_types: field.allowed_file_types ?? undefined,
            max_file_size: field.max_file_size ?? undefined,
            conditional_logic: field.conditional_logic as FormFieldPayload['conditional_logic'],
            column_span: field.column_span ?? layoutColumns,
          };
          
          const builderField = createFieldFromPayload(payload, `existing-${bucket}`);
          
          if (!stepsByBucket.has(bucket)) {
            stepsByBucket.set(bucket, []);
          }
          stepsByBucket.get(bucket)!.push(builderField);
        });

        finalSteps = Array.from(stepsByBucket.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([idx, fields], position) => ({
            id: `step-${idx}`,
            key: `step-${idx}`,
            title: `Additional Information ${position + 1}`,
            description: 'Program-specific requirements',
            fields,
            perParticipant: true,
            layoutColumns,
            conditionalLogic: undefined,
          }));
      }

      const mapped: FormBuilderData = {
        basic: {
          name: structure.title || structure.name || '',
          description: structure.description || '',
          programId: programId ? String(programId) : '',
        },
        steps: finalSteps.length ? finalSteps : [
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
          columns: layoutColumns,
        },
      };

      store.setFormData(mapped);
    } catch (error) {
      console.error('Failed to load form data:', error);
      store.setNotFound(true);
    } finally {
      store.setIsLoading(false);
    }
  };

  const saveForm = async () => {
    // This will be implemented in the main component
    throw new Error('saveForm should be implemented in the main component');
  };

  const saveDraft = () => {
    if (isEditMode) return;
    const key = `form_builder_draft_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(store.formData));
  };

  const contextValue: FormBuilderContextValue = {
    store,
    isEditMode,
    combinedSteps,
    loadFormData,
    saveForm,
    saveDraft,
  };

  return (
    <FormBuilderContext.Provider value={contextValue}>
      {children}
    </FormBuilderContext.Provider>
  );
}
