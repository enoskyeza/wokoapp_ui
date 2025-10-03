'use client';

import React from 'react';
import { Code, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormBuilderContext } from './FormBuilderProvider';
import { getFieldTypeOptions } from './utils';
import type { FormField } from './types';

interface FieldExpertConfigProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
}

export function FieldExpertConfig({ field, stepIndex, fieldIndex }: FieldExpertConfigProps) {
  const { store } = useFormBuilderContext();
  const fieldOptions = getFieldTypeOptions(field.type);

  const updateField = (updates: Partial<FormField>) => {
    (store as any).updateField(stepIndex, fieldIndex, updates);
  };

  // Custom attributes handling (stored as JSON)
  const customAttributes = field.customAttributes || {};
  
  const addCustomAttribute = () => {
    const newAttributes = { ...customAttributes, '': '' };
    updateField({ customAttributes: newAttributes });
  };

  const updateCustomAttribute = (oldKey: string, newKey: string, value: string) => {
    const newAttributes = { ...customAttributes };
    if (oldKey !== newKey && oldKey in newAttributes) {
      delete newAttributes[oldKey];
    }
    newAttributes[newKey] = value;
    updateField({ customAttributes: newAttributes });
  };

  const removeCustomAttribute = (key: string) => {
    const newAttributes = { ...customAttributes };
    delete newAttributes[key];
    updateField({ customAttributes: newAttributes });
  };

  return (
    <div className="space-y-4">
      {/* Field Name/ID */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Field Name</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Internal field identifier used in form data (auto-generated from label)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          value={field.field_name || ''}
          onChange={(e) => updateField({ field_name: e.target.value })}
          placeholder="field_name"
          className="h-9 font-mono text-sm"
        />
      </div>

      {/* File Upload Settings */}
      {fieldOptions.hasFileOptions && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Allowed File Types</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comma-separated file extensions (e.g., .pdf,.jpg,.png)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              value={(field.allowed_file_types || []).join(', ')}
              onChange={(e) => updateField({ 
                allowed_file_types: e.target.value.split(',').map(type => type.trim()).filter(Boolean)
              })}
              placeholder=".pdf, .jpg, .png, .doc"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Max File Size (MB)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum file size in megabytes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              value={field.max_file_size || ''}
              onChange={(e) => updateField({ max_file_size: e.target.value ? Number(e.target.value) : null })}
              placeholder="10"
              className="h-9"
            />
          </div>
        </>
      )}

      {/* CSS Classes */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">CSS Classes</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Custom CSS classes for styling (space-separated)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          value={field.cssClasses || ''}
          onChange={(e) => updateField({ cssClasses: e.target.value })}
          placeholder="custom-field highlight-border"
          className="h-9 font-mono text-sm"
        />
      </div>

      {/* Custom Attributes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-medium">Custom Attributes</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Custom HTML attributes (data-*, aria-*, etc.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomAttribute}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Attribute
          </Button>
        </div>

        <div className="space-y-2">
          {Object.entries(customAttributes).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={key}
                onChange={(e) => updateCustomAttribute(key, e.target.value, value)}
                placeholder="attribute-name"
                className="h-8 text-sm font-mono flex-1"
              />
              <span className="text-gray-400">=</span>
              <Input
                value={value}
                onChange={(e) => updateCustomAttribute(key, key, e.target.value)}
                placeholder="value"
                className="h-8 text-sm flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCustomAttribute(key)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {Object.keys(customAttributes).length === 0 && (
            <div className="text-xs text-gray-500 text-center py-2 border border-dashed rounded">
              No custom attributes. Click "Add Attribute" to add HTML attributes.
            </div>
          )}
        </div>
      </div>

      {/* Field Order */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Display Order</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Custom sort order (lower numbers appear first)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="number"
          value={field.order || ''}
          onChange={(e) => updateField({ order: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="100"
          className="h-9"
        />
      </div>

      {/* JSON Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">Field Configuration (JSON)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Read-only preview of the field configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          value={JSON.stringify(field, null, 2)}
          readOnly
          rows={8}
          className="text-xs font-mono bg-gray-50 border-gray-200"
        />
      </div>

      {/* Expert Mode Help */}
      <div className="text-xs text-gray-500 bg-purple-50 p-2 rounded flex items-start gap-2">
        <Code className="w-3 h-3 mt-0.5 text-purple-600" />
        <div>
          <p className="font-medium text-purple-800">Expert Mode</p>
          <p>Full control over field configuration including custom attributes, CSS classes, and file upload settings. Changes here directly affect the field's HTML output.</p>
        </div>
      </div>
    </div>
  );
}
