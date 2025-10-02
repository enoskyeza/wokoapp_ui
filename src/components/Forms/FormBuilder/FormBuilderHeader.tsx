import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormBuilderHeaderProps {
  mode: 'edit' | 'preview';
  isEditMode: boolean;
  isSaving: boolean;
  onSetMode: (mode: 'edit' | 'preview') => void;
  onSave: () => void;
  onSaveDraft?: () => void;
}

/**
 * FormBuilderHeader: Top navigation bar for form builder
 * Handles mode toggle, save actions, and navigation
 */
export function FormBuilderHeader({
  mode,
  isEditMode,
  isSaving,
  onSetMode,
  onSave,
  onSaveDraft,
}: FormBuilderHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
          {/* Back Button */}
          <Link href="/dashboard?tab=forms" className="inline-flex">
            <Button className="text-theme-primary text-white hover:bg-blue-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forms
            </Button>
          </Link>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Edit/Preview Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={mode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSetMode('edit')}
                className="rounded-r-none"
              >
                <Settings className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant={mode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSetMode('preview')}
                className="rounded-l-none"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>

            {/* Save Actions (only in edit mode) */}
            {mode === 'edit' && (
              <>
                {!isEditMode && onSaveDraft && (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={onSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                )}
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Form'}
                </Button>
              </>
            )}

            <h1 className="text-xl font-bold text-blue-900">
              {isEditMode ? 'Edit Form' : 'Form Builder'}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
