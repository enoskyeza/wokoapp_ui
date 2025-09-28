'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  X, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  User,
  Users
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  columnSpan?: number | null;
  helpText?: string;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  layoutColumns?: number | null;
}

interface FormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formName: string;
  formDescription?: string;
  steps: FormStep[];
}

// Static steps that are always included
const staticSteps: FormStep[] = [
  {
    id: 'guardian',
    title: 'Guardian Information',
    description: 'Primary guardian or parent contact details',
    layoutColumns: 2,
    fields: [
      { id: 'guardian_name', type: 'text', label: 'Full Name', required: true },
      { id: 'guardian_email', type: 'email', label: 'Email Address', required: true },
      { id: 'guardian_phone', type: 'tel', label: 'Phone Number', required: true },
      { id: 'guardian_address', type: 'textarea', label: 'Address', required: false }
    ]
  },
  {
    id: 'participants',
    title: 'Participant Information',
    description: 'Details about the program participants',
    layoutColumns: 2,
    fields: [
      { id: 'participant_name', type: 'text', label: 'Participant Name', required: true },
      { id: 'participant_age', type: 'number', label: 'Age', required: true },
      { id: 'participant_school', type: 'text', label: 'School', required: false },
      { id: 'participant_grade', type: 'text', label: 'Grade/Class', required: false }
    ]
  }
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

const clampColumnSpan = (value?: number | null, columns = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, columns);
  }
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

export default function FormPreview({ isOpen, onClose, formName, formDescription, steps }: FormPreviewProps) {
  const [previewStep, setPreviewStep] = useState(0);
  
  // Combine static steps with dynamic steps
  const allSteps = [...staticSteps, ...steps];
  const activeStep = allSteps[previewStep];
  const activeStepColumns = clampColumnCount(activeStep?.layoutColumns ?? 1);
  const activeGridClass = COLUMN_CLASS_MAP[activeStepColumns] ?? COLUMN_CLASS_MAP[1];

  const renderField = (field: FormField, columns: number) => {
    const fieldId = `preview_${field.id}`;
    const span = clampColumnSpan(field.columnSpan, columns);
    const commonProps = {
      key: field.id,
      className: 'space-y-2',
      style: { gridColumn: `span ${span} / span ${span}` },
    } as const;

    switch (field.type) {
      case 'textarea':
        return (
          <div {...commonProps}>
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            <Textarea
              id={fieldId}
              placeholder={field.placeholder}
              disabled
              className="bg-gray-50"
            />
          </div>
        );
        
      case 'select':
        return (
          <div {...commonProps}>
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            <select
              id={fieldId}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            >
              <option value="">Select an option...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
        
      case 'checkbox':
        return (
          <div {...commonProps}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`${fieldId}_${index}`} disabled />
                  <Label htmlFor={`${fieldId}_${index}`} className="text-sm text-gray-600">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'radio':
        return (
          <div {...commonProps}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            <RadioGroup disabled>
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${fieldId}_${index}`} />
                  <Label htmlFor={`${fieldId}_${index}`} className="text-sm text-gray-600">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      default:
        return (
          <div {...commonProps}>
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            <Input
              id={fieldId}
              type={field.type}
              placeholder={field.placeholder}
              disabled
              className="bg-gray-50"
            />
          </div>
        );
    }
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'guardian':
        return <User className="w-4 h-4" />;
      case 'participants':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-blue-100 rounded-t-lg">
          <div className="px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Form Preview</span>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Progress section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{formName || 'Form Preview'}</h2>
          <Badge variant="outline" className="border-blue-200 text-blue-700">
            Step {previewStep + 1} of {allSteps.length}
          </Badge>
            </div>
            {formDescription && (
              <p className="text-gray-600 mb-4">{formDescription}</p>
            )}
            <Progress value={((previewStep + 1) / allSteps.length) * 100} className="h-2 mb-4" />

            {/* Step Navigation */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {allSteps.map((step, index) => {
                const isStatic = index < staticSteps.length;
                return (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        index < previewStep
                          ? 'bg-green-600 text-white'
                          : index === previewStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {getStepIcon(step.id)}
                    </div>
                    <div className="ml-2">
                      <p className={`text-sm font-medium ${
                        index === previewStep ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                        {isStatic && <span className="ml-1 text-xs text-gray-400">(Required)</span>}
                      </p>
                    </div>
                    {index < allSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {activeStep && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStepIcon(activeStep.id)}
                    {activeStep.title}
                    {previewStep < staticSteps.length && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        System Managed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {activeStep.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`grid gap-6 ${activeGridClass}`}>
                    {activeStep.fields.map((field) => renderField(field, activeStepColumns))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
              disabled={previewStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500">
              {previewStep + 1} of {allSteps.length}
            </div>
            
            <Button 
              onClick={() => setPreviewStep(Math.min(allSteps.length - 1, previewStep + 1))}
              disabled={previewStep === allSteps.length - 1}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {previewStep === allSteps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
