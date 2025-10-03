'use client';

import React, { useState } from 'react';
import { HelpCircle, Plus, Trash2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useFormBuilderContext } from './FormBuilderProvider';
import { ConditionalLogicEditor } from './ConditionalLogicEditor';
import { getFieldTypeOptions } from './utils';
import type { FormField } from './types';

interface FieldAdvancedConfigProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
}

export function FieldAdvancedConfig({ field, stepIndex, fieldIndex }: FieldAdvancedConfigProps) {
  const { store } = useFormBuilderContext();
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);
  
  const fieldOptions = getFieldTypeOptions(field.type);

  const updateField = (updates: Partial<FormField>) => {
    (store as any).updateField(stepIndex, fieldIndex, updates);
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    updateField({ options: [...currentOptions, ''] });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions];
    newOptions[optionIndex] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const currentOptions = field.options || [];
    const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
    updateField({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      {/* Help Text */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Help Text</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Additional guidance shown below the field to help users</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          value={field.help_text || ''}
          onChange={(e) => updateField({ help_text: e.target.value })}
          placeholder="Enter helpful instructions for users"
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Validation Rules */}
      {fieldOptions.hasMaxLength && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-medium">Maximum Length</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum number of characters allowed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            value={field.max_length || ''}
            onChange={(e) => updateField({ max_length: e.target.value ? Number(e.target.value) : null })}
            placeholder="e.g. 100"
            className="h-9"
          />
        </div>
      )}

      {fieldOptions.hasMinMax && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Min Value</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Minimum allowed number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              value={field.min_value || ''}
              onChange={(e) => updateField({ min_value: e.target.value ? Number(e.target.value) : null })}
              placeholder="Min"
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Max Value</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum allowed number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              value={field.max_value || ''}
              onChange={(e) => updateField({ max_value: e.target.value ? Number(e.target.value) : null })}
              placeholder="Max"
              className="h-9"
            />
          </div>
        </div>
      )}

      {/* Options for Select/Radio/Checkbox */}
      {fieldOptions.hasOptions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Options</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List of choices users can select from</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          </div>
          
          <div className="space-y-2">
            {(field.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {(!field.options || field.options.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-2 border border-dashed rounded">
                No options added yet. Click "Add Option" to create choices.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional Logic */}
      <Collapsible open={showConditionalLogic} onOpenChange={setShowConditionalLogic}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-medium">Conditional Logic</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show or hide this field based on other field values</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {showConditionalLogic ? 'Hide' : 'Configure'}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-2">
          <ConditionalLogicEditor
            field={field}
            stepIndex={stepIndex}
            fieldIndex={fieldIndex}
            availableFields={[]}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced Mode Help */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded flex items-start gap-2">
        <HelpCircle className="w-3 h-3 mt-0.5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-800">Advanced Mode</p>
          <p>Configure validation rules, help text, and conditional logic. Need more control? Switch to Expert mode for custom attributes.</p>
        </div>
      </div>
    </div>
  );
}
