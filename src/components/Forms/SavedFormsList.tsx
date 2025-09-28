'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Edit3,
  Trash2,
  Calendar,
  FileText,
  Search,
  Eye,
  Users,
  Loader2,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FormTemplate } from '@/services/dashboardService';
import { programFormService } from '@/services/programFormService';
import FormPreview from '@/components/Forms/FormPreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type PreviewField = {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  columnSpan?: number | null;
  helpText?: string;
};

type PreviewStep = {
  id: string;
  title: string;
  description: string;
  fields: PreviewField[];
  layoutColumns?: number | null;
};

const clampColumnCount = (value?: number | null) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 1;
  }
  return Math.min(4, Math.max(1, Math.floor(numeric)));
};

const clampColumnSpan = (value?: number | null, columns = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(1, columns);
  }
  return Math.min(columns, Math.max(1, Math.floor(numeric)));
};

export default function SavedFormsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: dashboardData, isLoading: loading, error, refresh } = useDashboardData();
  const router = useRouter();
  const [previewData, setPreviewData] = useState<{ name: string; description?: string; steps: PreviewStep[] } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Use forms data from dashboard API
  const forms = useMemo(() => dashboardData?.forms || [], [dashboardData?.forms]);

  const filteredForms = useMemo(() => 
    forms.filter(form =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.programTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ), [forms, searchQuery]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };
  const mapFieldType = (type: string): PreviewField['type'] => {
    switch (type) {
      case 'textarea':
        return 'textarea';
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'dropdown':
        return 'select';
      case 'radio':
        return 'radio';
      case 'checkbox':
        return 'checkbox';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  };

  const handleViewForm = async (form: FormTemplate) => {
    setPreviewingId(form.id);
    try {
      const structure = await programFormService.getFormStructure(form.id);
      if (!structure) {
        toast.error('Unable to load form preview');
        return;
      }

      const dynamicSteps = Array.isArray(structure.steps)
        ? structure.steps.filter((step) => !step.is_static)
        : [];

      const fallbackColumns = clampColumnCount(structure.layout_config?.columns ?? 1);

      const previewSteps: PreviewStep[] = dynamicSteps.map((step, index) => {
        const stepColumns = clampColumnCount(
          (step.layout && 'columns' in step.layout ? Number(step.layout.columns) : undefined) ?? fallbackColumns,
        );
        const fields = Array.isArray(step.fields)
          ? step.fields.map((field, fieldIndex) => {
              const rawSpan =
                field && typeof field === 'object' && 'column_span' in field
                  ? Number((field as { column_span?: number | null }).column_span)
                  : undefined;
              const span = clampColumnSpan(rawSpan, stepColumns);
              const rawOptions = Array.isArray(field.options)
                ? field.options.map((option) => {
                    if (typeof option === 'string') return option;
                    if (option && typeof option === 'object') {
                      const obj = option as { label?: string; value?: string };
                      return obj.label ?? obj.value ?? '';
                    }
                    return '';
                  })
                : undefined;

              return {
                id: String(field.field_name || field.id || `${index}-${fieldIndex}`),
                type: mapFieldType(String(field.field_type)),
                label: field.label,
                placeholder: field.help_text || '',
                required: Boolean(field.is_required ?? field.required),
                options: rawOptions?.filter((option) => option),
                columnSpan: span,
                helpText: field.help_text,
              };
            }).filter((field) => Boolean(field.label))
          : [];

        return {
          id: step.key || step.title || `step-${index + 1}`,
          title: step.title || `Additional Information ${index + 1}`,
          description: step.description || '',
          fields,
          layoutColumns: stepColumns,
        };
      }).filter((step) => step.fields.length > 0);

      setPreviewData({
        name: form.name,
        description: structure.description || form.programTitle,
        steps: previewSteps,
      });
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error loading form preview:', error);
      toast.error('Failed to load form preview');
    } finally {
      setPreviewingId(null);
    }
  };

  const handleEditForm = (form: FormTemplate) => {
    router.push(`/dashboard/forms/${form.id}/edit`);
  };

  const handleDeleteForm = async (form: FormTemplate) => {
    setDeletingId(form.id);
    try {
      const success = await programFormService.deleteForm(form.id);
      if (!success) {
        toast.error('Failed to delete form');
        return;
      }
      toast.success('Form deleted', {
        description: `"${form.name}" has been removed`,
      });
      refresh();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete form');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search forms by name or program..."
          className="pl-10"
        />
      </div>

      {/* Forms count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          Failed to refresh forms: {error}
        </div>
      )}

      {/* Empty state */}
      {filteredForms.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery ? 'No forms match your search' : 'No saved forms found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search terms or clear the search to see all forms.'
              : 'Create and save your first form to see it here.'
            }
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Link href="/dashboard/forms/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Create New Form
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Forms grid */}
      {filteredForms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {form.name}
                    </CardTitle>
                    <CardDescription className="text-sm truncate">
                      {form.programTitle}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      Saved
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {form.fields} fields
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {form.submissions} submissions
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatDate(form.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewForm(form)}
                    disabled={previewingId === form.id}
                  >
                    {previewingId === form.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-3 h-3 mr-1" />
                    )}
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditForm(form)}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === form.id}
                      >
                        {deletingId === form.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{form.name}&quot;? This will also remove all associated form responses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteForm(form)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deletingId === form.id}
                        >
                          {deletingId === form.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewData && (
        <FormPreview
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewData(null);
          }}
          formName={previewData.name}
          formDescription={previewData.description}
          steps={previewData.steps}
        />
      )}
    </div>
  );
}
