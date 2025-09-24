'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormStep, FormField } from '@/services/registrationService';

interface DynamicStepProps {
  step: FormStep;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function DynamicStep({ step, data, onChange }: DynamicStepProps) {
  const updateField = (fieldName: string, value: unknown) => {
    onChange({
      ...data,
      [fieldName]: value
    });
  };

  const renderField = (field: FormField) => {
    const fieldValue = data[field.name] ?? '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type}
            value={fieldValue}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            maxLength={field.max_length || undefined}
            required={field.required}
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            value={fieldValue}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter phone number'}
            maxLength={field.max_length || undefined}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue}
            onChange={(e) => updateField(field.name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder || 'Enter number'}
            min={field.min_value}
            max={field.max_value}
            required={field.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue}
            onChange={(e) => updateField(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={fieldValue}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            maxLength={field.max_length || undefined}
            rows={4}
            required={field.required}
          />
        );

      case 'dropdown':
        return (
          <Select
            value={String(fieldValue || '')}
            onValueChange={(value) => updateField(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {(field.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${index}`}
                  name={field.name}
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={field.required}
                />
                <Label htmlFor={`${field.name}-${index}`} className="block text-left text-black font-normal text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        const checkboxValues: string[] = Array.isArray(fieldValue) ? (fieldValue as string[]) : [];
        return (
          <div className="space-y-3">
            {(field.options || []).map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${index}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    let newValues = [...checkboxValues];
                    if (checked) {
                      newValues.push(option);
                    } else {
                      newValues = newValues.filter(v => v !== option);
                    }
                    updateField(field.name, newValues);
                  }}
                />
                <Label htmlFor={`${field.name}-${index}`} className="block text-left text-black font-normal text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file type
                  if (field.allowed_file_types && field.allowed_file_types.length > 0) {
                    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                    if (!field.allowed_file_types.includes(fileExtension)) {
                      alert(`File type not allowed. Allowed types: ${field.allowed_file_types.join(', ')}`);
                      return;
                    }
                  }
                  
                  // Validate file size (convert MB to bytes)
                  if (field.max_file_size && file.size > field.max_file_size * 1024 * 1024) {
                    alert(`File size too large. Maximum size: ${field.max_file_size}MB`);
                    return;
                  }
                  
                  updateField(field.name, file);
                }
              }}
              accept={(field.allowed_file_types || []).join(',')}
              required={field.required}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {field.allowed_file_types && field.allowed_file_types.length > 0 && (
              <p className="text-xs text-gray-500">
                Allowed file types: {field.allowed_file_types.join(', ')}
              </p>
            )}
            {field.max_file_size && (
              <p className="text-xs text-gray-500">
                Maximum file size: {field.max_file_size}MB
              </p>
            )}
          </div>
        );

      default:
        return (
          <Input
            value={String(fieldValue || '')}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {step.fields.map((field) => (
        <div
          key={field.name}
          className={`space-y-2 ${
            field.type === 'textarea' || 
            (field.type === 'checkbox' && (field.options || []).length > 3) || 
            (field.type === 'radio' && (field.options || []).length > 3)
              ? 'md:col-span-2' 
              : ''
          }`}
        >
          <Label className="block text-left text-black font-medium text-sm">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.help_text && (
            <p className="text-xs text-gray-500">{field.help_text}</p>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}
