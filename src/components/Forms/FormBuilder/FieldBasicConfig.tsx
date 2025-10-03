'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormBuilderContext } from './FormBuilderProvider';
import { fieldTypes } from './types';
import type { FormField } from './types';

interface FieldBasicConfigProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
}

export function FieldBasicConfig({ field, stepIndex, fieldIndex }: FieldBasicConfigProps) {
  const { store } = useFormBuilderContext();

  const updateField = (updates: Partial<FormField>) => {
    (store as any).updateField(stepIndex, fieldIndex, updates);
  };

  return (
    <div className="space-y-3">
      {/* Field Type */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Field Type</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the type of input field (text, email, number, etc.)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={field.type}
          onValueChange={(value) => updateField({ type: value as any })}
        >
          <SelectTrigger className="h-9">
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

      {/* Field Label */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Label</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The label shown to users above the input field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          value={field.label}
          onChange={(e) => updateField({ label: e.target.value })}
          placeholder="Enter field label"
          className="h-9"
        />
      </div>

      {/* Placeholder */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Placeholder</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Hint text shown inside the input field when empty</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          value={field.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Enter placeholder text"
          className="h-9"
        />
      </div>

      {/* Required Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id={`required-${field.id}`}
          checked={field.required}
          onCheckedChange={(checked) => updateField({ required: Boolean(checked) })}
        />
        <Label htmlFor={`required-${field.id}`} className="text-sm flex items-center gap-1">
          Required field
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Users must fill this field before submitting the form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
      </div>

      {/* Column Span */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Width</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>How many columns this field should span (1-4)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={String(field.columnSpan || 1)}
          onValueChange={(value) => updateField({ columnSpan: Number(value) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((span) => (
              <SelectItem key={span} value={String(span)}>
                {span} column{span > 1 ? 's' : ''} wide
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Simple Help Text */}
      <div className="text-xs text-gray-500 bg-green-50 p-2 rounded flex items-start gap-2">
        <HelpCircle className="w-3 h-3 mt-0.5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Basic Mode</p>
          <p>Configure the essential field settings. Use the gear icon for more advanced options like validation rules and conditional logic.</p>
        </div>
      </div>
    </div>
  );
}
