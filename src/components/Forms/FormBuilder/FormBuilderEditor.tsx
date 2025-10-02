/**
 * FormBuilderEditor - Clean Refactored Version
 * Entry point for form builder with minimal orchestration logic
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { FormBuilderProvider, useFormBuilderContext } from './FormBuilderProvider';
import { FormBuilderHeader } from './FormBuilderHeader';
import { FormBuilderContent } from './FormBuilderContent';
import { useFormData, normalizeFormData } from './hooks/useFormData';
import { useFormActions } from './hooks/useFormActions';
import { buildPayload, validatePayload } from './payloadBuilder';
import { validateFormData } from './utils';
import { programService } from '@/services/programService';
import { formsService } from '@/services/formsService';
import { programFormService } from '@/services/programFormService';
import type { FormBuilderData, ProgramOption } from './types';

interface FormBuilderEditorProps {
  formId?: string;
  previewMode?: boolean;
}

function FormBuilderEditorInner({ formId, previewMode }: FormBuilderEditorProps) {
  const router = useRouter();
  const { mode, setMode } = useFormBuilderContext();
  const { loading, initialData, notFound } = useFormData(formId);
  
  const [formData, setFormData] = useState<FormBuilderData>(() => {
    const normalized = normalizeFormData(initialData);
    return {
      ...normalized,
      basic: {
        ...normalized.basic,
        programId: normalized.basic.programId || '',
      },
    };
  });
  
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(formId);

  const actions = useFormActions({ formData, setFormData });

  // Set initial mode based on previewMode prop
  useEffect(() => {
    if (previewMode) {
      setMode('preview');
    }
  }, [previewMode, setMode]);

  // Load programs
  useEffect(() => {
    programService.getAllPrograms().then((list) => {
      setPrograms(list.filter((p) => p.active === true));
    });
  }, []);

  // Update form data when initial data loads
  useEffect(() => {
    if (initialData) {
      const normalized = normalizeFormData(initialData);
      setFormData({
        ...normalized,
        basic: {
          ...normalized.basic,
          programId: normalized.basic.programId || '',
        },
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    const validation = validateFormData(formData);
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload(formData);
      const payloadValidation = validatePayload(payload);
      
      if (!payloadValidation.valid) {
        payloadValidation.errors.forEach((error) => toast.error(error));
        return;
      }

      if (isEditMode && formId) {
        await programFormService.updateForm(formId, {
          title: payload.title,
          description: payload.description,
          fields: payload.fields,
          steps: payload.steps,
          layout_config: payload.layout_config,
        });
        toast.success('Form updated successfully');
      } else {
        await formsService.createProgramForm(payload);
        toast.success('Form created successfully', {
          description: `"${formData.basic.name}" is ready for use`,
        });
      }

      router.push('/dashboard?tab=forms');
    } catch (error) {
      console.error('Error saving form', error);
      toast.error('Failed to save form', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    const key = actions.saveDraft();
    toast.success('Draft saved to local storage', {
      description: `Key: ${key}`,
    });
  };

  if (loading || !initialData) {
    return (
      <div className="py-12 text-center text-gray-500">Loading form builder...</div>
    );
  }

  if (notFound) {
    return (
      <div className="py-12 text-center">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Form not found</CardTitle>
            <CardDescription>
              We couldn&apos;t find this form. It may have been deleted or the link is incorrect.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-2">
            <Link href="/dashboard?tab=forms">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormBuilderHeader
        mode={mode}
        isEditMode={isEditMode}
        isSaving={isSaving}
        onSetMode={setMode}
        onSave={handleSave}
        onSaveDraft={!isEditMode ? handleSaveDraft : undefined}
      />

      <FormBuilderContent
        formData={formData}
        programs={programs}
        onUpdateBasic={actions.updateBasic}
        onUpdateLayoutColumns={actions.updateLayoutColumns}
        onUpdateStep={actions.updateStep}
        onUpdateField={actions.updateField}
        onRemoveField={actions.removeField}
        onAddField={actions.addField}
        onAddStep={actions.addStep}
      />
    </div>
  );
}

export function FormBuilderEditor(props: FormBuilderEditorProps) {
  return (
    <FormBuilderProvider>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form builder…</div>}>
        <FormBuilderEditorInner {...props} />
      </Suspense>
    </FormBuilderProvider>
  );
}
