import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FormField, FieldTypeUI } from './FieldRenderer';

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
  { value: 'file', label: 'File Upload' },
];

const CONDITIONAL_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'is_empty',
  'not_empty',
  '>',
  '>=',
  '<',
  '<=',
] as const;

interface FieldEditorProps {
  field: FormField;
  fieldIndex: number;
  stepIndex: number;
  maxColumns: number;
  allFields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

/**
 * FieldEditor: Component for editing individual field configuration
 * Handles all field properties, options, validation, and conditional logic
 */
export function FieldEditor({
  field,
  fieldIndex,
  stepIndex,
  maxColumns,
  allFields,
  onUpdate,
  onRemove,
}: FieldEditorProps) {
  const hasOptions = ['select', 'checkbox', 'radio'].includes(field.type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Header with type badge and controls */}
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
                onClick={onRemove}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Basic field properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={field.type}
                onValueChange={(value: FieldTypeUI) =>
                  onUpdate({
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
                    <SelectItem key={option.value} value={option.value as FieldTypeUI}>
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
                onChange={(e) => onUpdate({ field_name: e.target.value })}
                placeholder="Automatically generated if left blank"
              />
            </div>

            <div className="space-y-2">
              <Label>Placeholder / Help</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Placeholder text"
              />
            </div>

            <div className="space-y-2">
              <Label>Help Text</Label>
              <Input
                value={field.help_text || ''}
                onChange={(e) => onUpdate({ help_text: e.target.value })}
                placeholder="Additional guidance"
              />
            </div>

            <div className="space-y-2">
              <Label>Column Span</Label>
              <Select
                value={String(field.columnSpan ?? maxColumns)}
                onValueChange={(value) => onUpdate({ columnSpan: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].slice(0, maxColumns).map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      Span {option} column{option > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Required checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: Boolean(checked) })}
            />
            <Label htmlFor={`required-${field.id}`} className="text-sm">
              Required field
            </Label>
          </div>

          {/* Options for select/checkbox/radio */}
          {hasOptions && (
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
                        onUpdate({ options: newOptions });
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                        onUpdate({ options: newOptions });
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                    onUpdate({ options: newOptions });
                  }}
                >
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Number field constraints */}
          {field.type === 'number' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Value</Label>
                <Input
                  type="number"
                  value={field.min_value ?? ''}
                  onChange={(e) => onUpdate({ min_value: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Minimum"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Value</Label>
                <Input
                  type="number"
                  value={field.max_value ?? ''}
                  onChange={(e) => onUpdate({ max_value: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Maximum"
                />
              </div>
            </div>
          )}

          {/* Text field constraints */}
          {field.type === 'text' && (
            <div className="space-y-2">
              <Label>Max Length</Label>
              <Input
                type="number"
                value={field.max_length ?? ''}
                onChange={(e) => onUpdate({ max_length: e.target.value ? Number(e.target.value) : null })}
                placeholder="Maximum characters"
              />
            </div>
          )}

          {/* File upload constraints */}
          {field.type === 'file' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed File Types (comma-separated)</Label>
                <Input
                  value={(field.allowed_file_types || []).join(', ')}
                  onChange={(e) => {
                    const types = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                    onUpdate({ allowed_file_types: types.length ? types : null });
                  }}
                  placeholder="e.g., .pdf, .doc, .jpg"
                />
              </div>
              <div className="space-y-2">
                <Label>Max File Size (MB)</Label>
                <Input
                  type="number"
                  value={field.max_file_size ?? ''}
                  onChange={(e) => onUpdate({ max_file_size: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Maximum size in MB"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
