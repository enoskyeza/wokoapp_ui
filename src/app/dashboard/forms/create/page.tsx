'use client';

import DashboardLayout from '@/components/Layouts/Dashboard';
import { FormBuilderEditor } from '@/components/Forms/FormBuilderEditor';

export default function FormCreatePage() {
  return (
    <DashboardLayout>
      <FormBuilderEditor />
    </DashboardLayout>
  );
}
