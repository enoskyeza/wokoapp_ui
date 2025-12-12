/**
 * API Service Layer for Judging System
 * Handles all HTTP requests to the Django backend
 */

import axios, { AxiosInstance } from 'axios';
import type {
  RubricCategory,
  Rubric,
  RubricCriteria,
  ScoringConfiguration,
  JudgeAssignment,
  JudgingScore,
  ConflictOfInterest,
  LeaderboardEntry,
  SubmitScoresRequest,
  BulkScoreSubmission,
  APIError,
} from '@/types/judging';

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/score`,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookie-based auth
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage or cookie
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError: APIError = {
        message: error.response?.data?.detail || error.response?.data?.message || 'An error occurred',
        errors: error.response?.data?.errors,
        status: error.response?.status,
      };
      return Promise.reject(apiError);
    }
  );

  return client;
};

const apiClient = createAPIClient();

// ============================================================================
// RUBRIC CATEGORY SERVICE
// ============================================================================

export const rubricCategoryService = {
  // Get all categories
  getAll: async (): Promise<RubricCategory[]> => {
    const response = await apiClient.get<RubricCategory[]>('/rubric-categories/');
    return response.data;
  },

  // Get category by ID
  getById: async (id: number): Promise<RubricCategory> => {
    const response = await apiClient.get<RubricCategory>(`/rubric-categories/${id}/`);
    return response.data;
  },

  // Create category
  create: async (data: Partial<RubricCategory>): Promise<RubricCategory> => {
    const response = await apiClient.post<RubricCategory>('/rubric-categories/', data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: Partial<RubricCategory>): Promise<RubricCategory> => {
    const response = await apiClient.patch<RubricCategory>(`/rubric-categories/${id}/`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rubric-categories/${id}/`);
  },
};

// ============================================================================
// RUBRIC SERVICE
// ============================================================================

export const rubricService = {
  // Get all rubrics
  getAll: async (params?: { program?: number; is_active?: boolean }): Promise<Rubric[]> => {
    const response = await apiClient.get<Rubric[]>('/rubrics/', { params });
    return response.data;
  },

  // Get rubric by ID
  getById: async (id: number): Promise<Rubric> => {
    const response = await apiClient.get<Rubric>(`/rubrics/${id}/`);
    return response.data;
  },

  // Get active rubric for program
  getActiveForProgram: async (programId: number): Promise<Rubric | null> => {
    const rubrics = await rubricService.getAll({ program: programId, is_active: true });
    return rubrics.length > 0 ? rubrics[0] : null;
  },

  // Create rubric
  create: async (data: Partial<Rubric>): Promise<Rubric> => {
    const response = await apiClient.post<Rubric>('/rubrics/', data);
    return response.data;
  },

  // Update rubric
  update: async (id: number, data: Partial<Rubric>): Promise<Rubric> => {
    const response = await apiClient.patch<Rubric>(`/rubrics/${id}/`, data);
    return response.data;
  },

  // Delete rubric
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rubrics/${id}/`);
  },

  // Activate rubric
  activate: async (id: number): Promise<Rubric> => {
    const response = await apiClient.post<Rubric>(`/rubrics/${id}/activate/`);
    return response.data;
  },

  // Validate weights
  validateWeights: async (id: number): Promise<{ valid: boolean; total_weight: number; difference: number }> => {
    const response = await apiClient.get(`/rubrics/${id}/validate_weights/`);
    return response.data;
  },
};

// ============================================================================
// RUBRIC CRITERIA SERVICE
// ============================================================================

export const rubricCriteriaService = {
  // Get all criteria
  getAll: async (params?: { rubric?: number; category?: number }): Promise<RubricCriteria[]> => {
    const response = await apiClient.get<RubricCriteria[]>('/rubric-criteria/', { params });
    return response.data;
  },

  // Get criteria by ID
  getById: async (id: number): Promise<RubricCriteria> => {
    const response = await apiClient.get<RubricCriteria>(`/rubric-criteria/${id}/`);
    return response.data;
  },

  // Create criteria
  create: async (data: Partial<RubricCriteria>): Promise<RubricCriteria> => {
    const response = await apiClient.post<RubricCriteria>('/rubric-criteria/', data);
    return response.data;
  },

  // Update criteria
  update: async (id: number, data: Partial<RubricCriteria>): Promise<RubricCriteria> => {
    const response = await apiClient.patch<RubricCriteria>(`/rubric-criteria/${id}/`, data);
    return response.data;
  },

  // Delete criteria
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rubric-criteria/${id}/`);
  },
};

// ============================================================================
// SCORING CONFIGURATION SERVICE
// ============================================================================

export const scoringConfigService = {
  // Get all configs
  getAll: async (params?: { program?: number }): Promise<ScoringConfiguration[]> => {
    const response = await apiClient.get<ScoringConfiguration[]>('/scoring-configs/', { params });
    return response.data;
  },

  // Get config by ID
  getById: async (id: number): Promise<ScoringConfiguration> => {
    const response = await apiClient.get<ScoringConfiguration>(`/scoring-configs/${id}/`);
    return response.data;
  },

  // Get config for program
  getByProgram: async (programId: number): Promise<ScoringConfiguration | null> => {
    const configs = await scoringConfigService.getAll({ program: programId });
    return configs.length > 0 ? configs[0] : null;
  },

  // Create config
  create: async (data: Partial<ScoringConfiguration>): Promise<ScoringConfiguration> => {
    const response = await apiClient.post<ScoringConfiguration>('/scoring-configs/', data);
    return response.data;
  },

  // Update config
  update: async (id: number, data: Partial<ScoringConfiguration>): Promise<ScoringConfiguration> => {
    const response = await apiClient.patch<ScoringConfiguration>(`/scoring-configs/${id}/`, data);
    return response.data;
  },

  // Delete config
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/scoring-configs/${id}/`);
  },

  // Get status
  getStatus: async (id: number): Promise<{
    is_active: boolean;
    current_time: string;
    scoring_start: string;
    scoring_end: string;
    can_revise: boolean;
  }> => {
    const response = await apiClient.get(`/scoring-configs/${id}/status/`);
    return response.data;
  },
};

// ============================================================================
// JUDGE ASSIGNMENT SERVICE
// ============================================================================

export const judgeAssignmentService = {
  // Get all assignments
  getAll: async (params?: {
    program?: number;
    judge?: number;
    status?: string;
    category_value?: string;
  }): Promise<JudgeAssignment[]> => {
    const response = await apiClient.get<JudgeAssignment[]>('/judge-assignments/', { params });
    return response.data;
  },

  // Get assignment by ID
  getById: async (id: number): Promise<JudgeAssignment> => {
    const response = await apiClient.get<JudgeAssignment>(`/judge-assignments/${id}/`);
    return response.data;
  },

  // Get my assignments
  getMyAssignments: async (): Promise<JudgeAssignment[]> => {
    const response = await apiClient.get<JudgeAssignment[]>('/judge-assignments/my_assignments/');
    return response.data;
  },

  // Create assignment
  create: async (data: Partial<JudgeAssignment>): Promise<JudgeAssignment> => {
    const response = await apiClient.post<JudgeAssignment>('/judge-assignments/', data);
    return response.data;
  },

  // Update assignment
  update: async (id: number, data: Partial<JudgeAssignment>): Promise<JudgeAssignment> => {
    const response = await apiClient.patch<JudgeAssignment>(`/judge-assignments/${id}/`, data);
    return response.data;
  },

  // Delete assignment
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/judge-assignments/${id}/`);
  },

  // Pause assignment
  pause: async (id: number): Promise<{ status: string }> => {
    const response = await apiClient.post(`/judge-assignments/${id}/pause/`);
    return response.data;
  },

  // Resume assignment
  resume: async (id: number): Promise<{ status: string }> => {
    const response = await apiClient.post(`/judge-assignments/${id}/resume/`);
    return response.data;
  },

  // Complete assignment
  complete: async (id: number): Promise<{ status: string }> => {
    const response = await apiClient.post(`/judge-assignments/${id}/complete/`);
    return response.data;
  },
};

// ============================================================================
// JUDGING SCORE SERVICE
// ============================================================================

export const judgingScoreService = {
  // Get all scores
  getAll: async (params?: {
    program?: number;
    judge?: number;
    registration?: number;
    criteria?: number;
  }): Promise<JudgingScore[]> => {
    const response = await apiClient.get<JudgingScore[]>('/judging-scores/', { params });
    return response.data;
  },

  // Get score by ID
  getById: async (id: number): Promise<JudgingScore> => {
    const response = await apiClient.get<JudgingScore>(`/judging-scores/${id}/`);
    return response.data;
  },

  // Get my scores
  getMyScores: async (): Promise<JudgingScore[]> => {
    const response = await apiClient.get<JudgingScore[]>('/judging-scores/my_scores/');
    return response.data;
  },

  // Get scores by registration
  getByRegistration: async (registrationId: number): Promise<JudgingScore[]> => {
    const response = await apiClient.get<JudgingScore[]>('/judging-scores/by_registration/', {
      params: { registration_id: registrationId },
    });
    return response.data;
  },

  // Create score
  create: async (data: Partial<JudgingScore>): Promise<JudgingScore> => {
    const response = await apiClient.post<JudgingScore>('/judging-scores/', data);
    return response.data;
  },

  // Submit multiple scores for one registration
  submitScores: async (registrationId: number, programId: number, criteriaScores: { [criteriaId: number]: string }): Promise<JudgingScore[]> => {
    const promises = Object.entries(criteriaScores).map(([criteriaId, score]) =>
      judgingScoreService.create({
        program: programId,
        registration: registrationId,
        criteria: Number(criteriaId),
        raw_score: score,
        max_score: '10.00', // Will be set from criteria
      })
    );
    return Promise.all(promises);
  },

  // Update score
  update: async (id: number, data: Partial<JudgingScore>): Promise<JudgingScore> => {
    const response = await apiClient.patch<JudgingScore>(`/judging-scores/${id}/`, data);
    return response.data;
  },

  // Delete score
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/judging-scores/${id}/`);
  },

  // Revise score
  revise: async (id: number, data: { raw_score: string; revision_reason?: string }): Promise<JudgingScore> => {
    const response = await apiClient.post<JudgingScore>(`/judging-scores/${id}/revise/`, data);
    return response.data;
  },
};

// ============================================================================
// CONFLICT OF INTEREST SERVICE
// ============================================================================

export const conflictService = {
  // Get all conflicts
  getAll: async (params?: {
    judge?: number;
    participant?: number;
    status?: string;
    relationship_type?: string;
  }): Promise<ConflictOfInterest[]> => {
    const response = await apiClient.get<ConflictOfInterest[]>('/conflicts/', { params });
    return response.data;
  },

  // Get conflict by ID
  getById: async (id: number): Promise<ConflictOfInterest> => {
    const response = await apiClient.get<ConflictOfInterest>(`/conflicts/${id}/`);
    return response.data;
  },

  // Get pending conflicts
  getPending: async (): Promise<ConflictOfInterest[]> => {
    const response = await apiClient.get<ConflictOfInterest[]>('/conflicts/pending/');
    return response.data;
  },

  // Create conflict
  create: async (data: Partial<ConflictOfInterest>): Promise<ConflictOfInterest> => {
    const response = await apiClient.post<ConflictOfInterest>('/conflicts/', data);
    return response.data;
  },

  // Update conflict
  update: async (id: number, data: Partial<ConflictOfInterest>): Promise<ConflictOfInterest> => {
    const response = await apiClient.patch<ConflictOfInterest>(`/conflicts/${id}/`, data);
    return response.data;
  },

  // Delete conflict
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/conflicts/${id}/`);
  },

  // Approve conflict
  approve: async (id: number, reviewNotes?: string): Promise<ConflictOfInterest> => {
    const response = await apiClient.post<ConflictOfInterest>(`/conflicts/${id}/approve/`, {
      review_notes: reviewNotes,
    });
    return response.data;
  },

  // Reject conflict
  reject: async (id: number, reviewNotes?: string): Promise<ConflictOfInterest> => {
    const response = await apiClient.post<ConflictOfInterest>(`/conflicts/${id}/reject/`, {
      review_notes: reviewNotes,
    });
    return response.data;
  },
};

// ============================================================================
// RESULTS SERVICE
// ============================================================================

export const resultsService = {
  // Get leaderboard
  getLeaderboard: async (programId: number, category?: string): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardEntry[]>(`/results/${programId}/leaderboard/`, {
      params: { category },
    });
    return response.data;
  },

  // Get participant scores
  getParticipantScores: async (programId: number, registrationId: number) => {
    const response = await apiClient.get(`/results/${programId}/participant/${registrationId}/`);
    return response.data;
  },
};

// Export all services as a single object
export const judgingAPI = {
  rubricCategories: rubricCategoryService,
  rubrics: rubricService,
  rubricCriteria: rubricCriteriaService,
  scoringConfigs: scoringConfigService,
  judgeAssignments: judgeAssignmentService,
  judgingScores: judgingScoreService,
  conflicts: conflictService,
  results: resultsService,
};

export default judgingAPI;
