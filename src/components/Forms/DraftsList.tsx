'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  FileText, 
  AlertCircle,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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

interface DraftItem {
  key: string;
  data: any;
  timestamp: number;
  formName: string;
  programName: string;
  stepCount: number;
  fieldCount: number;
}

export default function DraftsList() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    setLoading(true);
    try {
      const draftItems: DraftItem[] = [];
      
      // Scan localStorage for draft keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('form_builder_draft_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const timestamp = parseInt(key.replace('form_builder_draft_', ''));
            
            draftItems.push({
              key,
              data,
              timestamp,
              formName: data.basic?.name || 'Untitled Form',
              programName: data.basic?.programId ? `Program ${data.basic.programId}` : 'No Program Selected',
              stepCount: data.steps?.length || 0,
              fieldCount: data.steps?.reduce((total: number, step: any) => total + (step.fields?.length || 0), 0) || 0
            });
          } catch (error) {
            console.error('Error parsing draft:', key, error);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      draftItems.sort((a, b) => b.timestamp - a.timestamp);
      setDrafts(draftItems);
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const resumeEdit = (draft: DraftItem) => {
    try {
      // Store the draft data in a special key for the form builder to pick up
      localStorage.setItem('form_builder_resume_draft', JSON.stringify(draft.data));
      
      // Navigate to form builder with resume flag
      router.push('/dashboard/forms/create?resume=true');
      
      toast.success('Resuming draft...', {
        description: `Loading "${draft.formName}"`
      });
    } catch (error) {
      console.error('Error resuming draft:', error);
      toast.error('Failed to resume draft');
    }
  };

  const deleteDraft = (draft: DraftItem) => {
    try {
      localStorage.removeItem(draft.key);
      setDrafts(prev => prev.filter(d => d.key !== draft.key));
      toast.success('Draft deleted', {
        description: `"${draft.formName}" has been removed`
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  const clearAllDrafts = () => {
    try {
      drafts.forEach(draft => {
        localStorage.removeItem(draft.key);
      });
      setDrafts([]);
      toast.success('All drafts cleared');
    } catch (error) {
      console.error('Error clearing drafts:', error);
      toast.error('Failed to clear drafts');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No drafts found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start creating a form and save it as a draft to see it here.
        </p>
        <div className="mt-6">
          <Button 
            onClick={() => router.push('/dashboard/forms/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Create New Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {drafts.length} draft{drafts.length !== 1 ? 's' : ''} found
        </p>
        {drafts.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Drafts</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {drafts.length} draft{drafts.length !== 1 ? 's' : ''} from your local storage. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllDrafts} className="bg-red-600 hover:bg-red-700">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Drafts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drafts.map((draft) => (
          <Card key={draft.key} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {draft.formName}
                  </CardTitle>
                  <CardDescription className="text-sm truncate">
                    {draft.programName}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  Draft
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {draft.stepCount} steps
                </span>
                <span className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  {draft.fieldCount} fields
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span title={formatDate(draft.timestamp)}>
                  {getTimeAgo(draft.timestamp)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  onClick={() => resumeEdit(draft)}
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Resume Edit
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
                      <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{draft.formName}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteDraft(draft)}
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
    </div>
  );
}
