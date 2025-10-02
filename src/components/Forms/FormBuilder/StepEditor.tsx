import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FieldEditor } from './FieldEditor';
import { FormStep, FormField } from './types';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface StepEditorProps {
  step: FormStep;
  stepIndex: number;
  defaultColumns: number;
  allFields: FormField[];
  onUpdateStep: (key: keyof FormStep, value: any) => void;
  onUpdateField: (fieldIndex: number, updates: Partial<FormField>) => void;
  onRemoveField: (fieldIndex: number) => void;
  onAddField: () => void;
}
export function StepEditor({
  step,
  stepIndex,
  defaultColumns,
  allFields,
  onUpdateStep,
  onUpdateField,
  onRemoveField,
  onAddField,
}: StepEditorProps) {
  const stepColumns = step.layoutColumns ?? defaultColumns;
  const selectField = useFormBuilderStore((s) => s.selectField);

  const handleFieldSelect = (fieldId: string) => {
    selectField(fieldId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step Configuration</CardTitle>
          <CardDescription>
            Configure the step metadata and layout settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step Title */}
          <div className="space-y-2">
            <Label>Step Title</Label>
            <Input
              value={step.title}
              onChange={(e) => onUpdateStep('title', e.target.value)}
              placeholder="Step title"
            />
          </div>

          {/* Step Description */}
          <div className="space-y-2">
            <Label>Step Description</Label>
            <Textarea
              value={step.description}
              onChange={(e) => onUpdateStep('description', e.target.value)}
              placeholder="Brief description of this step"
              rows={2}
            />
          </div>

          {/* Layout Columns */}
          <div className="space-y-2">
            <Label>Layout Columns</Label>
            <Select
              value={String(stepColumns)}
              onValueChange={(value) => onUpdateStep('layoutColumns', Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} column{option > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Number of columns for field layout in this step
            </p>
          </div>

          {/* Per Participant */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`per-participant-${stepIndex}`}
              checked={step.perParticipant ?? true}
              onCheckedChange={(checked) => onUpdateStep('perParticipant', Boolean(checked))}
            />
            <Label htmlFor={`per-participant-${stepIndex}`} className="text-sm text-gray-600">
              Repeat per participant
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fields</h3>
          <Button onClick={onAddField} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        {step.fields.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No fields yet. Click "Add Field" to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {step.fields.map((field, fieldIndex) => (
              <FieldEditor
                key={field.id}
                field={field}
                fieldIndex={fieldIndex}
                stepIndex={stepIndex}
                maxColumns={stepColumns}
                allFields={allFields}
                onUpdate={(updates) => onUpdateField(fieldIndex, updates)}
                onRemove={() => onRemoveField(fieldIndex)}
                onSelect={() => handleFieldSelect(field.id)}
                isSelected={false} // Will be determined by store state
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
