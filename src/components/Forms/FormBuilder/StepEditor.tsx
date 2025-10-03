'use client';

import React from 'react';
import { Layout, Plus, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFormBuilderContext } from './FormBuilderProvider';
import { StepConditionalLogicEditor } from './StepConditionalLogicEditor';
import { FieldCard } from './FieldCard';
import type { StepEditorProps } from './types';

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
        </div>

        {/* Remove Step Button */}
        <div className="flex justify-end pt-4 border-t">
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
