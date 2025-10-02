'use client';

import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFormBuilderContext } from './FormBuilderProvider';
import { defaultStaticSteps } from './types';
import type { FormSettingsProps } from './types';

export function FormSettings({ className }: FormSettingsProps) {
  const { store } = useFormBuilderContext();
  const { formData, programs, ui } = store as any;

  return (
    <Card className={`sticky top-8 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Form Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Name */}
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input
            value={formData.basic.name}
            onChange={(event) => (store as any).updateBasic('name', event.target.value)}
            placeholder="Registration Form"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.basic.description}
            onChange={(event) => (store as any).updateBasic('description', event.target.value)}
            placeholder="Form description"
            rows={3}
          />
        </div>

        {/* Associated Program */}
        <div className="space-y-2">
          <Label>Associated Program</Label>
          <Select
            value={formData.basic.programId || ''}
            onValueChange={(value) => (store as any).updateBasic('programId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id} className="text-left">
                  {program.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Column Layout */}
        <div className="space-y-2">
          <Label>Default Column Layout</Label>
          <Select
            value={String(formData.layoutConfig.columns)}
            onValueChange={(value) => (store as any).updateLayoutConfig(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((option) => (
                <SelectItem key={option} value={String(option)} className="text-left">
                  {option} column{option > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Used as the default span for new steps and fields (max 4 columns).
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <Label>Steps</Label>
          <div className="space-y-3">
            {/* System Steps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                System Steps
              </p>
              <div className="mt-2 space-y-2">
                {defaultStaticSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{step.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Managed by the platform</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Steps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Custom Steps
              </p>
              <div className="mt-2 space-y-2">
                {formData.steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => (store as any).setActiveStep(index)}
                    className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                      ui.activeStep === index
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {step.title || `Custom Step ${index + 1}`}
                      </span>
                      <Badge variant="outline">
                        Step {index + defaultStaticSteps.length + 1}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={(store as any).addStep}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
