import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type FieldTypeUI =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'number'
  | 'date'
  | 'url';

export interface FormField {
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
  conditional_logic?: {
    mode: 'all' | 'any';
    rules: Array<{ field: string; op: string; value?: any }>;
  };
  columnSpan?: number;
}

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  mode?: 'edit' | 'preview';
}

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * FieldRenderer: Unified component for rendering form fields
 * Works in both edit and preview modes
 * Handles all field types consistently
 */
export function FieldRenderer({ field, value, onChange, mode = 'preview' }: FieldRendererProps) {
  const key = field.field_name || slugifyLabel(field.label);

  // Text area
  if (field.type === 'textarea') {
    return (
      <Textarea
        placeholder={field.placeholder}
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
        disabled={mode === 'edit'}
      />
    );
  }

  // Select/Dropdown
  if (field.type === 'select') {
    return (
      <Select 
        value={String(value ?? '')} 
        onValueChange={(val) => onChange(val)}
        disabled={mode === 'edit'}
      >
        <SelectTrigger>
          <SelectValue placeholder={field.placeholder || 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Checkboxes
  if (field.type === 'checkbox') {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        {(field.options || []).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selectedValues, option]);
                } else {
                  onChange(selectedValues.filter((v) => v !== option));
                }
              }}
              disabled={mode === 'edit'}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  // Radio buttons
  if (field.type === 'radio') {
    return (
      <div className="space-y-2">
        {(field.options || []).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={key}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
              className="h-4 w-4"
              disabled={mode === 'edit'}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }

  // File upload
  if (field.type === 'file') {
    return (
      <Input 
        type="file" 
        disabled 
        className="cursor-not-allowed opacity-70" 
      />
    );
  }

  // Default: text-based inputs (text, email, tel, number, date, url)
  return (
    <Input
      type={field.type}
      placeholder={field.placeholder}
      value={String(value ?? '')}
      onChange={(event) => onChange(event.target.value)}
      disabled={mode === 'edit'}
      min={field.type === 'number' ? field.min_value ?? undefined : undefined}
      max={field.type === 'number' ? field.max_value ?? undefined : undefined}
      maxLength={field.max_length ?? undefined}
    />
  );
}

interface FieldWrapperProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  mode?: 'edit' | 'preview';
  showLabel?: boolean;
}

/**
 * FieldWrapper: Wraps FieldRenderer with label and help text
 * Provides consistent field presentation
 */
export function FieldWrapper({ 
  field, 
  value, 
  onChange, 
  mode = 'preview',
  showLabel = true 
}: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label className="text-sm font-medium text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {field.help_text && (
        <p className="text-xs text-gray-500">{field.help_text}</p>
      )}
      <FieldRenderer 
        field={field} 
        value={value} 
        onChange={onChange} 
        mode={mode}
      />
    </div>
  );
}
