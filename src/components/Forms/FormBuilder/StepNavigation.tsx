import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StaticStep {
  id: string;
  title: string;
  description: string;
}

interface StepNavigationProps {
  staticSteps: StaticStep[];
  customSteps: Step[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onAddStep: () => void;
}

/**
 * StepNavigation: Sidebar component for navigating between form steps
 * Shows static (system) steps and custom (editable) steps
 */
export function StepNavigation({
  staticSteps,
  customSteps,
  activeStepIndex,
  onSelectStep,
  onAddStep,
}: StepNavigationProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-base">Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* System Steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              System Steps
            </p>
            <div className="space-y-2">
              {staticSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Custom Steps
            </p>
            <div className="space-y-2">
              {customSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(index)}
                  className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                    activeStepIndex === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {step.title || `Custom Step ${index + 1}`}
                    </span>
                    <Badge variant="outline">
                      Step {index + staticSteps.length + 1}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Step Button */}
        <Button variant="outline" size="sm" className="w-full" onClick={onAddStep}>
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </CardContent>
    </Card>
  );
}
