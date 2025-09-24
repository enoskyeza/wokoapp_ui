'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from "@/components/Layouts/Dashboard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight,
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  GripVertical,
  FileText,
  Settings,
  Layout,
  X
} from 'lucide-react';
import Link from 'next/link';
import { formsService, type CreateProgramFormPayload, type FormFieldPayload } from '@/services/formsService';
import { programService } from '@/services/programService';
import { toast } from 'sonner';

type FieldTypeUI = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'number' | 'date' | 'url';

interface ConditionalRule {
  field: string;
  op: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty';
  value?: string;
}

interface ConditionalLogic {
  mode: 'all' | 'any';
  rules: ConditionalRule[];
}

interface FormField {
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

interface ProgramOption { id: string; title: string }

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
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Fetch real programs
    (async () => {
      const list = await programService.getAllPrograms();
      const mapped: ProgramOption[] = list.map(p => ({ id: String(p.id), title: p.name }))
      setPrograms(mapped)
    })()
  }, [])

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
      required: false,
      field_name: '',
      conditional_logic: { mode: 'all', rules: [] }
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
    
    try {
      // Flatten steps to sequential fields with order
      const allFields: FormField[] = formData.steps.flatMap((s, sIdx) =>
        s.fields.map((f, fIdx) => ({ ...f, order: sIdx * 100 + fIdx + 1 }))
      )

      // Map UI field type to backend field_type
      const mapType = (t: FieldTypeUI): FormFieldPayload['field_type'] => {
        if (t === 'select') return 'dropdown'
        if (t === 'tel') return 'phone'
        return t as any
      }

      const payload: CreateProgramFormPayload = {
        program: Number(formData.basic.programId),
        title: formData.basic.name,
        description: formData.basic.description,
        fields: allFields.map(f => ({
          field_name: (f.field_name && f.field_name.trim()) || slugify(f.label),
          label: f.label,
          field_type: mapType(f.type),
          is_required: f.required,
          help_text: f.help_text,
          order: f.order,
          options: f.options,
          max_length: f.max_length ?? null,
          min_value: f.min_value ?? null,
          max_value: f.max_value ?? null,
          allowed_file_types: f.allowed_file_types ?? null,
          max_file_size: f.max_file_size ?? null,
          conditional_logic: f.conditional_logic || undefined,
        }))
      }

      const result = await formsService.createProgramForm(payload)
      console.log('Form created:', result)
      setIsSubmitting(false)
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
      alert((e as Error).message)
    }
  };

  const selectedProgram = useMemo(() => programs.find(p => p.id === formData.basic.programId), [programs, formData.basic.programId])

  const saveDraft = () => {
    const key = `form_builder_draft_${Date.now()}`
    localStorage.setItem(key, JSON.stringify(formData))
    toast.success('Draft saved to local storage');
  }

  const [isSaving, setIsSaving] = useState(false);

  const saveForm = async () => {
    // Validation
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
    if (formData.steps.some(step => step.fields.length === 0)) {
      toast.error('Each step must have at least one field');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the payload for the backend
      const payload: CreateProgramFormPayload = {
        program: parseInt(formData.basic.programId),
        title: formData.basic.name,
        description: formData.basic.description,
        fields: formData.steps.flatMap((step, stepIndex) => 
          step.fields.map((field, fieldIndex): FormFieldPayload => ({
            field_name: field.field_name || slugify(field.label),
            label: field.label,
            field_type: field.type === 'tel' ? 'phone' : (field.type === 'select' ? 'dropdown' : field.type) as FormFieldPayload['field_type'],
            is_required: field.required,
            help_text: field.help_text || '',
            order: stepIndex * 100 + fieldIndex, // Ensure proper ordering
            max_length: field.max_length,
            min_value: field.min_value,
            max_value: field.max_value,
            allowed_file_types: field.allowed_file_types,
            max_file_size: field.max_file_size,
            options: field.options || undefined, // Keep as array
            conditional_logic: field.conditional_logic || undefined
          }))
        )
      };

      console.log('Saving form with payload:', payload);
      
      const result = await formsService.createProgramForm(payload);
      
      console.log('Form saved successfully:', result);
      toast.success('Form saved successfully!', {
        description: `"${formData.basic.name}" has been created and is ready for use.`
      });
      
      // Redirect to forms list or dashboard
      router.push('/dashboard?tab=forms');
      
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form', {
        description: 'Please check your connection and try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

  return (
      <DashboardLayout>
      <div className="">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/dashboard/" passHref={true} className="flex items-center gap-2">
              <Button  className="text-theme-primary text-white hover:bg-blue-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={saveForm} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Form'}
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
                      {programs.map((program) => (
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
                                      onValueChange={(value) => {
                                        const opts = (['select', 'checkbox', 'radio'].includes(value as string)
                                          ? ['Option 1']
                                          : undefined) as string[] | undefined
                                        updateField(activeStep, fieldIndex, {
                                          type: value as FormField['type'],
                                          options: opts,
                                        })
                                      }}
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

                                {/* Dynamic Options for Select, Checkbox, Radio */}
                                {(['select', 'checkbox', 'radio'].includes(field.type)) && (
                                  <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                      {(field.options || []).map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center gap-2">
                                          <Input
                                            value={option}
                                            onChange={(e) => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions[optionIndex] = e.target.value;
                                              updateField(activeStep, fieldIndex, { options: newOptions });
                                            }}
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newOptions = [...(field.options || [])];
                                              newOptions.splice(optionIndex, 1);
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
                                          const newOptions = [...(field.options || []), `Option ${(field.options || []).length + 1}`];
                                          updateField(activeStep, fieldIndex, { options: newOptions });
                                        }}
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Option
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Number Field Settings */}
                                {field.type === 'number' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Minimum Value</Label>
                                      <Input
                                        type="number"
                                        value={field.min_value || ''}
                                        onChange={(e) => updateField(activeStep, fieldIndex, { min_value: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Minimum value"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Maximum Value</Label>
                                      <Input
                                        type="number"
                                        value={field.max_value || ''}
                                        onChange={(e) => updateField(activeStep, fieldIndex, { max_value: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Maximum value"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Text Field Settings */}
                                {(['text', 'email', 'tel', 'url', 'textarea'].includes(field.type)) && (
                                  <div className="space-y-2">
                                    <Label>Maximum Length</Label>
                                    <Input
                                      type="number"
                                      value={field.max_length || ''}
                                      onChange={(e) => updateField(activeStep, fieldIndex, { max_length: e.target.value ? Number(e.target.value) : null })}
                                      placeholder="Maximum character length"
                                    />
                                  </div>
                                )}

                                {/* File Upload Settings */}
                                {field.type === 'file' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Allowed File Types</Label>
                                      <Input
                                        value={(field.allowed_file_types || []).join(', ')}
                                        onChange={(e) => {
                                          const types = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                                          updateField(activeStep, fieldIndex, { allowed_file_types: types });
                                        }}
                                        placeholder="e.g., .pdf, .doc, .jpg, .png"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Maximum File Size (MB)</Label>
                                      <Input
                                        type="number"
                                        value={field.max_file_size || ''}
                                        onChange={(e) => updateField(activeStep, fieldIndex, { max_file_size: e.target.value ? Number(e.target.value) : null })}
                                        placeholder="Maximum file size in MB"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Help Text */}
                                <div className="space-y-2">
                                  <Label>Help Text</Label>
                                  <Textarea
                                    value={field.help_text || ''}
                                    onChange={(e) => updateField(activeStep, fieldIndex, { help_text: e.target.value })}
                                    placeholder="Optional help text for users"
                                    rows={2}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                  <div className="space-y-2">
                                    <Label>Conditional Logic</Label>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-gray-600">Show this field if</span>
                                      <Select value={field.conditional_logic?.mode || 'all'} onValueChange={(val) => updateField(activeStep, fieldIndex, { conditional_logic: { ...(field.conditional_logic || { rules: [] }), mode: val as 'all' | 'any' } })}>
                                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all">ALL</SelectItem>
                                          <SelectItem value="any">ANY</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <span className="text-sm text-gray-600">of the following conditions match:</span>
                                    </div>
                                    <div className="space-y-2">
                                      {(field.conditional_logic?.rules || []).map((rule, rIdx) => (
                                        <div key={rIdx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                          <Select value={rule.field} onValueChange={(val) => {
                                            const rules = [...(field.conditional_logic?.rules || [])]
                                            rules[rIdx] = { ...rule, field: val }
                                            updateField(activeStep, fieldIndex, { conditional_logic: { ...(field.conditional_logic || { mode: 'all' }), rules } })
                                          }}>
                                            <SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger>
                                            <SelectContent>
                                              {formData.steps.flatMap(s => s.fields).filter(f => f.id !== field.id).map(f => (
                                                <SelectItem key={f.id} value={(f.field_name && f.field_name.trim()) || slugify(f.label)}>
                                                  {(f.field_name && f.field_name.trim()) || slugify(f.label)}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Select value={rule.op} onValueChange={(val) => {
                                            const rules = [...(field.conditional_logic?.rules || [])]
                                            rules[rIdx] = { ...rule, op: val as ConditionalRule['op'] }
                                            updateField(activeStep, fieldIndex, { conditional_logic: { ...(field.conditional_logic || { mode: 'all' }), rules } })
                                          }}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="equals">equals</SelectItem>
                                              <SelectItem value="not_equals">not equals</SelectItem>
                                              <SelectItem value="contains">contains</SelectItem>
                                              <SelectItem value="is_empty">is empty</SelectItem>
                                              <SelectItem value="not_empty">not empty</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Input
                                            value={rule.value || ''}
                                            onChange={(e) => {
                                              const rules = [...(field.conditional_logic?.rules || [])]
                                              rules[rIdx] = { ...rule, value: e.target.value }
                                              updateField(activeStep, fieldIndex, { conditional_logic: { ...(field.conditional_logic || { mode: 'all' }), rules } })
                                            }}
                                            placeholder="Value (if applicable)"
                                          />
                                        </div>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => {
                                        const rules = [...(field.conditional_logic?.rules || [])]
                                        rules.push({ field: '', op: 'equals', value: '' })
                                        updateField(activeStep, fieldIndex, { conditional_logic: { ...(field.conditional_logic || { mode: 'all' }), rules } })
                                      }}>
                                        <Plus className="w-4 h-4 mr-1" /> Add Condition
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header matching program creation form */}
            <header className="bg-white shadow-sm border-b border-blue-100 rounded-t-lg">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Form Preview</span>
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="w-4 h-4 mr-2" />
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Progress section matching program creation */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.basic.name || 'Form Preview'}</h2>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    Step {activeStep + 1} of {formData.steps.length}
                  </Badge>
                </div>
                <Progress value={((activeStep + 1) / formData.steps.length) * 100} className="h-2 mb-4" />

                {/* Step Navigation matching program creation */}
                <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                  {formData.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          index < activeStep
                            ? 'bg-green-600 text-white'
                            : index === activeStep
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="ml-2">
                        <p className={`text-sm font-medium ${
                          index === activeStep ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                      {index < formData.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-300 ml-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content matching program creation card style */}
              <div className="space-y-6">
                {formData.steps[activeStep] && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {formData.steps[activeStep].title}
                      </CardTitle>
                      <CardDescription>
                        {formData.steps[activeStep].description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.steps[activeStep].fields.map((f) => (
                          <div key={f.id} className={`space-y-2 ${
                            f.type === 'textarea' || (f.type === 'checkbox' && (f.options || []).length > 3) || (f.type === 'radio' && (f.options || []).length > 3)
                              ? 'md:col-span-2' : ''
                          }`}>
                            <Label className="text-sm font-medium">
                              {f.label}{f.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {f.help_text && (
                              <p className="text-xs text-gray-500">{f.help_text}</p>
                            )}
                            {f.type === 'textarea' ? (
                              <Textarea 
                                placeholder={f.placeholder} 
                                maxLength={f.max_length || undefined}
                                rows={4}
                              />
                            ) : f.type === 'select' ? (
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder={f.placeholder || "Select an option"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {(f.options || []).map((o, idx) => (
                                    <SelectItem key={idx} value={String(o)}>{o}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : f.type === 'checkbox' ? (
                              <div className="space-y-3">
                                {(f.options || []).map((o, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <Checkbox id={`${f.id}-${idx}`} />
                                    <Label htmlFor={`${f.id}-${idx}`} className="text-sm font-normal">{o}</Label>
                                  </div>
                                ))}
                              </div>
                            ) : f.type === 'radio' ? (
                              <div className="space-y-3">
                                {(f.options || []).map((o, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <input 
                                      type="radio" 
                                      id={`${f.id}-${idx}`} 
                                      name={f.id} 
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                    />
                                    <Label htmlFor={`${f.id}-${idx}`} className="text-sm font-normal">{o}</Label>
                                  </div>
                                ))}
                              </div>
                            ) : f.type === 'file' ? (
                              <div className="space-y-2">
                                <Input 
                                  type="file" 
                                  accept={(f.allowed_file_types || []).join(',')} 
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {f.allowed_file_types && f.allowed_file_types.length > 0 && (
                                  <p className="text-xs text-gray-500">Allowed file types: {f.allowed_file_types.join(', ')}</p>
                                )}
                                {f.max_file_size && (
                                  <p className="text-xs text-gray-500">Maximum file size: {f.max_file_size}MB</p>
                                )}
                              </div>
                            ) : (
                              <Input 
                                placeholder={f.placeholder} 
                                type={f.type === 'tel' ? 'tel' : (f.type === 'number' ? 'number' : (f.type === 'date' ? 'date' : (f.type === 'url' ? 'url' : (f.type === 'email' ? 'email' : 'text'))))}
                                min={f.type === 'number' ? f.min_value : undefined}
                                max={f.type === 'number' ? f.max_value : undefined}
                                maxLength={f.max_length || undefined}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation buttons matching program creation style */}
                <div className="flex items-center justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="text-sm text-gray-500">
                    {activeStep + 1} of {formData.steps.length}
                  </div>
                  
                  <Button 
                    onClick={() => setActiveStep(Math.min(formData.steps.length - 1, activeStep + 1))}
                    disabled={activeStep === formData.steps.length - 1}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {activeStep === formData.steps.length - 1 ? 'Complete' : 'Next'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </DashboardLayout>
  );
}