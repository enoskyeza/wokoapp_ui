'use client';

import { useState, useMemo } from 'react';
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
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FormTemplate } from '@/services/dashboardService';
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

export default function SavedFormsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: dashboardData, isLoading: loading, error } = useDashboardData();
  
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

  const deleteForm = async (form: FormTemplate) => {
    try {
      // TODO: Implement actual delete API call
      // await fetch(`/api/register/program_forms/${form.id}/`, { method: 'DELETE' });
      
      toast.success('Form deleted', {
        description: `"${form.name}" has been removed`
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
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
                    onClick={() => {
                      // TODO: Navigate to form preview/view
                      toast.info('Form preview coming soon');
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      // TODO: Navigate to form edit
                      toast.info('Form editing coming soon');
                    }}
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
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{form.name}&quot;? 
                          This will also remove all associated form responses. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteForm(form)}
                          className="bg-red-600 hover:bg-red-700"
                        >
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

    </div>
  );
}
