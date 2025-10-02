'use client';

import React from 'react';
import { GripVertical, Layout, Plus, Trash2, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFormBuilderContext } from './FormBuilderProvider';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { StepConditionalLogicEditor } from './StepConditionalLogicEditor';
import { fieldTypes } from './types';
import { getFieldTypeOptions } from './utils';
import type { StepEditorProps, FieldTypeUI, FormField } from './types';

export function StepEditor({ stepIndex }: StepEditorProps) {
  const { store } = useFormBuilderContext();
  const { formData } = store as any;
  const [showStepConditionalLogic, setShowStepConditionalLogic] = React.useState(false);
  
  const step = formData.steps[stepIndex];
  if (!step) return null;

  const defaultStaticStepsCount = 2; // Guardian + Participant steps

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-600" />
          Step Configuration
        </CardTitle>
        <CardDescription>
          Configure the fields shown to applicants after the two system steps. You are editing step
          {` ${stepIndex + defaultStaticStepsCount + 1}`} in the application flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Step Title</Label>
            <Input
              value={step.title || ''}
              onChange={(event) => (store as any).updateStep(stepIndex, 'title', event.target.value)}
              placeholder="Step title"
            />
          </div>
          <div className="space-y-2">
            <Label>Step Description</Label>
            <Input
              value={step.description || ''}
              onChange={(event) => (store as any).updateStep(stepIndex, 'description', event.target.value)}
              placeholder="Step description"
            />
          </div>
          <div className="space-y-2">
            <Label>Columns</Label>
            <Select
              value={String(step.layoutColumns ?? formData.layoutConfig.columns)}
              onValueChange={(value) => (store as any).updateStep(stepIndex, 'layoutColumns', Number(value))}
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
                id={`per-participant-${stepIndex}`}
                checked={step.perParticipant ?? true}
                onCheckedChange={(checked) => (store as any).updateStep(stepIndex, 'perParticipant', Boolean(checked))}
              />
              <Label htmlFor={`per-participant-${stepIndex}`} className="text-sm text-gray-600">
                Repeat per participant
              </Label>
            </div>
          </div>
        </div>

        {/* Step Conditional Logic Button */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Step Conditional Logic</span>
            {step.conditionalLogic?.rules?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {step.conditionalLogic.rules.length} rule{step.conditionalLogic.rules.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowStepConditionalLogic(!showStepConditionalLogic)}
            className="text-xs"
          >
            {showStepConditionalLogic ? 'Hide' : 'Configure'}
          </Button>
        </div>

        {/* Step Conditional Logic Editor */}
        {showStepConditionalLogic && (
          <StepConditionalLogicEditor
            stepIndex={stepIndex}
            step={step}
          />
        )}

        {/* Fields */}
        <div className="space-y-4">
          {step.fields.map((field, fieldIndex) => (
            <FieldCard
              key={field.id}
              field={field}
              stepIndex={stepIndex}
              fieldIndex={fieldIndex}
            />
          ))}

          {/* Add Field Button */}
          <Button 
            variant="outline" 
            onClick={() => (store as any).addField(stepIndex)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add field
          </Button>

          {/* Remove Step Button */}
          <Button
            variant="outline"
            onClick={() => (store as any).removeStep(stepIndex)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual field card component
function FieldCard({ 
  field, 
  stepIndex, 
  fieldIndex 
}: { 
  field: FormField; 
  stepIndex: number; 
  fieldIndex: number; 
}) {
  const { store } = useFormBuilderContext();
  const { formData } = store as any;
  
  const fieldOptions = getFieldTypeOptions(field.type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Field Header */}
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
                onClick={() => (store as any).removeField(stepIndex, fieldIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Basic Field Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={field.label}
                onChange={(event) => (store as any).updateField(stepIndex, fieldIndex, { 
                  label: event.target.value 
                })}
                placeholder="Enter field label"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={field.type}
                onValueChange={(value: FieldTypeUI) =>
                  (store as any).updateField(stepIndex, fieldIndex, {
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
                    <SelectItem key={option.value} value={option.value} className="text-left">
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
                onChange={(event) => (store as any).updateField(stepIndex, fieldIndex, { 
                  field_name: event.target.value 
                })}
                placeholder="Automatically generated if left blank"
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder / Help</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(event) => (store as any).updateField(stepIndex, fieldIndex, { 
                  placeholder: event.target.value 
                })}
                placeholder="Placeholder text"
              />
            </div>
            <div className="space-y-2">
              <Label>Help Text</Label>
              <Input
                value={field.help_text || ''}
                onChange={(event) => store.updateField(stepIndex, fieldIndex, { 
                  help_text: event.target.value 
                })}
                placeholder="Help text for applicants"
              />
            </div>
            <div className="space-y-2">
              <Label>Column Span</Label>
              <Select
                value={String(field.columnSpan ?? formData.steps[stepIndex]?.layoutColumns ?? formData.layoutConfig.columns)}
                onValueChange={(value) =>
                  store.updateField(stepIndex, fieldIndex, { columnSpan: Number(value) })
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
                  store.updateField(stepIndex, fieldIndex, { required: Boolean(checked) })
                }
              />
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
            </div>
          </div>

          {/* Options for select/checkbox/radio */}
          {fieldOptions.hasOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {(field.options || []).map((option: string, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(event) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[optionIndex] = event.target.value;
                        store.updateField(stepIndex, fieldIndex, { options: newOptions });
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = (field.options || []).filter((_: any, idx: number) => idx !== optionIndex);
                        store.updateField(stepIndex, fieldIndex, { options: newOptions });
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
                    store.updateField(stepIndex, fieldIndex, { options: nextOptions });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Number field constraints */}
          {fieldOptions.hasMinMax && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Value</Label>
                <Input
                  type="number"
                  value={field.min_value ?? ''}
                  onChange={(event) =>
                    store.updateField(stepIndex, fieldIndex, {
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
                    store.updateField(stepIndex, fieldIndex, {
                      max_value: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                  placeholder="Maximum value"
                />
              </div>
            </div>
          )}

          {/* Text field max length */}
          {fieldOptions.hasMaxLength && (
            <div className="space-y-2">
              <Label>Maximum Length</Label>
              <Input
                type="number"
                value={field.max_length ?? ''}
                onChange={(event) =>
                  store.updateField(stepIndex, fieldIndex, {
                    max_length: event.target.value ? Number(event.target.value) : null,
                  })
                }
                placeholder="Maximum character length"
              />
            </div>
          )}

          {/* File field options */}
          {fieldOptions.hasFileOptions && (
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
                    store.updateField(stepIndex, fieldIndex, {
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
                    store.updateField(stepIndex, fieldIndex, {
                      max_file_size: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                  placeholder="Maximum file size in MB"
                />
              </div>
            </div>
          )}

          {/* Conditional Logic */}
          <ConditionalLogicEditor
            field={field}
            stepIndex={stepIndex}
            fieldIndex={fieldIndex}
            availableFields={formData.steps.flatMap(s => s.fields)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
