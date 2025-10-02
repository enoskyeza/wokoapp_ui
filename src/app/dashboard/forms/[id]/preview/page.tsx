'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import DashboardLayout from '@/components/Layouts/Dashboard';
import { FormBuilderEditor } from '@/components/Forms/FormBuilder/FormBuilderEditor';

function PreviewFormContent() {
  const params = useParams();
  const formId = params.id as string;
  
  return <FormBuilderEditor formId={formId} previewMode={true} />;
}

export default function FormPreviewPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form preview…</div>}>
        <PreviewFormContent />
      </Suspense>
    </DashboardLayout>
  );
}
