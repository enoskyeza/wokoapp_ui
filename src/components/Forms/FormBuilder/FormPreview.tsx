'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Eye, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFormBuilderContext } from './FormBuilderProvider';
import { FieldRenderer } from './FieldRenderer';
import { evaluateConditions } from '@/components/Registration/conditionUtils';
import { COLUMN_CLASS_MAP, clampColumnCount, clampColumnSpan, slugify } from './utils';
import type { FormPreviewProps, FormStep } from './types';
import type { ConditionGroup, ConditionContext } from '@/components/Registration/conditionUtils';

export function FormPreview({ isOpen, onClose }: FormPreviewProps) {
  const { store, combinedSteps } = useFormBuilderContext();
  const { formData, ui } = store;

  if (!isOpen) return null;

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
                answers: ui.previewAnswers,
              };
              const group = field.conditional_logic as ConditionGroup | undefined;
              const visible = evaluateConditions(group, ctx);
              if (!visible) return null;

              const key = field.field_name || slugify(field.label);
              const span = clampColumnSpan(field.columnSpan, columns);

              return (
                <div
                  key={field.id}
                  className="space-y-2"
                  style={{ gridColumn: `span ${span} / span ${span}` }}
                >
                  <FieldRenderer
                    field={field}
                    mode="preview"
                    value={ui.previewAnswers[key]}
                    onChange={(val) => store.setPreviewAnswer(key, val)}
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Form Preview</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Form Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {formData.basic.name || 'Untitled form'}
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.basic.description || 'Program registration form preview'}
                </p>
              </div>
              <Badge variant="outline">
                {ui.previewStep + 1} / {combinedSteps.length}
              </Badge>
            </div>
            <Progress 
              value={((ui.previewStep + 1) / combinedSteps.length) * 100} 
              className="h-2" 
            />
          </div>

          {/* Current Step */}
          {renderPreviewStep(combinedSteps[ui.previewStep])}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => store.setPreviewStep(Math.max(0, ui.previewStep - 1))}
              disabled={ui.previewStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500">
              {ui.previewStep + 1} of {combinedSteps.length}
            </div>
            
            <Button
              onClick={() => {
                if (ui.previewStep === combinedSteps.length - 1) {
                  onClose();
                } else {
                  store.setPreviewStep(Math.min(combinedSteps.length - 1, ui.previewStep + 1));
                }
              }}
              disabled={ui.previewStep === combinedSteps.length - 1}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {ui.previewStep === combinedSteps.length - 1 ? 'Close' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
