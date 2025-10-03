'use client';

import React, { useState } from 'react';
import { GripVertical, Trash2, Settings, Eye, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormBuilderContext } from './FormBuilderProvider';
import { FieldBasicConfig } from './FieldBasicConfig';
import { FieldAdvancedConfig } from './FieldAdvancedConfig';
import { FieldExpertConfig } from './FieldExpertConfig';
import { FieldRenderer } from './FieldRenderer';
import type { FormField } from './types';

interface FieldCardProps {
  field: FormField;
  stepIndex: number;
  fieldIndex: number;
}

type ConfigMode = 'simple' | 'advanced' | 'expert';

export function FieldCard({ field, stepIndex, fieldIndex }: FieldCardProps) {
  const { store } = useFormBuilderContext();
  const [configMode, setConfigMode] = useState<ConfigMode>('simple');
  const [showPreview, setShowPreview] = useState(false);

  const removeField = () => {
    (store as any).removeField(stepIndex, fieldIndex);
  };

  const toggleConfigMode = () => {
    const modes: ConfigMode[] = ['simple', 'advanced', 'expert'];
    const currentIndex = modes.indexOf(configMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setConfigMode(modes[nextIndex]);
  };

  const getConfigModeLabel = () => {
    switch (configMode) {
      case 'simple': return 'Basic';
      case 'advanced': return 'Advanced';
      case 'expert': return 'Expert';
    }
  };

  const getConfigModeColor = () => {
    switch (configMode) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Field Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {field.type}
              </Badge>
              <Badge className={`text-xs ${getConfigModeColor()}`}>
                {getConfigModeLabel()}
              </Badge>
              {field.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Preview Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`h-8 w-8 p-0 ${showPreview ? 'bg-blue-100 text-blue-600' : ''}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showPreview ? 'Hide' : 'Show'} field preview</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Configuration Mode Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleConfigMode}
                      className="h-8 w-8 p-0"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to {configMode === 'simple' ? 'Advanced' : configMode === 'advanced' ? 'Expert' : 'Basic'} mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Drag Handle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="cursor-move text-gray-400 hover:text-gray-600 h-8 w-8 flex items-center justify-center"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Drag to reorder fields</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Delete Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeField}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this field</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Field Preview */}
          {showPreview && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Preview
              </div>
              <FieldRenderer 
                field={field} 
                mode="preview" 
              />
            </div>
          )}

          {/* Configuration Section */}
          <div className="space-y-3">
            {configMode === 'simple' && (
              <FieldBasicConfig 
                field={field}
                stepIndex={stepIndex}
                fieldIndex={fieldIndex}
              />
            )}
            
            {configMode === 'advanced' && (
              <FieldAdvancedConfig 
                field={field}
                stepIndex={stepIndex}
                fieldIndex={fieldIndex}
              />
            )}
            
            {configMode === 'expert' && (
              <FieldExpertConfig 
                field={field}
                stepIndex={stepIndex}
                fieldIndex={fieldIndex}
              />
            )}
          </div>

          {/* Mode Switch Helper */}
          {configMode === 'simple' && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <HelpCircle className="w-3 h-3" />
              <span>Need more options? Click the <Settings className="w-3 h-3 inline mx-1" /> gear icon for advanced settings</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
