export type ConditionOp = 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'not_empty' | '>' | '>=' | '<' | '<=';

export interface ConditionRule {
  field: string; // e.g., 'participant.age' or 'answers.some_field'
  op: ConditionOp;
  value?: string | number | boolean;
}

export interface ConditionGroup {
  mode: 'all' | 'any';
  rules: ConditionRule[];
}

export interface ConditionContext {
  guardian?: Record<string, unknown>;
  participant?: Record<string, unknown>;
  // answers are the dynamic custom field values entered so far
  answers?: Record<string, unknown>;
}

function getPath(ctx: ConditionContext, path: string): unknown {
  if (!path) return undefined;
  const [root, ...rest] = path.split('.');
  // map known roots
  let node: unknown = undefined;
  if (root === 'guardian') node = ctx.guardian;
  else if (root === 'participant') node = ctx.participant;
  else if (root === 'answers') node = ctx.answers;
  else node = (ctx as Record<string, unknown> | undefined)?.[root];

  let current: unknown = node;
  for (const key of rest) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      current = undefined;
      break;
    }
  }

  if (current === undefined && root !== 'guardian' && root !== 'participant' && root !== 'answers') {
    if (ctx.answers && typeof ctx.answers === 'object' && path in ctx.answers) {
      return (ctx.answers as Record<string, unknown>)[path];
    }
  }

  return current;
}

function compare(left: unknown, op: ConditionOp, right?: unknown): boolean {
  switch (op) {
    case 'is_empty':
      return left === undefined || left === null || String(left).trim() === '';
    case 'not_empty':
      return !(left === undefined || left === null || String(left).trim() === '');
    case 'equals':
      return String(left) === String(right);
    case 'not_equals':
      return String(left) !== String(right);
    case 'contains':
      if (Array.isArray(left)) return left.map(String).includes(String(right));
      return String(left).includes(String(right ?? ''));
    case '>':
    case '>=':
    case '<':
    case '<=': {
      const l = typeof left === 'number' ? left : Number(left);
      const r = typeof right === 'number' ? right : Number(right);
      if (Number.isNaN(l) || Number.isNaN(r)) return false;
      if (op === '>') return l > r;
      if (op === '>=') return l >= r;
      if (op === '<') return l < r;
      return l <= r;
    }
    default:
      return false;
  }
}

export function evaluateConditions(group: ConditionGroup | undefined, ctx: ConditionContext): boolean {
  if (!group || !Array.isArray(group.rules) || group.rules.length === 0) return true; // no conditions => visible
  const results = group.rules.map(rule => {
    const left = getPath(ctx, rule.field);
    return compare(left, rule.op, rule.value);
  });
  return group.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
}
