'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  GripVertical,
  Layout,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { programService } from '@/services/programService';
import { formsService, type CreateProgramFormPayload, type FormFieldPayload } from '@/services/formsService';
import { programFormService } from '@/services/programFormService';
import { evaluateConditions, type ConditionGroup, type ConditionContext } from '@/components/Registration/conditionUtils';

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

interface ConditionalRule {
  field: string;
  op: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty';
  value?: string;
}

interface ConditionalLogic {
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
  fields: FormField[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number;
}

interface FormBuilderData {
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

interface ProgramOption {
  id: string;
  title: string;
}

const fieldTypes = [
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
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const defaultStaticSteps: FormStep[] = [
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

const COLUMN_CLASS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-4',
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

const defaultFormData: FormBuilderData = {
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
};

function normalizeFormData(data?: Partial<FormBuilderData> | null): FormBuilderData {
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
        } as FormStep;
      })
    : defaultFormData.steps.map((step) => ({
        ...step,
        fields: step.fields.map((field) => ({ ...field })),
      }));

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

interface FormBuilderEditorProps {
  formId?: string;
}

function createFieldFromPayload(payload: FormFieldPayload, idPrefix = 'field'): FormField {
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
    conditional_logic: payload.conditional_logic as ConditionalLogic | undefined,
    columnSpan: payload.column_span ?? 4,
  };
}

function useInitialData(formId?: string) {
  const [loading, setLoading] = useState(Boolean(formId));
  const [initialData, setInitialData] = useState<FormBuilderData | null>(formId ? null : defaultFormData);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!formId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const structure = await programFormService.getFormStructure(formId);
        if (!structure) {
          const fallback = await programFormService.getFormById(formId);
          if (!fallback) {
            if (!cancelled) setNotFound(true);
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
            steps: defaultFormData.steps,
            layoutConfig: { columns: 4 },
          };

          if (!cancelled) {
            setInitialData(mapped);
          }
          return;
        }

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

        const mappedStepsFromMetadata: FormStep[] = dynamicStepsFromStructure.map((step, index) => {
          const key = step.key || step.title || `step-${index + 1}`;
          const fields = Array.isArray(step.fields) ? step.fields : [];
          const builderFields = fields.map((field, fieldIndex) => {
            const lookupKey = field.field_name || String(field.id || field.name || `field-${fieldIndex}`);
            const source = lookupKey && fieldMap.has(lookupKey) ? fieldMap.get(lookupKey)! : field;
            const payload: FormFieldPayload = {
              field_name: source.field_name || slugify(source.label || `field-${fieldIndex}`),
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
          };
        });

        let finalSteps = mappedStepsFromMetadata;
        if (!finalSteps.length) {
          const stepsByBucket = new Map<number, FormField[]>();
          dynamicFields.forEach((field) => {
            const order = typeof field.order === 'number' ? field.order : 0;
            const bucket = Math.floor(order / 100);
            const payload: FormFieldPayload = {
              field_name: field.field_name || slugify(field.label),
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
            }));
        }

        const mapped: FormBuilderData = {
          basic: {
            name: structure.title || structure.name || '',
            description: structure.description || '',
            programId: programId ? String(programId) : '',
          },
          steps: finalSteps.length ? finalSteps : defaultFormData.steps,
          layoutConfig: {
            columns: layoutColumns,
          },
        };

        if (!cancelled) {
          setInitialData(mapped);
        }
      } catch (error) {
        console.error('Failed to load form data', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formId]);

  return { loading, initialData, notFound };
}

function buildPayload(data: FormBuilderData): CreateProgramFormPayload {
  const mapType = (type: FieldTypeUI): FormFieldPayload['field_type'] => {
    if (type === 'select') return 'dropdown';
    if (type === 'tel') return 'phone';
    return type as FormFieldPayload['field_type'];
  };

  const stepsPayload = data.steps.map((step, sIdx) => {
    const stepKey = step.key || step.id || `step-${sIdx + 1}`;
    const layoutColumns = step.layoutColumns ?? data.layoutConfig.columns ?? 4;
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

function FormBuilderEditorInner({ formId }: FormBuilderEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, initialData, notFound } = useInitialData(formId);
  const [formData, setFormData] = useState<FormBuilderData>(() => {
    const normalized = normalizeFormData(initialData ?? defaultFormData);
    // Ensure programId is never null for Select component
    return {
      ...normalized,
      basic: {
        ...normalized.basic,
        programId: normalized.basic.programId || ''
      }
    };
  });
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  const combinedSteps = useMemo(() => [...defaultStaticSteps, ...formData.steps], [formData.steps]);
  const isEditMode = Boolean(formId);

  useEffect(() => {
    if (initialData) {
      const normalized = normalizeFormData(initialData);
      // Ensure programId is never null for Select component
      setFormData({
        ...normalized,
        basic: {
          ...normalized.basic,
          programId: normalized.basic.programId || ''
        }
      });
    }
  }, [initialData]);

  useEffect(() => {
    (async () => {
      const list = await programService.getAllPrograms();
      // Filter out inactive/archived programs - only show active programs in dropdown
      const activePrograms = list.filter((p) => p.active === true);
      setPrograms(activePrograms.map((p) => ({ id: String(p.id), title: p.name })));
    })();
  }, []);

  useEffect(() => {
    if (!formId) {
      const isResume = searchParams.get('resume') === 'true';
      if (isResume) {
        try {
          const resumeData = localStorage.getItem('form_builder_resume_draft');
          if (resumeData) {
            const parsed = JSON.parse(resumeData) as Partial<FormBuilderData>;
            setFormData(normalizeFormData(parsed));
            localStorage.removeItem('form_builder_resume_draft');
            toast.success('Draft loaded successfully!', {
              description: 'You can continue editing your form.',
            });
          }
        } catch (error) {
          console.error('Error loading resume draft:', error);
          toast.error('Failed to load draft');
        }
      }
    }
  }, [formId, searchParams]);

  const updateBasic = (field: keyof FormBuilderData['basic'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value,
      },
    }));
  };

  const addStep = () => {
    const timestamp = Date.now();
    const nextIndex = formData.steps.length;
    const newStep: FormStep = {
      id: `step-${timestamp}`,
      key: `step-${timestamp}`,
      title: `Step ${nextIndex + 1}`,
      description: 'New form step',
      fields: [],
      perParticipant: true,
      layoutColumns: formData.layoutConfig.columns,
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setActiveStep(nextIndex);
  };

  const updateStep = (index: number, key: keyof FormStep, value: FormStep[keyof FormStep]) => {
    setFormData((prev) => {
      const steps = prev.steps.map((step, idx) => {
        if (idx !== index) return step;

        if (key === 'layoutColumns') {
          const columns = clampColumnCount(value as number);
          return {
            ...step,
            layoutColumns: columns,
            fields: step.fields.map((field) => ({
              ...field,
              columnSpan: clampColumnSpan(field.columnSpan, columns),
            })),
          };
        }

        return { ...step, [key]: value };
      });

      return {
        ...prev,
        steps,
      };
    });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) {
      toast.error('At least one dynamic step is required');
      return;
    }
    setFormData((prev) => {
      const steps = prev.steps.filter((_, idx) => idx !== index);
      return {
        ...prev,
        steps,
      };
    });
    setActiveStep((prevActive) => Math.max(0, Math.min(prevActive, formData.steps.length - 2)));
  };

  const addField = (stepIndex: number) => {
    const generatedName = slugify(`field_${Date.now()}`);
    const targetColumns = clampColumnCount(
      formData.steps[stepIndex]?.layoutColumns ?? formData.layoutConfig.columns,
    );
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      field_name: generatedName,
      conditional_logic: { mode: 'all', rules: [] },
      columnSpan: targetColumns,
    };
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, idx) =>
        idx === stepIndex ? { ...step, fields: [...step.fields, newField] } : step,
      ),
    }));
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    setFormData((prev) => {
      const steps = prev.steps.map((step, sIdx) => {
        if (sIdx !== stepIndex) return step;

        const stepColumns = clampColumnCount(step.layoutColumns ?? prev.layoutConfig.columns);
        const fields = step.fields.map((field, fIdx) => {
          if (fIdx !== fieldIndex) return field;

          const nextField: FormField = { ...field, ...updates };

          if (
            typeof updates.label === 'string' &&
            (!field.field_name || field.field_name.startsWith('field_'))
          ) {
            nextField.field_name = slugify(updates.label) || field.field_name || slugify(`field_${Date.now()}`);
          }

          if (typeof updates.field_name === 'string') {
            const trimmed = updates.field_name.trim();
            nextField.field_name = trimmed ? slugify(trimmed) : slugify(nextField.label || `field_${Date.now()}`);
          }

          if (Object.prototype.hasOwnProperty.call(updates, 'columnSpan')) {
            nextField.columnSpan = clampColumnSpan(Number(nextField.columnSpan), stepColumns);
          } else {
            nextField.columnSpan = clampColumnSpan(nextField.columnSpan, stepColumns);
          }

          return nextField;
        });

        return { ...step, fields };
      });

      return { ...prev, steps };
    });
  };

  const removeField = (stepIndex: number, fieldIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, sIdx) =>
        sIdx === stepIndex
          ? { ...step, fields: step.fields.filter((_, fIdx) => fIdx !== fieldIndex) }
          : step,
      ),
    }));
  };

  const saveDraft = () => {
    if (formId) return;
    const key = `form_builder_draft_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(formData));
    toast.success('Draft saved to local storage');
  };

  const handleSave = async () => {
    if (!formData.basic.name.trim()) {
      toast.error('Please enter a form name');
      return;
    }
    if (!formData.basic.programId) {
      toast.error('Please select a program');
      return;
    }
    if (formData.steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }
    if (formData.steps.some((step) => step.fields.length === 0)) {
      toast.error('Each step must have at least one field');
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload(formData);
      if (isEditMode && formId) {
        await programFormService.updateForm(formId, {
          title: payload.title,
          description: payload.description,
          fields: payload.fields,
          steps: payload.steps,
          layout_config: payload.layout_config,
        });
        toast.success('Form updated successfully');
      } else {
        await formsService.createProgramForm(payload);
        toast.success('Form created successfully', {
          description: `"${formData.basic.name}" is ready for use`,
        });
      }

      router.push('/dashboard?tab=forms');
    } catch (error) {
      console.error('Error saving form', error);
      toast.error('Failed to save form', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const slugifyLabel = useCallback((value: string) => slugify(value), []);

  const renderPreviewField = (field: FormField, value: unknown, onChange: (v: unknown) => void) => {
    const key = field.field_name || slugifyLabel(field.label);

    if (field.type === 'textarea') {
      return (
        <Textarea
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <Select value={String(value ?? '')} onValueChange={(val) => onChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option) => (
              <SelectItem key={option} value={option} className="text-left">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'checkbox') {
      const arrayValue = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                checked={arrayValue.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...arrayValue, option]);
                  } else {
                    onChange(arrayValue.filter((item) => item !== option));
                  }
                }}
              />
              <Label className="text-sm text-gray-700">{option}</Label>
            </div>
          ))}
        </div>
      );
    }

    if (field.type === 'radio') {
      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name={key}
                value={option}
                checked={value === option}
                onChange={(event) => onChange(event.target.value)}
                className="h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === 'file') {
      return (
        <Input type="file" disabled className="cursor-not-allowed opacity-70" />
      );
    }

    return (
      <Input
        placeholder={field.placeholder}
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };

  const renderPreviewStep = (step: FormStep) => {
    const defaultColumns = clampColumnCount(formData.layoutConfig.columns);
    const columns = clampColumnCount(step.layoutColumns ?? defaultColumns);
    const gridColumnsClass = COLUMN_CLASS_MAP[columns] ?? COLUMN_CLASS_MAP[1];

    return (
      <Card key={step.id}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-blue-600" />
            {step.title}
          </CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${gridColumnsClass}`}>
            {step.fields.map((field) => {
              const ctx: ConditionContext = {
                guardian: {},
                participant: {},
                answers: previewAnswers,
              };
              const group = field.conditional_logic as ConditionGroup | undefined;
              const visible = evaluateConditions(group, ctx);
              if (!visible) return null;

              const key = field.field_name || slugifyLabel(field.label);
              const span = clampColumnSpan(field.columnSpan, columns);

              return (
                <div
                  key={field.id}
                  className="space-y-2"
                  style={{ gridColumn: `span ${span} / span ${span}` }}
                >
                  <Label className="text-sm font-medium text-gray-800">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.help_text && <p className="text-xs text-gray-500">{field.help_text}</p>}
                  {renderPreviewField(field, previewAnswers[key], (val) =>
                    setPreviewAnswers((prev) => ({ ...prev, [key]: val })),
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !initialData) {
    return (
      <div className="py-12 text-center text-gray-500">Loading form builder...</div>
    );
  }

  if (notFound) {
    return (
      <div className="py-12 text-center">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Form not found</CardTitle>
            <CardDescription>
              We couldn&apos;t find this form. It may have been deleted or the link is incorrect.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-2">
            <Link href="/dashboard?tab=forms">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
            <Link href="/dashboard?tab=forms" className="inline-flex">
              <Button className="text-theme-primary text-white hover:bg-blue-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forms
              </Button>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {!isEditMode && (
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={saveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Form'}
              </Button>
              <h1 className="text-xl font-bold text-blue-900">{isEditMode ? 'Edit Form' : 'Form Builder'}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Form Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Form Name</Label>
                  <Input
                    value={formData.basic.name}
                    onChange={(event) => updateBasic('name', event.target.value)}
                    placeholder="Registration Form"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.basic.description}
                    onChange={(event) => updateBasic('description', event.target.value)}
                    placeholder="Form description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Associated Program</Label>
                  <Select
                    value={formData.basic.programId || ''}
                    onValueChange={(value) => updateBasic('programId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id} className="text-left">
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Column Layout</Label>
                  <Select
                    value={String(formData.layoutConfig.columns)}
                    onValueChange={(value) =>
                      setFormData((prev) => {
                        const columns = clampColumnCount(Number(value));
                        return {
                          ...prev,
                          layoutConfig: {
                            ...prev.layoutConfig,
                            columns,
                          },
                          steps: prev.steps.map((step) => {
                            const nextColumns = clampColumnCount(step.layoutColumns ?? columns);
                            return {
                              ...step,
                              layoutColumns: nextColumns,
                              fields: step.fields.map((field) => ({
                                ...field,
                                columnSpan: clampColumnSpan(field.columnSpan ?? columns, nextColumns),
                              })),
                            };
                          }),
                        };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((option) => (
                        <SelectItem key={option} value={String(option)} className="text-left">
                          {option} column{option > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Used as the default span for new steps and fields (max 4 columns).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Steps</Label>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">System Steps</p>
                      <div className="mt-2 space-y-2">
                        {defaultStaticSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{step.title}</span>
                              <Badge variant="secondary" className="text-xs">
                                Step {index + 1}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Managed by the platform</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Custom Steps</p>
                      <div className="mt-2 space-y-2">
                        {formData.steps.map((step, index) => (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveStep(index)}
                            className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                              activeStep === index
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{step.title || `Custom Step ${index + 1}`}</span>
                              <Badge variant="outline">
                                Step {index + defaultStaticSteps.length + 1}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={addStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-600" />
                  Step Configuration
                </CardTitle>
                <CardDescription>
                  Configure the fields shown to applicants after the two system steps. You are editing step
                  {` ${activeStep + defaultStaticSteps.length + 1}`} in the application flow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Step Title</Label>
                    <Input
                      value={formData.steps[activeStep]?.title || ''}
                      onChange={(event) => updateStep(activeStep, 'title', event.target.value)}
                      placeholder="Step title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Step Description</Label>
                    <Input
                      value={formData.steps[activeStep]?.description || ''}
                      onChange={(event) => updateStep(activeStep, 'description', event.target.value)}
                      placeholder="Step description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Columns</Label>
                    <Select
                      value={String(formData.steps[activeStep]?.layoutColumns ?? formData.layoutConfig.columns)}
                      onValueChange={(value) => updateStep(activeStep, 'layoutColumns', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((option) => (
                          <SelectItem key={option} value={String(option)} className="text-left">
                            {option} column{option > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`per-participant-${activeStep}`}
                        checked={formData.steps[activeStep]?.perParticipant ?? true}
                        onCheckedChange={(checked) => updateStep(activeStep, 'perParticipant', Boolean(checked))}
                      />
                      <Label htmlFor={`per-participant-${activeStep}`} className="text-sm text-gray-600">
                        Repeat per participant
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.steps[activeStep]?.fields.map((field, fieldIndex) => (
                    <Card key={field.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">
                              {field.type}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="cursor-move text-gray-400 hover:text-gray-600"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4" />
                              </button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeField(activeStep, fieldIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Input
                                value={field.label}
                                onChange={(event) => updateField(activeStep, fieldIndex, { label: event.target.value })}
                                placeholder="Enter field label"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: FieldTypeUI) =>
                                  updateField(activeStep, fieldIndex, {
                                    type: value,
                                    options:
                                      ['select', 'checkbox', 'radio'].includes(value)
                                        ? field.options?.length
                                          ? field.options
                                          : ['Option 1']
                                        : undefined,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTypes.map((option) => (
                                    <SelectItem key={option.value} value={option.value as FieldTypeUI} className="text-left">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Field Name (optional)</Label>
                              <Input
                                value={field.field_name || ''}
                                onChange={(event) => updateField(activeStep, fieldIndex, { field_name: event.target.value })}
                                placeholder="Automatically generated if left blank"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Placeholder / Help</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(event) => updateField(activeStep, fieldIndex, { placeholder: event.target.value })}
                                placeholder="Placeholder text"
                              />
                            </div>
                          <div className="space-y-2">
                            <Label>Help Text</Label>
                            <Input
                              value={field.help_text || ''}
                              onChange={(event) => updateField(activeStep, fieldIndex, { help_text: event.target.value })}
                              placeholder="Help text for applicants"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Column Span</Label>
                            <Select
                              value={String(field.columnSpan ?? formData.steps[activeStep]?.layoutColumns ?? formData.layoutConfig.columns)}
                              onValueChange={(value) =>
                                updateField(activeStep, fieldIndex, { columnSpan: Number(value) })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4].map((option) => (
                                  <SelectItem key={option} value={String(option)} className="text-left">
                                    Span {option} column{option > 1 ? 's' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                  updateField(activeStep, fieldIndex, { required: Boolean(checked) })
                                }
                              />
                              <Label htmlFor={`required-${field.id}`}>Required field</Label>
                            </div>
                          </div>

                          {['select', 'checkbox', 'radio'].includes(field.type) && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              <div className="space-y-2">
                                {(field.options || []).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Input
                                      value={option}
                                      onChange={(event) => {
                                        const newOptions = [...(field.options || [])];
                                        newOptions[optionIndex] = event.target.value;
                                        updateField(activeStep, fieldIndex, { options: newOptions });
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions = (field.options || []).filter((_, idx) => idx !== optionIndex);
                                        updateField(activeStep, fieldIndex, { options: newOptions });
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const nextOptions = [...(field.options || []), `Option ${(field.options || []).length + 1}`];
                                    updateField(activeStep, fieldIndex, { options: nextOptions });
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}

                          {field.type === 'number' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Minimum Value</Label>
                                <Input
                                  type="number"
                                  value={field.min_value ?? ''}
                                  onChange={(event) =>
                                    updateField(activeStep, fieldIndex, {
                                      min_value: event.target.value ? Number(event.target.value) : null,
                                    })
                                  }
                                  placeholder="Minimum value"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Maximum Value</Label>
                                <Input
                                  type="number"
                                  value={field.max_value ?? ''}
                                  onChange={(event) =>
                                    updateField(activeStep, fieldIndex, {
                                      max_value: event.target.value ? Number(event.target.value) : null,
                                    })
                                  }
                                  placeholder="Maximum value"
                                />
                              </div>
                            </div>
                          )}

                          {['text', 'email', 'tel', 'url', 'textarea'].includes(field.type) && (
                            <div className="space-y-2">
                              <Label>Maximum Length</Label>
                              <Input
                                type="number"
                                value={field.max_length ?? ''}
                                onChange={(event) =>
                                  updateField(activeStep, fieldIndex, {
                                    max_length: event.target.value ? Number(event.target.value) : null,
                                  })
                                }
                                placeholder="Maximum character length"
                              />
                            </div>
                          )}

                          {field.type === 'file' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Allowed File Types</Label>
                                <Input
                                  value={(field.allowed_file_types || []).join(', ')}
                                  onChange={(event) => {
                                    const types = event.target.value
                                      .split(',')
                                      .map((type) => type.trim())
                                      .filter(Boolean);
                                    updateField(activeStep, fieldIndex, {
                                      allowed_file_types: types.length ? types : null,
                                    });
                                  }}
                                  placeholder="e.g., .pdf, .doc, .jpg, .png"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Maximum File Size (MB)</Label>
                                <Input
                                  type="number"
                                  value={field.max_file_size ?? ''}
                                  onChange={(event) =>
                                    updateField(activeStep, fieldIndex, {
                                      max_file_size: event.target.value ? Number(event.target.value) : null,
                                    })
                                  }
                                  placeholder="Maximum file size in MB"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Conditional Logic</Label>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">Show this field if</span>
                              <Select
                                value={field.conditional_logic?.mode || 'all'}
                                onValueChange={(value) =>
                                  updateField(activeStep, fieldIndex, {
                                    conditional_logic: {
                                      ...(field.conditional_logic || { rules: [] }),
                                      mode: value as 'all' | 'any',
                                    },
                                  })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all" className="text-left">
                                    ALL
                                  </SelectItem>
                                  <SelectItem value="any" className="text-left">
                                    ANY
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-gray-600">of the following conditions match:</span>
                            </div>
                            <div className="space-y-2">
                              {(field.conditional_logic?.rules || []).map((rule, ruleIndex) => (
                                <div key={ruleIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Select
                                    value={rule.field}
                                    onValueChange={(value) => {
                                      const rules = [...(field.conditional_logic?.rules || [])];
                                      rules[ruleIndex] = { ...rule, field: value };
                                      updateField(activeStep, fieldIndex, {
                                        conditional_logic: {
                                          ...(field.conditional_logic || { mode: 'all' }),
                                          rules,
                                        },
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {formData.steps
                                        .flatMap((step) => step.fields)
                                        .map((candidate) => (
                                          <SelectItem
                                            key={candidate.id}
                                            value={candidate.field_name || slugifyLabel(candidate.label)}
                                            className="text-left"
                                          >
                                            {candidate.label}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={rule.op}
                                    onValueChange={(value) => {
                                      const rules = [...(field.conditional_logic?.rules || [])];
                                      rules[ruleIndex] = { ...rule, op: value as ConditionalRule['op'] };
                                      updateField(activeStep, fieldIndex, {
                                        conditional_logic: {
                                          ...(field.conditional_logic || { mode: 'all' }),
                                          rules,
                                        },
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equals" className="text-left">
                                        equals
                                      </SelectItem>
                                      <SelectItem value="not_equals" className="text-left">
                                        not equals
                                      </SelectItem>
                                      <SelectItem value="contains" className="text-left">
                                        contains
                                      </SelectItem>
                                      <SelectItem value="is_empty" className="text-left">
                                        is empty
                                      </SelectItem>
                                      <SelectItem value="not_empty" className="text-left">
                                        not empty
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={rule.value || ''}
                                    onChange={(event) => {
                                      const rules = [...(field.conditional_logic?.rules || [])];
                                      rules[ruleIndex] = { ...rule, value: event.target.value };
                                      updateField(activeStep, fieldIndex, {
                                        conditional_logic: {
                                          ...(field.conditional_logic || { mode: 'all' }),
                                          rules,
                                        },
                                      });
                                    }}
                                    placeholder="Value"
                                  />
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const rules = [...(field.conditional_logic?.rules || []),
                                    { field: '', op: 'equals', value: '' } as ConditionalRule,
                                  ];
                                  updateField(activeStep, fieldIndex, {
                                    conditional_logic: {
                                      ...(field.conditional_logic || { mode: 'all' }),
                                      rules,
                                    },
                                  });
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add rule
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" onClick={() => addField(activeStep)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add field
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeStep(activeStep)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Form Preview</h2>
              </div>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{formData.basic.name || 'Untitled form'}</h3>
                    <p className="text-sm text-gray-600">{formData.basic.description || 'Program registration form preview'}</p>
                  </div>
                  <Badge variant="outline">{previewStep + 1} / {combinedSteps.length}</Badge>
                </div>
                <Progress value={((previewStep + 1) / combinedSteps.length) * 100} className="h-2" />
              </div>

              {renderPreviewStep(combinedSteps[previewStep])}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                  disabled={previewStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="text-sm text-gray-500">{previewStep + 1} of {combinedSteps.length}</div>
                <Button
                  onClick={() => setPreviewStep(Math.min(combinedSteps.length - 1, previewStep + 1))}
                  disabled={previewStep === combinedSteps.length - 1}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {previewStep === combinedSteps.length - 1 ? 'Close' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormBuilderEditor(props: FormBuilderEditorProps) {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form builder…</div>}>
      <FormBuilderEditorInner {...props} />
    </Suspense>
  );
}
