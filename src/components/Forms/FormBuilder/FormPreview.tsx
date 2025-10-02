import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldWrapper, FormField } from './FieldRenderer';
import { evaluateConditions, type ConditionGroup, type ConditionContext } from '@/components/Registration/conditionUtils';

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  key?: string;
  perParticipant?: boolean;
  layoutColumns?: number;
  conditional_logic?: {
    mode: 'all' | 'any';
    rules: Array<{ field: string; op: string; value?: any }>;
  };
}

interface FormPreviewProps {
  formName: string;
  formDescription?: string;
  steps: FormStep[];
  defaultColumns?: number;
}

const COLUMN_CLASS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const clampColumnCount = (value?: number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.min(4, Math.max(1, Math.floor(numeric)));
};

const clampColumnSpan = (value: number | null | undefined, columns: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return Math.max(1, columns);
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * FormPreview: Complete preview of form as users will see it
 * Shows all steps and fields with proper layout and conditional logic
 */
export function FormPreview({ 
  formName, 
  formDescription, 
  steps, 
  defaultColumns = 4 
}: FormPreviewProps) {
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  const renderStep = (step: FormStep) => {
    const columns = clampColumnCount(step.layoutColumns ?? defaultColumns);
    const gridColumnsClass = COLUMN_CLASS_MAP[columns] ?? COLUMN_CLASS_MAP[1];

    return (
      <Card key={step.id}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-blue-600" />
            {step.title}
          </CardTitle>
          {step.description && <CardDescription>{step.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${gridColumnsClass}`}>
            {step.fields.map((field) => {
              // Evaluate conditional logic
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
                  <FieldWrapper
                    field={field}
                    value={previewAnswers[key]}
                    onChange={(val) => setPreviewAnswers((prev) => ({ ...prev, [key]: val }))}
                    mode="preview"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {formName || 'Form Preview'}
        </h2>
        {formDescription && (
          <p className="text-gray-600">{formDescription}</p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => renderStep(step))}
      </div>
    </div>
  );
}
