/**
 * FormBuilderContent - Revolutionary New Design
 * Figma-like three-panel layout: Canvas (center) + Sidebar (left) + Inspector (right)
 */

import React, { useState } from 'react';
import { useFormBuilderContext } from './FormBuilderProvider';
import { FormSettings } from './FormSettings';
import { StepNavigation } from './StepNavigation';
import { StepEditor } from './StepEditor';
import { FormPreview } from './FormPreview';
import { FieldInspector } from './FieldInspector';
import type { FormBuilderData, ProgramOption, FormField } from './types';

interface FormBuilderContentProps {
  formData: FormBuilderData;
  programs: ProgramOption[];
  onUpdateBasic: (field: keyof FormBuilderData['basic'], value: string) => void;
  onUpdateLayoutColumns: (columns: number) => void;
  onUpdateStep: (index: number, key: string, value: unknown) => void;
  onUpdateField: (stepIndex: number, fieldIndex: number, updates: unknown) => void;
  onRemoveField: (stepIndex: number, fieldIndex: number) => void;
  onAddField: (stepIndex: number) => void;
  onAddStep: () => number;
}

const defaultStaticSteps = [
  {
    id: 'guardian-info',
    title: 'Guardian Information',
    description: 'Contact details for the guardian',
  },
  {
    id: 'participant-info',
    title: 'Participant Information',
    description: 'Details about each participant',
  },
];

/**
 * Revolutionary FormBuilderContent with Figma-like layout
 */
export function FormBuilderContent({
  formData,
  programs,
  onUpdateBasic,
  onUpdateLayoutColumns,
  onUpdateStep,
  onUpdateField,
  onRemoveField,
  onAddField,
  onAddStep,
}: FormBuilderContentProps) {
  const { mode, selectedStepId, selectedFieldId } = useFormBuilderContext();
  const [activeStep, setActiveStep] = useState(0);

  const handleAddStep = () => {
    const newIndex = onAddStep();
    setActiveStep(newIndex);
  };

  // Find selected field for inspector
  const selectedField = selectedFieldId && selectedStepId
    ? formData.steps.find(s => s.id === selectedStepId)?.fields.find(f => f.id === selectedFieldId)
    : null;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Form Structure & Settings */}
      {mode === 'edit' && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Form Settings */}
          <div className="p-4 border-b border-gray-200">
            <FormSettings
              basicInfo={formData.basic}
              layoutColumns={formData.layoutConfig.columns}
              programs={programs}
              onUpdateBasic={onUpdateBasic}
              onUpdateLayoutColumns={onUpdateLayoutColumns}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex-1 overflow-y-auto">
            <StepNavigation
              staticSteps={defaultStaticSteps}
              customSteps={formData.steps}
              activeStepIndex={activeStep}
              onSelectStep={setActiveStep}
              onAddStep={handleAddStep}
            />
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className={`flex-1 flex flex-col ${mode === 'edit' ? 'bg-gray-50' : 'bg-white'}`}>
        {/* Toolbar - Only in Edit Mode */}
        {mode === 'edit' && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Step {activeStep + 1} of {formData.steps.length + 2}
              </div>
              <div className="text-sm font-medium text-blue-600">
                {formData.steps[activeStep]?.title || 'Untitled Step'}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {mode === 'edit' && (
            <StepEditor
              step={formData.steps[activeStep]}
              stepIndex={activeStep}
              defaultColumns={formData.layoutConfig.columns}
              allFields={formData.steps.flatMap((s) => s.fields)}
              onUpdateStep={(key, value) => onUpdateStep(activeStep, key, value)}
              onUpdateField={(fieldIndex, updates) => onUpdateField(activeStep, fieldIndex, updates)}
              onRemoveField={(fieldIndex) => onRemoveField(activeStep, fieldIndex)}
              onAddField={() => onAddField(activeStep)}
            />
          )}

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

      {/* Right Inspector Panel - Field Configuration */}
      {mode === 'edit' && selectedField && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Field Inspector</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure &quot;{selectedField.label || 'Untitled Field'}&quot;
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <FieldInspector
              field={selectedField}
              onUpdate={(updates: Partial<FormField>) => {
                const stepIndex = formData.steps.findIndex(s => s.id === selectedStepId);
                const fieldIndex = formData.steps[stepIndex]?.fields.findIndex(f => f.id === selectedFieldId);
                if (stepIndex !== -1 && fieldIndex !== -1) {
                  onUpdateField(stepIndex, fieldIndex, updates);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
