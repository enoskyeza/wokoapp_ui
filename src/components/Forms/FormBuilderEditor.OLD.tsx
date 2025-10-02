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
import { FormBuilderProvider, useFormBuilderContext } from '@/components/Forms/FormBuilder/FormBuilderProvider';
import { unifiedFormService } from '@/services/unifiedFormService';
import { mapCompleteFormToBuilder } from '@/components/Forms/FormBuilder/mapper';
import { StepEditor } from '@/components/Forms/FormBuilder/StepEditor';
import { FormPreview } from '@/components/Forms/FormBuilder/FormPreview';
import { FormSettings } from '@/components/Forms/FormBuilder/FormSettings';
import { StepNavigation } from '@/components/Forms/FormBuilder/StepNavigation';
import { FormBuilderHeader } from '@/components/Forms/FormBuilder/FormBuilderHeader';

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

type ConditionalOperator = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty' | '>' | '>=' | '<' | '<=';

interface ConditionalRule {
  field: string;
  op: ConditionalOperator;
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
  conditional_logic?: ConditionalLogic;
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

const CONDITIONAL_OPERATORS: ConditionalOperator[] = [
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

const operatorRequiresValue = (operator: ConditionalOperator): boolean =>
  !['is_empty', 'not_empty'].includes(operator);

const isConditionalOperator = (value: unknown): value is ConditionalOperator =>
  typeof value === 'string' && (CONDITIONAL_OPERATORS as string[]).includes(value);

function toConditionalLogic(raw: unknown): ConditionalLogic | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const source = raw as Record<string, unknown>;
  const rawRules = Array.isArray(source.rules) ? (source.rules as unknown[]) : [];
  if (!rawRules.length) return undefined;

  const rules: ConditionalRule[] = [];
  rawRules.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const record = entry as Record<string, unknown>;
    const field = typeof record.field === 'string' ? record.field.trim() : '';
    const operator = record.op;
    if (!field || !isConditionalOperator(operator)) return;
    const rule: ConditionalRule = {
      field,
      op: operator,
    };
    if (operatorRequiresValue(operator)) {
      if (record.value !== undefined && record.value !== null) {
        rule.value = String(record.value);
      } else {
        rule.value = '';
      }
    }
    rules.push(rule);
  });

  if (!rules.length) return undefined;

  const mode = source.mode === 'any' ? 'any' : 'all';
  return { mode, rules };
}

function cleanConditionalLogic(logic?: ConditionalLogic | null): ConditionalLogic | null {
  if (!logic) return null;
  const rules = Array.isArray(logic.rules) ? logic.rules : [];
  if (!rules.length) return null;

  const cleanedRules: ConditionalRule[] = [];
  rules.forEach((rule) => {
    if (!rule || typeof rule.field !== 'string' || !rule.field.trim()) return;
    if (!isConditionalOperator(rule.op)) return;

    const base: ConditionalRule = {
      field: rule.field.trim(),
      op: rule.op,
    };

    if (operatorRequiresValue(rule.op)) {
      const value = rule.value ?? '';
      if (value === '') return;
      base.value = value;
    }

    cleanedRules.push(base);
  });

  if (!cleanedRules.length) return null;

  return {
    mode: logic.mode === 'any' ? 'any' : 'all',
    rules: cleanedRules,
  };
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
      conditional_logic: { mode: 'all', rules: [] },
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
              conditional_logic:
                toConditionalLogic((field as { conditional_logic?: unknown })?.conditional_logic) ??
                (field?.conditional_logic ? (field.conditional_logic as ConditionalLogic) : { mode: 'all', rules: [] }),
            }))
          : [];
        const key = step?.key || step?.id || `step-${index + 1}`;
        const logicSource = (step as { conditional_logic?: unknown })?.conditional_logic;
        return {
          id: step?.id || key,
          key,
          title: step?.title || `Step ${index + 1}`,
          description: step?.description || '',
          fields,
          perParticipant: step?.perParticipant ?? true,
          layoutColumns,
          conditional_logic: toConditionalLogic(logicSource) ?? { mode: 'all', rules: [] },
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

/* createFieldFromPayload removed - now using common mapper */

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
        // Prefer unified API; fall back to legacy endpoints for compatibility
        let structure: unknown | null = null;
        try {
          const dto = await unifiedFormService.getFormDefinition(Number(formId));
          // Map unified DTO to builder state and short‑circuit
          const mapped = mapCompleteFormToBuilder(dto as unknown as Record<string, unknown>);
          if (!cancelled) {
            // Set mapped structure directly; shapes align with local builder state
            setInitialData(mapped as unknown as FormBuilderData);
            setLoading(false);
          }
          return;
        } catch {
          structure = await programFormService.getFormStructure(formId);
        }
        if (!structure) {
          const fallback = await programFormService.getFormById(formId);
          if (!fallback) {
            if (!cancelled) {
              setNotFound(true);
              setLoading(false);
            }
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

        /* legacy mapping removed; use common mapper below */

        const mappedLegacy = mapCompleteFormToBuilder(structure as Record<string, unknown>);

        if (!cancelled) {
          setInitialData(mappedLegacy as unknown as FormBuilderData);
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
      const fieldLogic = cleanConditionalLogic(field.conditional_logic);
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
          conditional_logic: fieldLogic ? { ...fieldLogic } : null,
          column_span: field.columnSpan ?? layoutColumns,
          step_key: stepKey,
        } satisfies FormFieldPayload,
      };
    });

    const stepLogic = cleanConditionalLogic(step.conditional_logic);

    return {
      meta: {
        key: stepKey,
        title: step.title || `Step ${sIdx + 1}`,
        description: step.description || '',
        order: sIdx + 1,
        per_participant: step.perParticipant ?? true,
        layout: { columns: layoutColumns },
        conditional_logic: stepLogic ? { ...stepLogic } : null,
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
    conditional_logic: step.meta.conditional_logic,
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
  
  // Phase 1: Access mode from store/provider
  const { mode, setMode } = useFormBuilderContext();
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
      conditional_logic: { mode: 'all', rules: [] },
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
      <FormBuilderHeader
        mode={mode}
        isEditMode={isEditMode}
        isSaving={isSaving}
        onSetMode={setMode}
        onSave={handleSave}
        onSaveDraft={!isEditMode ? saveDraft : undefined}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Hide sidebar in preview mode */}
          {mode === 'edit' && (
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
          )}

          <div className={mode === 'edit' ? 'lg:col-span-3 space-y-6' : 'lg:col-span-4 space-y-6'}>
            {mode === 'edit' && (
              <StepEditor
                step={formData.steps[activeStep]}
                stepIndex={activeStep}
                defaultColumns={formData.layoutConfig.columns}
                allFields={formData.steps.flatMap((s) => s.fields)}
                onUpdateStep={(key, value) => updateStep(activeStep, key, value)}
                onUpdateField={(fieldIndex, updates) => updateField(activeStep, fieldIndex, updates)}
                onRemoveField={(fieldIndex) => removeField(activeStep, fieldIndex)}
                onAddField={() => addField(activeStep)}
              />
            )}

            {/* Old inline field editor removed - now using StepEditor component */}

          {mode === 'preview' && (
            <FormPreview
              formName={formData.basic.name}
              formDescription={formData.basic.description}
              steps={formData.steps}
              defaultColumns={formData.layoutConfig.columns}
            />
          )}
        </div>
      </div>

      {/* Old preview modal removed - now using FormPreview component */}
    </div>
  );
}

export function FormBuilderEditor(props: FormBuilderEditorProps) {
  return (
    <FormBuilderProvider>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form builder…</div>}>
        <FormBuilderEditorInner {...props} />
      </Suspense>
    </FormBuilderProvider>
  );
}
