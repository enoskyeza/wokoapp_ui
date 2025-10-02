'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import DashboardLayout from '@/components/Layouts/Dashboard';
import { FormBuilderEditor } from '@/components/Forms/FormBuilder/FormBuilderEditor';

function EditFormContent() {
  const params = useParams();
  const formId = params.id as string;
  return <FormBuilderEditor formId={formId} />;
}

export default function FormEditPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading form…</div>}>
        <EditFormContent />
      </Suspense>
    </DashboardLayout>
  );
}
