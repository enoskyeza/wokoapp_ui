/**
 * useFormActions Hook
 * Provides all CRUD operations for form builder
 * Handles steps, fields, and layout management
 */

import { useCallback } from 'react';
import { slugify, clampColumnCount, clampColumnSpan } from '../utils';
import type { FormBuilderData, FormStep, FormField } from '../types';

interface UseFormActionsProps {
  formData: FormBuilderData;
  setFormData: React.Dispatch<React.SetStateAction<FormBuilderData>>;
}

export function useFormActions({ formData, setFormData }: UseFormActionsProps) {
  // ==================== Basic Info Actions ====================
  
  const updateBasic = useCallback((field: keyof FormBuilderData['basic'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value,
      },
    }));
  }, [setFormData]);

  const updateLayoutColumns = useCallback((columns: number) => {
    setFormData((prev) => {
      const clampedColumns = clampColumnCount(columns);
      return {
        ...prev,
        layoutConfig: {
          ...prev.layoutConfig,
          columns: clampedColumns,
        },
        steps: prev.steps.map((step) => {
          const nextColumns = clampColumnCount(step.layoutColumns ?? clampedColumns);
          return {
            ...step,
            layoutColumns: nextColumns,
            fields: step.fields.map((field) => ({
              ...field,
              columnSpan: clampColumnSpan(field.columnSpan ?? clampedColumns, nextColumns),
            })),
          };
        }),
      };
    });
  }, [setFormData]);

  // ==================== Step Actions ====================
  
  const addStep = useCallback(() => {
    const timestamp = Date.now();
    const nextIndex = formData.steps.length;
    const newStep: FormStep = {
      id: `step-${timestamp}`,
      key: `step-${timestamp}`,
      title: `Step ${nextIndex + 1}`,
      description: 'New form step',
      fields: [],
      perParticipant: true,
      layoutColumns: formData.layoutConfig.columns,
      conditional_logic: { mode: 'all', rules: [] },
    };
    
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    
    return nextIndex; // Return new step index
  }, [formData.steps.length, formData.layoutConfig.columns, setFormData]);

  const updateStep = useCallback((
    index: number,
    key: keyof FormStep,
    value: FormStep[keyof FormStep]
  ) => {
    setFormData((prev) => {
      const steps = prev.steps.map((step, idx) => {
        if (idx !== index) return step;

        if (key === 'layoutColumns') {
          const columns = clampColumnCount(value as number);
          return {
            ...step,
            layoutColumns: columns,
            fields: step.fields.map((field) => ({
              ...field,
              columnSpan: clampColumnSpan(field.columnSpan, columns),
            })),
          };
        }

        return { ...step, [key]: value };
      });

      return {
        ...prev,
        steps,
      };
    });
  }, [setFormData]);

  const removeStep = useCallback((index: number) => {
    setFormData((prev) => {
      const steps = prev.steps.filter((_, idx) => idx !== index);
      return {
        ...prev,
        steps,
      };
    });
  }, [setFormData]);

  // ==================== Field Actions ====================
  
  const addField = useCallback((stepIndex: number) => {
    const generatedName = slugify(`field_${Date.now()}`);
    const targetColumns = clampColumnCount(
      formData.steps[stepIndex]?.layoutColumns ?? formData.layoutConfig.columns
    );
    
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      field_name: generatedName,
      conditional_logic: { mode: 'all', rules: [] },
      columnSpan: targetColumns,
    };
    
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, idx) =>
        idx === stepIndex ? { ...step, fields: [...step.fields, newField] } : step
      ),
    }));
  }, [formData.steps, formData.layoutConfig.columns, setFormData]);

  const updateField = useCallback((
    stepIndex: number,
    fieldIndex: number,
    updates: Partial<FormField>
  ) => {
    setFormData((prev) => {
      const steps = prev.steps.map((step, sIdx) => {
        if (sIdx !== stepIndex) return step;

        const stepColumns = clampColumnCount(step.layoutColumns ?? prev.layoutConfig.columns);
        const fields = step.fields.map((field, fIdx) => {
          if (fIdx !== fieldIndex) return field;

          const nextField: FormField = { ...field, ...updates };

          // Auto-generate field_name from label if needed
          if (
            typeof updates.label === 'string' &&
            (!field.field_name || field.field_name.startsWith('field_'))
          ) {
            nextField.field_name = slugify(updates.label);
          }

          // Handle explicit field_name updates
          if (Object.prototype.hasOwnProperty.call(updates, 'field_name')) {
            const trimmed = updates.field_name?.trim();
            nextField.field_name = trimmed 
              ? slugify(trimmed) 
              : slugify(nextField.label || `field_${Date.now()}`);
          }

          // Clamp column span
          if (Object.prototype.hasOwnProperty.call(updates, 'columnSpan')) {
            nextField.columnSpan = clampColumnSpan(Number(nextField.columnSpan), stepColumns);
          } else {
            nextField.columnSpan = clampColumnSpan(nextField.columnSpan, stepColumns);
          }

          return nextField;
        });

        return { ...step, fields };
      });

      return { ...prev, steps };
    });
  }, [setFormData]);

  const removeField = useCallback((stepIndex: number, fieldIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, sIdx) =>
        sIdx === stepIndex
          ? { ...step, fields: step.fields.filter((_, fIdx) => fIdx !== fieldIndex) }
          : step
      ),
    }));
  }, [setFormData]);

  // ==================== Utility Actions ====================
  
  const saveDraft = useCallback(() => {
    const key = `form_builder_draft_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(formData));
    return key;
  }, [formData]);

  return {
    // Basic info
    updateBasic,
    updateLayoutColumns,
    
    // Steps
    addStep,
    updateStep,
    removeStep,
    
    // Fields
    addField,
    updateField,
    removeField,
    
    // Utility
    saveDraft,
  };
}
