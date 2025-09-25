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
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
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
    fields: [
      { id: 'participant_name', type: 'text', label: 'Participant Name', required: true },
      { id: 'participant_age', type: 'number', label: 'Age', required: true },
      { id: 'participant_school', type: 'text', label: 'School', required: false },
      { id: 'participant_grade', type: 'text', label: 'Grade/Class', required: false }
    ]
  }
];

export default function FormPreview({ isOpen, onClose, formName, formDescription, steps }: FormPreviewProps) {
  const [previewStep, setPreviewStep] = useState(0);
  
  // Combine static steps with dynamic steps
  const allSteps = [...staticSteps, ...steps];

  const renderField = (field: FormField) => {
    const fieldId = `preview_${field.id}`;
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2 md:col-span-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
          <div key={field.id} className={`space-y-2 ${(field.options || []).length > 3 ? 'md:col-span-2' : ''}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
          <div key={field.id} className={`space-y-2 ${(field.options || []).length > 3 ? 'md:col-span-2' : ''}`}>
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
          <div key={field.id} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
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
            {allSteps[previewStep] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStepIcon(allSteps[previewStep].id)}
                    {allSteps[previewStep].title}
                    {previewStep < staticSteps.length && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        System Managed
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {allSteps[previewStep].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allSteps[previewStep].fields.map(renderField)}
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
