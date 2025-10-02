'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { slugify } from './utils';
import type { FieldRendererProps } from './types';

export function FieldRenderer({ 
  field, 
  mode, 
  value, 
  onChange, 
  className = '' 
}: FieldRendererProps) {
  const key = field.field_name || slugify(field.label);

  // Edit mode - show field configuration
  if (mode === 'edit') {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-sm font-medium text-gray-800">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {field.help_text && (
          <p className="text-xs text-gray-500">{field.help_text}</p>
        )}
        <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Preview mode will show the actual field
          </p>
        </div>
      </div>
    );
  }

  // Preview mode - render actual field
  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
            maxLength={field.max_length || undefined}
          />
        );

      case 'select':
        return (
          <Select 
            value={String(value ?? '')} 
            onValueChange={(val) => onChange?.(val)}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} 
              />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={option} value={option} className="text-left">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        const arrayValue = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={arrayValue.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange?.([...arrayValue, option]);
                    } else {
                      onChange?.(arrayValue.filter((item) => item !== option));
                    }
                  }}
                />
                <Label className="text-sm text-gray-700">{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <label 
                key={option} 
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name={key}
                  value={option}
                  checked={value === option}
                  onChange={(event) => onChange?.(event.target.value)}
                  className="h-4 w-4"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <Input 
            type="file" 
            accept={field.allowed_file_types?.join(',') || undefined}
            disabled={mode === 'preview'} 
            className={mode === 'preview' ? 'cursor-not-allowed opacity-70' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(Number(event.target.value) || '')}
            min={field.min_value || undefined}
            max={field.max_value || undefined}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
            maxLength={field.max_length || undefined}
          />
        );

      case 'tel':
        return (
          <Input
            type="tel"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
            maxLength={field.max_length || undefined}
          />
        );

      case 'url':
        return (
          <Input
            type="url"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
            maxLength={field.max_length || undefined}
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange?.(event.target.value)}
            maxLength={field.max_length || undefined}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-800">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.help_text && (
        <p className="text-xs text-gray-500">{field.help_text}</p>
      )}
      {renderField()}
    </div>
  );
}
