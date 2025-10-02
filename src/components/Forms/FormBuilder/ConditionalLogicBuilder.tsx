/**
 * ConditionalLogicBuilder - Intuitive Rule Builder UI
 * Visual metaphor: Sentence construction for conditional logic
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Zap } from 'lucide-react';
import type { ConditionalLogic, ConditionalOperator, FormField } from './types';

interface ConditionalLogicBuilderProps {
  conditionalLogic?: ConditionalLogic;
  allFields: FormField[];
  onUpdate: (logic: ConditionalLogic | undefined) => void;
}

const OPERATORS: { value: ConditionalOperator; label: string; requiresValue: boolean }[] = [
  { value: 'equals', label: 'equals', requiresValue: true },
  { value: 'not_equals', label: 'does not equal', requiresValue: true },
  { value: 'contains', label: 'contains', requiresValue: true },
  { value: 'is_empty', label: 'is empty', requiresValue: false },
  { value: 'not_empty', label: 'is not empty', requiresValue: false },
  { value: '>', label: 'is greater than', requiresValue: true },
  { value: '>=', label: 'is greater than or equal to', requiresValue: true },
  { value: '<', label: 'is less than', requiresValue: true },
  { value: '<=', label: 'is less than or equal to', requiresValue: true },
];

/**
 * Revolutionary Conditional Logic Builder with sentence-like UI
 */
export function ConditionalLogicBuilder({
  conditionalLogic,
  allFields,
  onUpdate
}: ConditionalLogicBuilderProps) {
  const addRule = () => {
    const newRule = {
      field: '',
      op: 'equals' as ConditionalOperator,
      value: ''
    };

    onUpdate({
      mode: conditionalLogic?.mode || 'all',
      rules: [...(conditionalLogic?.rules || []), newRule]
    });
  };

  const updateRule = (index: number, updates: any) => {
    const rules = [...(conditionalLogic?.rules || [])];
    rules[index] = { ...rules[index], ...updates };

    onUpdate({
      mode: conditionalLogic?.mode || 'all',
      rules
    });
  };

  const removeRule = (index: number) => {
    const rules = (conditionalLogic?.rules || []).filter((_, i) => i !== index);
    onUpdate(rules.length > 0 ? {
      mode: conditionalLogic?.mode || 'all',
      rules
    } : undefined);
  };

  const updateMode = (mode: 'all' | 'any') => {
    if (!conditionalLogic) return;
    onUpdate({ ...conditionalLogic, mode });
  };

  // Get available fields (fields that come before current field in form)
  const availableFields = allFields.filter(field => field.id !== 'current-field-id');

  const currentRules = conditionalLogic?.rules || [];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Conditional Logic
          </CardTitle>
          <Badge variant="outline">
            {currentRules.length} rule{currentRules.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentRules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">Show this field only when specific conditions are met.</p>
            <Button onClick={addRule} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Condition
            </Button>
          </div>
        ) : (
          <>
            {/* Mode Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logic Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={conditionalLogic?.mode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateMode('all')}
                  className="flex-1"
                >
                  All conditions must be met
                </Button>
                <Button
                  variant={conditionalLogic?.mode === 'any' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateMode('any')}
                  className="flex-1"
                >
                  Any condition can be met
                </Button>
              </div>
            </div>

            <Separator />

            {/* Rules List */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Conditions</Label>

              {currentRules.map((rule, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Condition {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Field Selection */}
                    <div>
                      <Label className="text-xs text-gray-600">Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateRule(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator Selection */}
                    <div>
                      <Label className="text-xs text-gray-600">Condition</Label>
                      <Select
                        value={rule.op}
                        onValueChange={(value: ConditionalOperator) => updateRule(index, { op: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input (if required) */}
                    {OPERATORS.find(op => op.value === rule.op)?.requiresValue && (
                      <div>
                        <Label className="text-xs text-gray-600">Value</Label>
                        <Input
                          value={rule.value || ''}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder="Enter value..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Rule Button */}
              <Button
                variant="outline"
                onClick={addRule}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Condition
              </Button>
            </div>

            {/* Visual Summary */}
            {currentRules.length > 0 && (
              <>
                <Separator />
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900 mb-2 block">
                    Summary
                  </Label>
                  <p className="text-sm text-blue-800">
                    Show this field when{' '}
                    <span className="font-medium">
                      {conditionalLogic?.mode === 'all' ? 'ALL' : 'ANY'}
                    </span>{' '}
                    of these conditions are met:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {currentRules.map((rule, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span>
                          "{availableFields.find(f => f.id === rule.field)?.label || rule.field}"{' '}
                          {OPERATORS.find(op => op.value === rule.op)?.label}{' '}
                          {OPERATORS.find(op => op.value === rule.op)?.requiresValue && rule.value
                            ? `"${rule.value}"`
                            : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
