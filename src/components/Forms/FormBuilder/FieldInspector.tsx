/**
 * FieldInspector - Revolutionary Field Configuration Panel
 * Features field-level mini preview and progressive disclosure
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Settings, Eye, Zap } from 'lucide-react';
import { ConditionalLogicBuilder } from './ConditionalLogicBuilder';
import { FieldRenderer } from './FieldRenderer';
import type { FormField } from './types';

interface FieldInspectorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
];

/**
 * Revolutionary FieldInspector with mini preview and progressive disclosure
 */
export function FieldInspector({ field, onUpdate }: FieldInspectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const updateField = (updates: Partial<FormField>) => {
    onUpdate(updates);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Field Type & Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Field Configuration</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Field Type Selector */}
          <div>
            <Label htmlFor="field-type">Field Type</Label>
            <Select value={field.type} onValueChange={(value) => updateField({ type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Label */}
          <div>
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="Enter field label..."
            />
          </div>

          {/* Placeholder */}
          <div>
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="field-required"
              checked={field.required || false}
              onCheckedChange={(checked) => updateField({ required: checked })}
            />
            <Label htmlFor="field-required">Required field</Label>
          </div>
        </CardContent>
      </Card>

      {/* Progressive Disclosure - Advanced Settings */}
      <Card>
        <CardHeader className="pb-3">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Advanced Settings</span>
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>

        {showAdvanced && (
          <CardContent className="space-y-4">
            {/* Validation Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Validation</TabsTrigger>
                <TabsTrigger value="logic">Logic</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Validation Rules based on field type */}
                {field.type === 'text' && (
                  <>
                    <div>
                      <Label htmlFor="min-length">Minimum Length</Label>
                      <Input
                        id="min-length"
                        type="number"
                        value={field.validation?.minLength || ''}
                        onChange={(e) => updateField({
                          validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-length">Maximum Length</Label>
                      <Input
                        id="max-length"
                        type="number"
                        value={field.validation?.maxLength || ''}
                        onChange={(e) => updateField({
                          validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                        })}
                      />
                    </div>
                  </>
                )}

                {field.type === 'number' && (
                  <>
                    <div>
                      <Label htmlFor="min-value">Minimum Value</Label>
                      <Input
                        id="min-value"
                        type="number"
                        value={field.validation?.min || ''}
                        onChange={(e) => updateField({
                          validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-value">Maximum Value</Label>
                      <Input
                        id="max-value"
                        type="number"
                        value={field.validation?.max || ''}
                        onChange={(e) => updateField({
                          validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                        })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="custom-error">Custom Error Message</Label>
                  <Input
                    id="custom-error"
                    value={field.validation?.message || ''}
                    onChange={(e) => updateField({
                      validation: { ...field.validation, message: e.target.value }
                    })}
                    placeholder="Enter custom validation message..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="logic" className="space-y-4 mt-4">
                <div className="text-sm text-gray-600 mb-4">
                  Show this field only when specific conditions are met.
                </div>

                <ConditionalLogicBuilder
                  conditionalLogic={field.conditional_logic}
                  allFields={[]} // TODO: Pass actual available fields
                  onUpdate={(logic) => updateField({ conditional_logic: logic })}
                />
              </TabsContent>

              <TabsContent value="layout" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="column-span">Column Span</Label>
                  <div className="space-y-3">
                    <Select
                      value={field.columnSpan?.toString() || '4'}
                      onValueChange={(value) => updateField({ columnSpan: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Column (25%)</SelectItem>
                        <SelectItem value="2">2 Columns (50%)</SelectItem>
                        <SelectItem value="3">3 Columns (75%)</SelectItem>
                        <SelectItem value="4">4 Columns (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Visual Width Control</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">1</span>
                        <Slider
                          value={[field.columnSpan || 4]}
                          onValueChange={([value]) => updateField({ columnSpan: value })}
                          max={4}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">4</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Narrow</span>
                        <span className="font-medium">{field.columnSpan || 4} column{(field.columnSpan || 4) > 1 ? 's' : ''}</span>
                        <span>Full Width</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="help-text">Help Text</Label>
                  <Input
                    id="help-text"
                    value={field.help_text || ''}
                    onChange={(e) => updateField({ help_text: e.target.value })}
                    placeholder="Additional help text..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Expert Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowExpert(!showExpert)}
            >
              <span className="text-sm">Expert Settings</span>
              {showExpert ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showExpert && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="css-class">CSS Class</Label>
                  <Input
                    id="css-class"
                    value={field.cssClass || ''}
                    onChange={(e) => updateField({ cssClass: e.target.value })}
                    placeholder="custom-field-class"
                  />
                </div>
                <div>
                  <Label htmlFor="field-id">Field ID</Label>
                  <Input
                    id="field-id"
                    value={field.id}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Live Mini Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white">
            <FieldRenderer
              field={field}
              mode="preview"
              value=""
              onChange={() => {}}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            This is exactly how users will see this field
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
