'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from "@/components/Layouts/Dashboard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  GripVertical,
  FileText,
  Settings,
  Layout
} from 'lucide-react';
import Link from 'next/link';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
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

interface FormData {
  basic: {
    name: string;
    description: string;
    programId: string;
  };
  steps: FormStep[];
}

const mockPrograms = [
  { id: '1', title: 'Creative Toy Making Workshop' },
  { id: '2', title: 'Leadership Mentorship Program' },
  { id: '3', title: 'Digital Skills Bootcamp' }
];

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'file', label: 'File Upload' }
];

const initialFormData: FormData = {
  basic: {
    name: '',
    description: '',
    programId: ''
  },
  steps: [
    {
      id: 'step-1',
      title: 'Personal Information',
      description: 'Basic details about the applicant',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'First Name',
          required: true
        }
      ]
    }
  ]
};

export default function CreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateBasicData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value
      }
    }));
  };

  const addStep = () => {
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      title: `Step ${formData.steps.length + 1}`,
      description: 'New form step',
      fields: []
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  const removeStep = (stepIndex: number) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, index) => index !== stepIndex)
      }));
      if (activeStep >= formData.steps.length - 1) {
        setActiveStep(Math.max(0, formData.steps.length - 2));
      }
    }
  };

  const addField = (stepIndex: number) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false
    };
    
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex 
          ? { ...step, fields: [...step.fields, newField] }
          : step
      )
    }));
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, sIndex) => 
        sIndex === stepIndex 
          ? {
              ...step,
              fields: step.fields.map((field, fIndex) => 
                fIndex === fieldIndex ? { ...field, ...updates } : field
              )
            }
          : step
      )
    }));
  };

  const removeField = (stepIndex: number, fieldIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, sIndex) => 
        sIndex === stepIndex 
          ? { ...step, fields: step.fields.filter((_, fIndex) => fIndex !== fieldIndex) }
          : step
      )
    }));
  };

  const addOption = (stepIndex: number, fieldIndex: number) => {
    const field = formData.steps[stepIndex].fields[fieldIndex];
    const newOptions = [...(field.options || []), ''];
    updateField(stepIndex, fieldIndex, { options: newOptions });
  };

  const updateOption = (stepIndex: number, fieldIndex: number, optionIndex: number, value: string) => {
    const field = formData.steps[stepIndex].fields[fieldIndex];
    const newOptions = (field.options || []).map((option, index) => 
      index === optionIndex ? value : option
    );
    updateField(stepIndex, fieldIndex, { options: newOptions });
  };

  const removeOption = (stepIndex: number, fieldIndex: number, optionIndex: number) => {
    const field = formData.steps[stepIndex].fields[fieldIndex];
    const newOptions = (field.options || []).filter((_, index) => index !== optionIndex);
    updateField(stepIndex, fieldIndex, { options: newOptions });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form created:', formData);
    
    setIsSubmitting(false);
    router.push('/admin');
  };

  const selectedProgram = mockPrograms.find(p => p.id === formData.basic.programId);

  return (
      <DashboardLayout>
      <div className="">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/dashboard/" passHref={true} className="flex items-center gap-2">
              <Button  className="text-blue-700 hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <h1 className="text-xl font-bold text-blue-900">Form Builder</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Form Settings */}
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
                    onChange={(e) => updateBasicData('name', e.target.value)}
                    placeholder="Registration Form"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.basic.description}
                    onChange={(e) => updateBasicData('description', e.target.value)}
                    placeholder="Form description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Associated Program</Label>
                  <Select value={formData.basic.programId} onValueChange={(value) => updateBasicData('programId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProgram && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Selected Program</p>
                    <p className="text-sm text-blue-700">{selectedProgram.title}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Form Steps</h4>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          activeStep === index ? 'bg-blue-100 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveStep(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{step.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.fields.length} fields
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    className="w-full mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Form Builder */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-blue-600" />
                      {formData.steps[activeStep]?.title || 'Form Step'}
                    </CardTitle>
                    <CardDescription>
                      {formData.steps[activeStep]?.description || 'Configure your form step'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(activeStep)}
                      disabled={formData.steps.length <= 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.steps[activeStep] && (
                  <div className="space-y-6">
                    {/* Step Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Step Title</Label>
                        <Input
                          value={formData.steps[activeStep].title}
                          onChange={(e) => updateStep(activeStep, 'title', e.target.value)}
                          placeholder="Step title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Step Description</Label>
                        <Input
                          value={formData.steps[activeStep].description}
                          onChange={(e) => updateStep(activeStep, 'description', e.target.value)}
                          placeholder="Step description"
                        />
                      </div>
                    </div>

                    {/* Fields */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Form Fields</h4>
                        <Button
                          onClick={() => addField(activeStep)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Field
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {formData.steps[activeStep].fields.map((field, fieldIndex) => (
                          <Card key={field.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <Badge variant="outline">
                                      {fieldTypes.find(t => t.value === field.type)?.label}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeField(activeStep, fieldIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Field Label</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(activeStep, fieldIndex, { label: e.target.value })}
                                      placeholder="Enter field label"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Field Type</Label>
                                    <Select
                                      value={field.type}
                                      onValueChange={(value) => updateField(activeStep, fieldIndex, {
                                        type: value as FormField['type'],
                                        options: ['select', 'checkbox', 'radio'].includes(value) ? ['Option 1'] : undefined
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {fieldTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Placeholder Text</Label>
                                    <Input
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateField(activeStep, fieldIndex, { placeholder: e.target.value })}
                                      placeholder="Enter placeholder text"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-6">
                                    <Checkbox
                                      id={`required-${field.id}`}
                                      checked={field.required}
                                      onCheckedChange={(checked) => updateField(activeStep, fieldIndex, { required: !!checked })}
                                    />
                                    <Label htmlFor={`required-${field.id}`}>Required field</Label>
                                  </div>
                                </div>

                                {/* Options for select, checkbox, radio */}
                                {['select', 'checkbox', 'radio'].includes(field.type) && (
                                  <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                      {(field.options || []).map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center gap-2">
                                          <Input
                                            value={option}
                                            onChange={(e) => updateOption(activeStep, fieldIndex, optionIndex, e.target.value)}
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeOption(activeStep, fieldIndex, optionIndex)}
                                            disabled={(field.options || []).length <= 1}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(activeStep, fieldIndex)}
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {formData.steps[activeStep].fields.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No fields added yet</p>
                            <p className="text-sm">Click &#34;Add Field&#34; to get started</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!formData.basic.name || !formData.basic.programId || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating Form...' : 'Create Form'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </DashboardLayout>
  );
}