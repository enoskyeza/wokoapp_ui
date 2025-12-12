/**
 * TypeScript Types for New Judging System
 * Phase 6: Frontend Implementation
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// RUBRIC TYPES
// ============================================================================

export interface RubricCategory extends BaseModel {
  name: string;
  description: string;
  order: number;
  icon?: string;
}

export interface RubricCriteria extends BaseModel {
  rubric: number;
  category: RubricCategory;
  category_id?: number; // For write operations
  name: string;
  description: string;
  guidelines: string;
  max_score: string; // Decimal as string
  weight: string; // Decimal as string
  weight_percentage: string; // Read-only computed
  order: number;
}

export interface Rubric extends BaseModel {
  program: number;
  program_name: string;
  name: string;
  description: string;
  total_possible_points: string; // Decimal as string
  is_active: boolean;
  criteria_count: number;
  criteria: RubricCriteria[];
  created_by: number | null;
}

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

export type CalculationMethod = 'AVERAGE_ALL' | 'TOP_N' | 'MEDIAN' | 'WEIGHTED';

export interface ScoringConfiguration extends BaseModel {
  program: number;
  program_name: string;
  scoring_start: string; // ISO datetime
  scoring_end: string; // ISO datetime
  min_judges_required: number;
  max_judges_per_participant: number;
  calculation_method: CalculationMethod;
  top_n_count: number | null;
  allow_revisions: boolean;
  revision_deadline: string | null; // ISO datetime
  max_revisions_per_score: number;
  show_scores_to_participants: boolean;
  scores_visible_after: string | null; // ISO datetime
  is_scoring_active: boolean; // Read-only computed
}

// ============================================================================
// JUDGE ASSIGNMENT
// ============================================================================

export type AssignmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface JudgeAssignment extends BaseModel {
  program: number;
  program_name: string;
  judge: number;
  judge_username: string;
  category_value: string;
  assigned_by: number | null;
  assigned_at: string; // ISO datetime
  max_participants: number | null;
  status: AssignmentStatus;
  notes: string;
  participants_scored: number; // Read-only computed
  completion_percentage: number | null; // Read-only computed
}

// ============================================================================
// JUDGING SCORE
// ============================================================================

export interface JudgingScore extends BaseModel {
  program: number;
  registration: number;
  judge: number;
  judge_username: string;
  participant_name: string;
  criteria: number;
  criteria_name: string;
  raw_score: string; // Decimal as string
  max_score: string; // Decimal as string
  score_percentage: string; // Decimal as string - read-only
  weighted_score: string; // Decimal as string - read-only
  notes: string;
  revision_number: number;
  previous_score: number | null;
  revision_reason: string;
  submitted_at: string; // ISO datetime
}

// ============================================================================
// CONFLICT OF INTEREST
// ============================================================================

export type RelationshipType = 'FAMILY' | 'TEACHER' | 'EMPLOYER' | 'SPONSOR' | 'FRIEND' | 'OTHER';
export type ConflictStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ConflictOfInterest extends BaseModel {
  judge: number;
  judge_username: string;
  participant: number;
  participant_name: string;
  relationship_type: RelationshipType;
  relationship_type_display: string;
  description: string;
  flagged_by: number | null;
  flagged_at: string; // ISO datetime
  status: ConflictStatus;
  status_display: string;
  reviewed_by: number | null;
  reviewed_at: string | null; // ISO datetime
  review_notes: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface SubmitScoresRequest {
  registration_id: number;
  scores: {
    [criteria_id: number]: string; // score value as string
  };
}

export interface BulkScoreSubmission {
  program: number;
  registration: number;
  judge: number;
  criteria: number;
  raw_score: string;
  notes?: string;
}

export interface LeaderboardEntry {
  rank: number;
  registration_id: number;
  participant_id: number;
  participant_name: string;
  category_value: string;
  final_score: number;
  judges_count: number;
  scores_count: number;
}

export interface ParticipantScoreDetail {
  registration_id: number;
  participant_name: string;
  category_value: string;
  scores_by_criteria: {
    criteria_name: string;
    category_name: string;
    judges: {
      judge_username: string;
      raw_score: string;
      max_score: string;
      score_percentage: string;
      weighted_score: string;
      submitted_at: string;
    }[];
    average_score: number;
  }[];
  final_score: number;
  judges_count: number;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface JudgingProgram {
  id: number;
  name: string;
  type: string;
  scoring_config: ScoringConfiguration | null;
  active_rubric: Rubric | null;
  my_assignment: JudgeAssignment | null;
}

export interface RegistrationToJudge {
  id: number;
  participant: {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    date_of_birth: string;
  };
  program: number;
  category_value: string;
  age_at_registration: number;
  status: string;
  has_conflict: boolean;
  is_scored: boolean;
  my_scores: JudgingScore[];
}

export interface ScoringProgress {
  assignment_id: number;
  program_name: string;
  category_value: string;
  total_assigned: number;
  scored_count: number;
  completion_percentage: number;
  remaining: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ScoringFormData {
  [criteriaId: string]: string; // criteria_id: score_value
}

export interface RubricFormData {
  program: number;
  name: string;
  description: string;
  total_possible_points: string;
  criteria: {
    category: number;
    name: string;
    description: string;
    guidelines: string;
    max_score: string;
    weight: string;
    order: number;
  }[];
}

export interface AssignmentFormData {
  program: number;
  judge: number;
  category_value: string;
  max_participants: number | null;
  notes: string;
}

export interface ConflictFormData {
  judge: number;
  participant: number;
  relationship_type: RelationshipType;
  description: string;
}

// ============================================================================
// FILTER/SORT TYPES
// ============================================================================

export interface JudgingFilters {
  program?: number;
  category?: string;
  status?: 'scored' | 'unscored' | 'all';
  search?: string;
}

export interface LeaderboardFilters {
  program: number;
  category?: string;
  use_cache?: boolean;
}

export interface AssignmentFilters {
  program?: number;
  judge?: number;
  status?: AssignmentStatus;
  category?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  message: string;
  errors?: {
    [field: string]: string[];
  };
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
