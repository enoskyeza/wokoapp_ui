'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormBuilderProvider, useFormBuilderContext } from './FormBuilderProvider';
import { FormBuilderHeader } from './FormBuilderHeader';
import { FormSettings } from './FormSettings';
import { StepEditor } from './StepEditor';
import { FormPreview } from './FormPreview';
import { buildPayload, validateFormData } from './utils';
import { formsService } from '@/services/formsService';
import { programFormService } from '@/services/programFormService';
import type { FormBuilderEditorProps } from './types';

function FormBuilderEditorInner() {
  const router = useRouter();
  const { store, isEditMode } = useFormBuilderContext();
  const { formData, ui } = store;

  const handleSave = async () => {
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    store.setIsSaving(true);
    try {
      const payload = buildPayload(formData);
      
      if (isEditMode && store.formId) {
        await programFormService.updateForm(store.formId, {
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
      store.setIsSaving(false);
    }
  };

  const handlePreview = () => {
    store.setShowPreview(true);
    store.setPreviewStep(0);
  };

  const handleSaveDraft = () => {
    if (isEditMode) return;
    const key = `form_builder_draft_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(formData));
    toast.success('Draft saved to local storage');
  };

  // Loading state
  if (ui.isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading form builder...
      </div>
    );
  }

  // Not found state
  if (ui.notFound) {
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
      {/* Header */}
      <FormBuilderHeader
        onSave={handleSave}
        onPreview={handlePreview}
        onSaveDraft={handleSaveDraft}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Settings */}
          <div className="lg:col-span-1">
            <FormSettings />
          </div>

          {/* Main Content - Step Editor */}
          <div className="lg:col-span-3 space-y-6">
            <StepEditor stepIndex={ui.activeStep} />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <FormPreview
        isOpen={ui.showPreview}
        onClose={() => store.setShowPreview(false)}
      />
    </div>
  );
}

export function FormBuilderEditorNew(props: FormBuilderEditorProps) {
  return (
    <FormBuilderProvider formId={props.formId}>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form builder…</div>}>
        <FormBuilderEditorInner />
      </Suspense>
    </FormBuilderProvider>
  );
}
