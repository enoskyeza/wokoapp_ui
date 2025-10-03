'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormBuilderContext } from './FormBuilderProvider';
import { 
  conditionalOperators, 
  getProgramCategoryFields, 
  getParticipantFields, 
  getGuardianFields 
} from './types';
import type { ConditionalLogicEditorProps } from './types';

export function ConditionalLogicEditor({
  field,
  stepIndex,
  fieldIndex,
  availableFields,
  programCategoryFields = [],
  participantFields = [],
}: ConditionalLogicEditorProps) {
  const { store } = useFormBuilderContext();
  const { formData, selectedProgram } = store as any;

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
    
    // Add custom form fields (only fields that come before the current field)
    const customFields = [];
    for (const [sIndex, step] of formData.steps.entries()) {
      for (const [fIndex, stepField] of step.fields.entries()) {
        // Only include fields that come before the current field
        if (sIndex < stepIndex || (sIndex === stepIndex && fIndex < fieldIndex)) {
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

  const fieldGroups = getAllAvailableFields();
  const rules = field.conditional_logic?.rules || [];

  return (
    <div className="space-y-2">
      {/* <Label>Conditional Logic</Label> */}
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Show this field if</span>
        <Select
          value={field.conditional_logic?.mode || 'all'}
          onValueChange={(value) =>
            store.updateConditionalMode(stepIndex, fieldIndex, value as 'all' | 'any')
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-left">
              ALL
            </SelectItem>
            <SelectItem value="any" className="text-left">
              ANY
            </SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">of the following conditions match:</span>
      </div>
      
      <div className="space-y-2">
        {rules.map((rule, ruleIndex) => (
          <div key={ruleIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            {/* Field Selection */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Field</Label>
              <Select
                value={rule.field}
                onValueChange={(value) => {
                  store.updateConditionalRule(stepIndex, fieldIndex, ruleIndex, { 
                    field: value 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldGroups.map((group) => (
                    <div key={group.group}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                        {group.group}
                      </div>
                      {group.fields.map((groupField) => (
                        <SelectItem
                          key={groupField.id}
                          value={groupField.field_name || groupField.id}
                          className="text-left pl-4"
                        >
                          {groupField.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Operator</Label>
              <Select
                value={rule.op}
                onValueChange={(value) => {
                  store.updateConditionalRule(stepIndex, fieldIndex, ruleIndex, { 
                    op: value as any 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditionalOperators.map((operator) => (
                    <SelectItem key={operator.value} value={operator.value} className="text-left">
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Value</Label>
              <Input
                value={rule.value || ''}
                onChange={(event) => {
                  store.updateConditionalRule(stepIndex, fieldIndex, ruleIndex, { 
                    value: event.target.value 
                  });
                }}
                placeholder="Value"
                disabled={rule.op === 'is_empty' || rule.op === 'not_empty'}
              />
            </div>

            {/* Delete Rule Button */}
            <div className="space-y-1">
              <Label className="text-xs text-transparent">Action</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => store.removeConditionalRule(stepIndex, fieldIndex, ruleIndex)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete rule"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Add Rule Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => store.addConditionalRule(stepIndex, fieldIndex)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add rule
        </Button>
      </div>

      {/* Help Text */}
      {/* {rules.length > 0 && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <p className="font-medium">Available fields:</p>
          <ul className="mt-1 space-y-1">
            <li>• <strong>Guardian Information:</strong> First name, last name, email, phone, profession, address</li>
            <li>• <strong>Participant Information:</strong> Participants list, school</li>
            {selectedProgram?.category_label && (
              <li>• <strong>{selectedProgram.category_label}:</strong> Selected category value</li>
            )}
            <li>• <strong>Form Fields:</strong> Fields from previous steps</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">
            Fields are based on actual backend data structure
          </p>
        </div>
      )} */}
    </div>
  );
}
