/**
 * Conditional Logic utilities
 * Functions for parsing, cleaning, and working with conditional logic
 */

import type { ConditionalLogic, ConditionalRule, ConditionalOperator } from './types';
import { isConditionalOperator, operatorRequiresValue } from './utils';

/**
 * Convert raw backend conditional logic to typed ConditionalLogic
 */
export function toConditionalLogic(raw: unknown): ConditionalLogic | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  
  const source = raw as Record<string, unknown>;
  const rawRules = Array.isArray(source.rules) ? (source.rules as unknown[]) : [];
  
  if (!rawRules.length) return undefined;

  const rules: ConditionalRule[] = [];
  
  rawRules.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    
    const record = entry as Record<string, unknown>;
    const field = typeof record.field === 'string' ? record.field.trim() : '';
    const operator = record.op;
    
    if (!field || !isConditionalOperator(operator)) return;
    
    const rule: ConditionalRule = {
      field,
      op: operator,
    };
    
    if (operatorRequiresValue(operator)) {
      if (record.value !== undefined && record.value !== null) {
        rule.value = String(record.value);
      } else {
        rule.value = '';
      }
    }
    
    rules.push(rule);
  });

  if (!rules.length) return undefined;

  const mode = source.mode === 'any' ? 'any' : 'all';
  return { mode, rules };
}

/**
 * Clean and validate conditional logic, removing invalid rules
 */
export function cleanConditionalLogic(
  logic?: ConditionalLogic | null
): ConditionalLogic | null {
  if (!logic) return null;
  
  const rules = Array.isArray(logic.rules) ? logic.rules : [];
  if (!rules.length) return null;

  const cleanedRules: ConditionalRule[] = [];
  
  rules.forEach((rule) => {
    if (!rule || typeof rule.field !== 'string' || !rule.field.trim()) return;
    if (!isConditionalOperator(rule.op)) return;

    const base: ConditionalRule = {
      field: rule.field.trim(),
      op: rule.op,
    };

    if (operatorRequiresValue(rule.op)) {
      const value = rule.value ?? '';
      if (value === '') return; // Skip rules with empty required values
      base.value = value;
    }

    cleanedRules.push(base);
  });

  if (!cleanedRules.length) return null;

  return {
    mode: logic.mode === 'any' ? 'any' : 'all',
    rules: cleanedRules,
  };
}

/**
 * Convert ConditionalLogic to backend format
 */
export function conditionalLogicToPayload(
  logic?: ConditionalLogic | null
): Record<string, unknown> | null {
  const cleaned = cleanConditionalLogic(logic);
  if (!cleaned) return null;

  return {
    mode: cleaned.mode,
    rules: cleaned.rules.map((rule) => ({
      field: rule.field,
      op: rule.op,
      ...(rule.value !== undefined && { value: rule.value }),
    })),
  };
}

/**
 * Check if conditional logic has any rules
 */
export function hasConditionalRules(logic?: ConditionalLogic | null): boolean {
  return Boolean(logic && logic.rules && logic.rules.length > 0);
}

/**
 * Create an empty conditional logic object
 */
export function createEmptyConditionalLogic(): ConditionalLogic {
  return {
    mode: 'all',
    rules: [],
  };
}

/**
 * Add a rule to conditional logic
 */
export function addConditionalRule(
  logic: ConditionalLogic | undefined,
  rule: ConditionalRule
): ConditionalLogic {
  const current = logic || createEmptyConditionalLogic();
  return {
    ...current,
    rules: [...current.rules, rule],
  };
}

/**
 * Remove a rule from conditional logic by index
 */
export function removeConditionalRule(
  logic: ConditionalLogic,
  index: number
): ConditionalLogic {
  return {
    ...logic,
    rules: logic.rules.filter((_, i) => i !== index),
  };
}

/**
 * Update a rule in conditional logic
 */
export function updateConditionalRule(
  logic: ConditionalLogic,
  index: number,
  updates: Partial<ConditionalRule>
): ConditionalLogic {
  return {
    ...logic,
    rules: logic.rules.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    ),
  };
}
