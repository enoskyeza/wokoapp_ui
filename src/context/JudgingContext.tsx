/**
 * Judging Context - Centralized State Management for Judging System
 * Manages program selection, rubrics, assignments, and scoring state
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import type {
  Rubric,
  JudgeAssignment,
  ScoringConfiguration,
  ConflictOfInterest,
  JudgingScore,
  RegistrationToJudge,
  APIError,
  ScoringProgress,
} from '@/types/judging';
import { judgingAPI } from '@/services/judgingService';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface JudgingContextType {
  // Selected Program State
  selectedProgramId: number | null;
  selectProgram: (programId: number) => Promise<void>;
  
  // Rubric State
  activeRubric: Rubric | null;
  isLoadingRubric: boolean;
  
  // Assignment State
  myAssignments: JudgeAssignment[];
  currentAssignment: JudgeAssignment | null;
  isLoadingAssignments: boolean;
  loadMyAssignments: () => Promise<void>;
  
  // Scoring Configuration
  scoringConfig: ScoringConfiguration | null;
  isLoadingConfig: boolean;
  
  // Participants to Judge
  participants: RegistrationToJudge[];
  isLoadingParticipants: boolean;
  loadParticipants: (programId: number, categoryValue?: string) => Promise<void>;
  
  // Conflicts
  myConflicts: ConflictOfInterest[];
  checkConflict: (participantId: number) => boolean;
  loadConflicts: () => Promise<void>;
  
  // Scoring Actions
  submitScores: (registrationId: number, scores: { [criteriaId: number]: string }) => Promise<void>;
  isSubmittingScores: boolean;
  
  // My Scores
  myScores: JudgingScore[];
  loadMyScores: () => Promise<void>;
  
  // Progress
  progress: ScoringProgress | null;
  calculateProgress: () => void;
  
  // Global State
  isLoading: boolean;
  error: APIError | null;
  clearError: () => void;
}

const JudgingContext = createContext<JudgingContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface JudgingProviderProps {
  children: ReactNode;
}

export function JudgingProvider({ children }: JudgingProviderProps) {
  // State
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [activeRubric, setActiveRubric] = useState<Rubric | null>(null);
  const [myAssignments, setMyAssignments] = useState<JudgeAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<JudgeAssignment | null>(null);
  const [scoringConfig, setScoringConfig] = useState<ScoringConfiguration | null>(null);
  const [participants, setParticipants] = useState<RegistrationToJudge[]>([]);
  const [myConflicts, setMyConflicts] = useState<ConflictOfInterest[]>([]);
  const [myScores, setMyScores] = useState<JudgingScore[]>([]);
  const [progress, setProgress] = useState<ScoringProgress | null>(null);
  
  // Loading States
  const [isLoadingRubric, setIsLoadingRubric] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isSubmittingScores, setIsSubmittingScores] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // ============================================================================
  // LOAD MY ASSIGNMENTS
  // ============================================================================
  
  const loadMyAssignments = useCallback(async () => {
    setIsLoadingAssignments(true);
    try {
      const assignments = await judgingAPI.judgeAssignments.getMyAssignments();
      setMyAssignments(assignments);
      
      // Set current assignment if program is selected
      if (selectedProgramId) {
        const assignment = assignments.find(a => a.program === selectedProgramId && a.status === 'ACTIVE');
        setCurrentAssignment(assignment || null);
      }
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [selectedProgramId]);

  // ============================================================================
  // SELECT PROGRAM
  // ============================================================================
  
  const selectProgram = useCallback(async (programId: number) => {
    setIsLoading(true);
    setSelectedProgramId(programId);
    
    try {
      // Load rubric, config, and assignment in parallel
      const [rubric, config, assignments] = await Promise.all([
        judgingAPI.rubrics.getActiveForProgram(programId),
        judgingAPI.scoringConfigs.getByProgram(programId),
        judgingAPI.judgeAssignments.getMyAssignments(),
      ]);
      
      setActiveRubric(rubric);
      setScoringConfig(config);
      
      // Find assignment for this program
      const assignment = assignments.find(a => a.program === programId && a.status === 'ACTIVE');
      setCurrentAssignment(assignment || null);
      setMyAssignments(assignments);
      
      // Load participants if we have an assignment
      if (assignment) {
        await loadParticipants(programId, assignment.category_value);
      }
      
      toast.success('Program loaded successfully');
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError);
      toast.error('Failed to load program data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // LOAD PARTICIPANTS TO JUDGE
  // ============================================================================
  
  const loadParticipants = useCallback(async (programId: number, categoryValue?: string) => {
    setIsLoadingParticipants(true);
    try {
      // In production, this would come from a backend endpoint
      // For now, we'll fetch registrations and my scores to build the list
      const scores = await judgingAPI.judgingScores.getAll({ program: programId });
      
      // Group scores by registration to determine what's been scored
      const scoredRegistrations = new Set(scores.map(s => s.registration));
      
      // Note: You'll need to implement a proper endpoint on the backend
      // that returns registrations filtered by judge assignment
      // For now, this is a placeholder
      setParticipants([]);
      
      toast.info('Participants loaded');
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError);
      toast.error('Failed to load participants');
    } finally {
      setIsLoadingParticipants(false);
    }
  }, []);

  // ============================================================================
  // LOAD CONFLICTS
  // ============================================================================
  
  const loadConflicts = useCallback(async () => {
    try {
      // Get conflicts for current user (judge)
      const conflicts = await judgingAPI.conflicts.getAll({ status: 'REJECTED' });
      setMyConflicts(conflicts);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    }
  }, []);

  // ============================================================================
  // CHECK CONFLICT
  // ============================================================================
  
  const checkConflict = useCallback((participantId: number): boolean => {
    return myConflicts.some(c => c.participant === participantId && c.status === 'REJECTED');
  }, [myConflicts]);

  // ============================================================================
  // SUBMIT SCORES
  // ============================================================================
  
  const submitScores = useCallback(async (
    registrationId: number,
    scores: { [criteriaId: number]: string }
  ) => {
    if (!selectedProgramId) {
      toast.error('No program selected');
      return;
    }
    
    setIsSubmittingScores(true);
    try {
      await judgingAPI.judgingScores.submitScores(registrationId, selectedProgramId, scores);
      
      // Reload my scores and participants
      await Promise.all([
        loadMyScores(),
        loadParticipants(selectedProgramId, currentAssignment?.category_value),
      ]);
      
      calculateProgress();
      toast.success('Scores submitted successfully!');
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError);
      toast.error(apiError.message || 'Failed to submit scores');
      throw err; // Re-throw so component can handle it
    } finally {
      setIsSubmittingScores(false);
    }
  }, [selectedProgramId, currentAssignment]);

  // ============================================================================
  // LOAD MY SCORES
  // ============================================================================
  
  const loadMyScores = useCallback(async () => {
    try {
      const scores = await judgingAPI.judgingScores.getMyScores();
      setMyScores(scores);
    } catch (err) {
      console.error('Failed to load scores:', err);
    }
  }, []);

  // ============================================================================
  // CALCULATE PROGRESS
  // ============================================================================
  
  const calculateProgress = useCallback(() => {
    if (!currentAssignment) {
      setProgress(null);
      return;
    }
    
    const scored = currentAssignment.participants_scored;
    const total = currentAssignment.max_participants || 0;
    const remaining = total - scored;
    const completion = currentAssignment.completion_percentage || 0;
    
    setProgress({
      assignment_id: currentAssignment.id,
      program_name: currentAssignment.program_name,
      category_value: currentAssignment.category_value,
      total_assigned: total,
      scored_count: scored,
      completion_percentage: completion,
      remaining: remaining > 0 ? remaining : 0,
    });
  }, [currentAssignment]);

  // ============================================================================
  // CLEAR ERROR
  // ============================================================================
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load assignments on mount
  useEffect(() => {
    loadMyAssignments();
    loadConflicts();
  }, []);

  // Calculate progress when assignment or scores change
  useEffect(() => {
    calculateProgress();
  }, [currentAssignment, myScores]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: JudgingContextType = {
    selectedProgramId,
    selectProgram,
    activeRubric,
    isLoadingRubric,
    myAssignments,
    currentAssignment,
    isLoadingAssignments,
    loadMyAssignments,
    scoringConfig,
    isLoadingConfig,
    participants,
    isLoadingParticipants,
    loadParticipants,
    myConflicts,
    checkConflict,
    loadConflicts,
    submitScores,
    isSubmittingScores,
    myScores,
    loadMyScores,
    progress,
    calculateProgress,
    isLoading,
    error,
    clearError,
  };

  return (
    <JudgingContext.Provider value={value}>
      {children}
    </JudgingContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useJudging() {
  const context = useContext(JudgingContext);
  if (context === undefined) {
    throw new Error('useJudging must be used within a JudgingProvider');
  }
  return context;
}

export default JudgingContext;
