'use client';

import React from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormBuilderContext } from './FormBuilderProvider';
import { getGuardianFields, getParticipantFields, getProgramCategoryFields } from './types';
import type { ConditionalLogic, ConditionalRule } from './types';

interface StepConditionalLogicEditorProps {
  stepIndex: number;
  step: any;
}

export function StepConditionalLogicEditor({
  stepIndex,
  step,
}: StepConditionalLogicEditorProps) {
  const { store } = useFormBuilderContext();
  const { formData, selectedProgram } = store as any;

  const rules = step.conditionalLogic?.rules || [];

  // Get all available fields for conditional logic using real backend data
  const getAllAvailableFields = () => {
    const fields = [];
    
    // Add guardian fields (from backend STATIC_GUARDIAN_TEMPLATE)
    fields.push({
      group: 'Guardian Information',
      fields: getGuardianFields(),
    });
    
    // Add participant fields (from backend STATIC_PARTICIPANT_TEMPLATE)
    fields.push({
      group: 'Participant Information',
      fields: getParticipantFields(),
    });
    
    // Add program category fields if selected program has category_label
    if (selectedProgram?.category_label) {
      const categoryFields = getProgramCategoryFields(selectedProgram);
      if (categoryFields.length > 0) {
        fields.push({
          group: `${selectedProgram.category_label}`,
          fields: categoryFields,
        });
      }
    }
    
    // Add custom form fields (only fields from previous steps)
    const customFields = [];
    for (const [sIndex, formStep] of formData.steps.entries()) {
      if (sIndex < stepIndex) { // Only previous steps
        for (const stepField of formStep.fields) {
          customFields.push(stepField);
        }
      }
    }
    
    if (customFields.length > 0) {
      fields.push({
        group: 'Form Fields',
        fields: customFields,
      });
    }
    
    return fields;
  };

  const availableFields = getAllAvailableFields();

  const addRule = () => {
    const newRule: ConditionalRule = {
      field: '',
      operator: 'equals',
      value: '',
    };

    const updatedLogic: ConditionalLogic = {
      operator: step.conditionalLogic?.operator || 'and',
      rules: [...rules, newRule],
    };

    (store as any).updateStepConditionalLogic(stepIndex, updatedLogic);
  };

  const updateRule = (ruleIndex: number, updates: Partial<ConditionalRule>) => {
    const updatedRules = rules.map((rule: any, index: number) =>
      index === ruleIndex ? { ...rule, ...updates } : rule
    );

    const updatedLogic: ConditionalLogic = {
      operator: step.conditionalLogic?.operator || 'and',
      rules: updatedRules,
    };

    (store as any).updateStepConditionalLogic(stepIndex, updatedLogic);
  };

  const removeRule = (ruleIndex: number) => {
    const updatedRules = rules.filter((_: any, index: number) => index !== ruleIndex);
    
    if (updatedRules.length === 0) {
      // Remove conditional logic entirely if no rules
      (store as any).updateStepConditionalLogic(stepIndex, undefined);
    } else {
      const updatedLogic: ConditionalLogic = {
        operator: step.conditionalLogic?.operator || 'and',
        rules: updatedRules,
      };
      (store as any).updateStepConditionalLogic(stepIndex, updatedLogic);
    }
  };

  const updateLogicOperator = (operator: 'and' | 'or') => {
    const updatedLogic: ConditionalLogic = {
      operator,
      rules,
    };
    (store as any).updateStepConditionalLogic(stepIndex, updatedLogic);
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <Label className="text-sm font-medium">Step Conditional Logic</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRule}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add rule
        </Button>
      </div>

      {rules.length > 0 && (
        <>
          {/* Logic Operator */}
          {rules.length > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs">Show this step when:</Label>
              <Select
                value={step.conditionalLogic?.operator || 'and'}
                onValueChange={updateLogicOperator}
              >
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">ALL</SelectItem>
                  <SelectItem value="or">ANY</SelectItem>
                </SelectContent>
              </Select>
              <Label className="text-xs">of these conditions are met:</Label>
            </div>
          )}

          {/* Rules */}
          <div className="space-y-2">
            {rules.map((rule: any, ruleIndex: number) => (
              <div key={ruleIndex} className="flex items-center gap-2 p-2 bg-white rounded border">
                {/* Field Selection */}
                <Select
                  value={rule.field}
                  onValueChange={(value) => updateRule(ruleIndex, { field: value })}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((group) => (
                      <div key={group.group}>
                        <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100">
                          {group.group}
                        </div>
                        {group.fields.map((field) => (
                          <SelectItem key={field.field_name} value={field.field_name}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator Selection */}
                <Select
                  value={rule.operator}
                  onValueChange={(value) => updateRule(ruleIndex, { operator: value })}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">equals</SelectItem>
                    <SelectItem value="not_equals">not equals</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                    <SelectItem value="not_contains">not contains</SelectItem>
                    <SelectItem value="is_empty">is empty</SelectItem>
                    <SelectItem value="is_not_empty">is not empty</SelectItem>
                  </SelectContent>
                </Select>

                {/* Value Input */}
                {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                  <Input
                    value={rule.value}
                    onChange={(e) => updateRule(ruleIndex, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1 h-8 text-xs"
                  />
                )}

                {/* Remove Rule */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(ruleIndex)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <p className="font-medium">Available fields:</p>
            <ul className="mt-1 space-y-1">
              <li>• <strong>Guardian Information:</strong> First name, last name, email, phone, profession, address</li>
              <li>• <strong>Participant Information:</strong> Participants list, school</li>
              {selectedProgram?.category_label && (
                <li>• <strong>{selectedProgram.category_label}:</strong> Selected category value</li>
              )}
              <li>• <strong>Form Fields:</strong> Fields from previous steps only</li>
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              This step will only be shown if the conditions are met
            </p>
          </div>
        </>
      )}

      {rules.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">
          No conditional logic set. This step will always be shown.
        </p>
      )}
    </div>
  );
}
