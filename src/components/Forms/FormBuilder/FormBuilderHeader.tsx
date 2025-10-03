'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormBuilderContext } from './FormBuilderProvider';
import type { FormBuilderHeaderProps } from './types';

export function FormBuilderHeader({ 
  onSave, 
  onPreview, 
  onSaveDraft 
}: FormBuilderHeaderProps) {
  const { store, isEditMode } = useFormBuilderContext();
  const { ui } = store;

  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
          <Link href="/dashboard?tab=forms" className="inline-flex">
            <Button className="text-theme-primary text-white hover:bg-blue-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2">
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
            
            {onPreview && (
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={onPreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            
            {onSave && (
              <Button
                onClick={onSave}
                disabled={ui.isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {ui.isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Form'}
              </Button>
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
