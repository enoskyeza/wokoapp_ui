/**
 * Rubric Scoring Form Component
 * Interactive form for scoring participants based on rubric criteria
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Info, Save, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useJudging } from '@/context/JudgingContext';
import { toast } from 'sonner';
import type { Rubric, ScoringFormData } from '@/types/judging';

interface RubricScoringFormProps {
  registrationId: number;
  participantName: string;
  onSuccess?: () => void;
}

export default function RubricScoringForm({
  registrationId,
  participantName,
  onSuccess,
}: RubricScoringFormProps) {
  const { activeRubric, submitScores, isSubmittingScores, scoringConfig } = useJudging();
  const [scores, setScores] = useState<{ [criteriaId: string]: string }>({});
  const [notes, setNotes] = useState<{ [criteriaId: string]: string }>({});

  const { register, handleSubmit, formState: { errors } } = useForm<ScoringFormData>();

  // Group criteria by category
  const criteriaByCategory = useMemo(() => {
    if (!activeRubric) return {};

    return activeRubric.criteria.reduce((acc, criteria) => {
      const categoryName = criteria.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(criteria);
      return acc;
    }, {} as { [category: string]: typeof activeRubric.criteria });
  }, [activeRubric]);

  // Calculate total score
  const totalScore = useMemo(() => {
    if (!activeRubric) return 0;

    return activeRubric.criteria.reduce((total, criteria) => {
      const score = parseFloat(scores[criteria.id.toString()] || '0');
      const percentage = (score / parseFloat(criteria.max_score)) * 100;
      const weightedScore = (percentage / 100) * parseFloat(criteria.weight) * parseFloat(activeRubric.total_possible_points);
      return total + weightedScore;
    }, 0);
  }, [scores, activeRubric]);

  const handleScoreChange = (criteriaId: number, value: string) => {
    setScores(prev => ({ ...prev, [criteriaId.toString()]: value }));
  };

  const handleSliderChange = (criteriaId: number, value: number[]) => {
    setScores(prev => ({ ...prev, [criteriaId.toString()]: value[0].toFixed(1) }));
  };

  const onSubmit = async () => {
    if (!activeRubric) {
      toast.error('No active rubric found');
      return;
    }

    // Validate all criteria are scored
    const missingScores = activeRubric.criteria.filter(
      c => !scores[c.id.toString()] || scores[c.id.toString()] === ''
    );

    if (missingScores.length > 0) {
      toast.error(`Please score all criteria. Missing: ${missingScores.length}`);
      return;
    }

    try {
      // Convert scores to numbers for API
      const scoresData = Object.entries(scores).reduce((acc, [id, value]) => {
        acc[parseInt(id)] = value;
        return acc;
      }, {} as { [key: number]: string });

      await submitScores(registrationId, scoresData);
      toast.success('Scores submitted successfully!');
      onSuccess?.();
    } catch (error) {
      // Error already handled in context
      console.error('Failed to submit scores:', error);
    }
  };

  if (!activeRubric) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active rubric found for this program. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const isWithinScoringWindow = scoringConfig?.is_scoring_active ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Score: {participantName}</span>
            <Badge variant="outline" className="text-lg">
              Total: {totalScore.toFixed(2)} / {activeRubric.total_possible_points}
            </Badge>
          </CardTitle>
          <CardDescription>
            {activeRubric.name} • {activeRubric.criteria.length} criteria to evaluate
          </CardDescription>
        </CardHeader>
      </Card>

      {!isWithinScoringWindow && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Scoring window is closed. Scores cannot be submitted at this time.
          </AlertDescription>
        </Alert>
      )}

      {/* Criteria by Category */}
      {Object.entries(criteriaByCategory).map(([categoryName, criteria], catIndex) => (
        <Card key={categoryName}>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {criteria[0].category.icon && <span>{criteria[0].category.icon}</span>}
              {categoryName}
            </CardTitle>
            {criteria[0].category.description && (
              <CardDescription>{criteria[0].category.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {criteria.map((criterion, idx) => {
              const currentScore = scores[criterion.id.toString()] || '0';
              const maxScore = parseFloat(criterion.max_score);

              return (
                <div key={criterion.id} className="space-y-3">
                  {idx > 0 && <Separator />}
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold">
                          {criterion.name}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          Weight: {criterion.weight_percentage}
                        </Badge>
                        {criterion.guidelines && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="text-sm whitespace-pre-wrap">{criterion.guidelines}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {criterion.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {criterion.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">
                        {currentScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        / {criterion.max_score}
                      </div>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <Slider
                      value={[parseFloat(currentScore)]}
                      onValueChange={(value) => handleSliderChange(criterion.id, value)}
                      max={maxScore}
                      step={0.5}
                      className="w-full"
                      disabled={!isWithinScoringWindow}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{(maxScore / 2).toFixed(1)}</span>
                      <span>{maxScore.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Manual Input */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max={maxScore}
                      value={currentScore}
                      onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                      placeholder="Enter score"
                      className="w-32"
                      disabled={!isWithinScoringWindow}
                    />
                    <Input
                      placeholder="Notes (optional)"
                      value={notes[criterion.id.toString()] || ''}
                      onChange={(e) => setNotes(prev => ({
                        ...prev,
                        [criterion.id.toString()]: e.target.value
                      }))}
                      className="flex-1"
                      disabled={!isWithinScoringWindow}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Final Score
              </div>
              <div className="text-3xl font-bold">
                {totalScore.toFixed(2)} / {activeRubric.total_possible_points}
              </div>
              <div className="text-sm text-muted-foreground">
                {((totalScore / parseFloat(activeRubric.total_possible_points)) * 100).toFixed(1)}%
              </div>
            </div>
            <Button
              onClick={onSubmit}
              disabled={isSubmittingScores || !isWithinScoringWindow}
              size="lg"
              className="min-w-[200px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmittingScores ? 'Submitting...' : 'Submit Scores'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
