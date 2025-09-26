'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormStep, FormField, ParticipantData } from '@/services/registrationService';
import { evaluateConditions, type ConditionContext, type ConditionGroup } from './conditionUtils';

interface ExtendedFormField extends FormField {
  per_participant?: boolean;
}

interface ExtendedFormStep extends FormStep {
  fields: ExtendedFormField[];
  per_participant?: boolean;
}

export interface DynamicStepProps {
  step: ExtendedFormStep;
  globalValues: Record<string, unknown>;
  participantValues: Array<Record<string, unknown>>;
  onGlobalChange: (values: Record<string, unknown>) => void;
  onParticipantChange: (participantIndex: number, values: Record<string, unknown>) => void;
  baseContext?: ConditionContext;
  participants: ParticipantData[];
}

const normaliseAnswers = (
  globalValues: Record<string, unknown>,
  participantValues?: Record<string, unknown>
) => ({
  ...globalValues,
  ...(participantValues || {}),
});

const renderInput = (
  field: ExtendedFormField,
  value: unknown,
  updateValue: (next: unknown) => void
) => {
  const stringValue = value != null ? String(value) : '';

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <Input
          type={field.type}
          value={stringValue}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          maxLength={field.max_length || undefined}
          required={field.required}
        />
      );

    case 'phone':
      return (
        <Input
          type="tel"
          value={stringValue}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || 'Enter phone number'}
          maxLength={field.max_length || undefined}
          required={field.required}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={stringValue}
          onChange={(e) => {
            const nextValue = e.target.value;
            updateValue(nextValue === '' ? '' : Number(nextValue));
          }}
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
          value={stringValue}
          onChange={(e) => updateValue(e.target.value)}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={stringValue}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          maxLength={field.max_length || undefined}
          rows={4}
          required={field.required}
        />
      );

    case 'dropdown':
      return (
        <Select
          value={stringValue}
          onValueChange={(selected) => updateValue(selected)}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option, index) => (
              <SelectItem key={index} value={option} className="text-left">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'radio':
      return (
        <div className="space-y-3">
          {(field.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${field.name}-${index}`}
                name={field.name}
                value={option}
                checked={value === option}
                onChange={(e) => updateValue(e.target.value)}
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

    case 'checkbox': {
      const currentValues: string[] = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-3">
          {(field.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${index}`}
                checked={currentValues.includes(option)}
                onCheckedChange={(checked) => {
                  const nextValues = checked
                    ? [...currentValues, option]
                    : currentValues.filter((item) => item !== option);
                  updateValue(nextValues);
                }}
              />
              <Label htmlFor={`${field.name}-${index}`} className="block text-left text-black font-normal text-sm">
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    case 'file':
      return (
        <div className="space-y-2">
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (field.allowed_file_types && field.allowed_file_types.length > 0) {
                const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
                if (!field.allowed_file_types.includes(extension)) {
                  alert(`File type not allowed. Allowed types: ${field.allowed_file_types.join(', ')}`);
                  return;
                }
              }

              if (field.max_file_size && file.size > field.max_file_size * 1024 * 1024) {
                alert(`File size too large. Maximum size: ${field.max_file_size}MB`);
                return;
              }

              updateValue(file);
            }}
            accept={(field.allowed_file_types || []).join(',')}
            required={field.required}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {field.allowed_file_types && field.allowed_file_types.length > 0 && (
            <p className="text-xs text-gray-500">Allowed file types: {field.allowed_file_types.join(', ')}</p>
          )}
          {field.max_file_size && (
            <p className="text-xs text-gray-500">Maximum file size: {field.max_file_size}MB</p>
          )}
        </div>
      );

    default:
      return (
        <Input
          value={stringValue}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          required={field.required}
        />
      );
  }
};

const renderField = (
  field: ExtendedFormField,
  value: unknown,
  updateValue: (next: unknown) => void,
  visibilityContext: ConditionContext,
) => {
  const conditionGroup = field.conditional_logic as ConditionGroup | undefined;
  if (!evaluateConditions(conditionGroup, visibilityContext)) {
    return null;
  }

  const spanTwoColumns =
    field.type === 'textarea' ||
    (field.type === 'checkbox' && (field.options || []).length > 3) ||
    (field.type === 'radio' && (field.options || []).length > 3);

  return (
    <div
      key={field.name}
      className={`space-y-2 ${spanTwoColumns ? 'md:col-span-2' : ''}`}
    >
      <Label className="block text-left text-black font-medium text-sm">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.help_text && <p className="text-xs text-gray-500">{field.help_text}</p>}
      {renderInput(field, value, updateValue)}
    </div>
  );
};

export function DynamicStep({
  step,
  globalValues,
  participantValues,
  onGlobalChange,
  onParticipantChange,
  baseContext,
  participants,
}: DynamicStepProps) {
  const perParticipant = step.per_participant ?? false;
  const fields = step.fields || [];

  if (perParticipant) {
    return (
      <div className="space-y-8">
        {participants.map((participant, index) => {
          const participantSpecific = participantValues[index] || {};
          const nextValues = (next: Record<string, unknown>) => onParticipantChange(index, next);
          const updateValue = (fieldName: string, value: unknown) => {
            nextValues({
              ...participantSpecific,
              [fieldName]: value,
            });
          };

          const context: ConditionContext = {
            ...(baseContext || {}),
            participant: participant as unknown as Record<string, unknown>,
            answers: normaliseAnswers(globalValues, participantSpecific),
          };

          return (
            <section key={index} className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h4 className="text-base font-semibold text-gray-800">
                  Participant {index + 1}: {participant.first_name} {participant.last_name}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) =>
                  renderField(
                    field,
                    participantSpecific[field.name],
                    (value) => updateValue(field.name, value),
                    context,
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  const updateGlobalValue = (fieldName: string, value: unknown) => {
    onGlobalChange({
      ...globalValues,
      [fieldName]: value,
    });
  };

  const globalContext: ConditionContext = {
    ...(baseContext || {}),
    answers: normaliseAnswers(globalValues),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field) =>
        renderField(
          field,
          globalValues[field.name],
          (value) => updateGlobalValue(field.name, value),
          globalContext,
        ),
      )}
    </div>
  );
}
