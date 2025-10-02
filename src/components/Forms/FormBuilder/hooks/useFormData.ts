/**
 * useFormData Hook - Simplified Version
 * Handles form data loading, initialization, and normalization
 */

import { useState, useEffect } from 'react';
import type { FormBuilderData } from '../types';

const defaultFormData: FormBuilderData = {
  basic: {
    name: 'New Form',
    description: 'Create your custom form',
    programId: '',
  },
  steps: [
    {
      id: 'step-1',
      title: 'Additional Information',
      description: 'Program-specific requirements',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Sample Text Field',
          field_name: 'sample_field',
          placeholder: 'Enter text here...',
          required: false,
          columnSpan: 4,
        },
        {
          id: 'field-2',
          type: 'email',
          label: 'Email Address',
          field_name: 'email_field',
          placeholder: 'Enter email...',
          required: true,
          columnSpan: 2,
        },
      ],
    },
  ],
  layoutConfig: {
    columns: 4,
  },
};

export function normalizeFormData(data?: FormBuilderData): FormBuilderData {
  if (!data) return defaultFormData;
  
  return {
    basic: {
      name: data.basic?.name || defaultFormData.basic.name,
      description: data.basic?.description || defaultFormData.basic.description,
      programId: data.basic?.programId || defaultFormData.basic.programId,
    },
    steps: data.steps || defaultFormData.steps,
    layoutConfig: data.layoutConfig || defaultFormData.layoutConfig,
  };
}

export function useFormData(formId?: string) {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [initialData, setInitialData] = useState<FormBuilderData>(defaultFormData);

  useEffect(() => {
    if (formId) {
      setLoading(true);
      // TODO: Load actual form data from API
      setTimeout(() => {
        setInitialData(defaultFormData);
        setLoading(false);
      }, 500);
    } else {
      setInitialData(defaultFormData);
    }
  }, [formId]);

  return {
    loading,
    notFound,
    initialData,
  };
}
