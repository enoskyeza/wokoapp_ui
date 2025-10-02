'use client';

import DashboardLayout from '@/components/Layouts/Dashboard';
import { FormBuilderEditor } from '@/components/Forms/FormBuilder/FormBuilderEditor';

export default function FormCreatePage() {
  return (
    <DashboardLayout>
      {/* Revolutionary New Form Builder */}
      <div className="min-h-screen bg-gray-50">
        <div className="bg-blue-600 text-white p-4 text-center">
          <h1 className="text-xl font-bold">🚀 REVOLUTIONARY FORM BUILDER - NEW VERSION</h1>
          <p className="text-blue-100">Figma-like three-panel layout with live preview</p>
        </div>
        <FormBuilderEditor />
      </div>
    </DashboardLayout>
  );
}
