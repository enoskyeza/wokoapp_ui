/**
 * Scores History Component
 * Display judge's submission history with details
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Search, 
  Calendar, 
  User, 
  Award, 
  Edit, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { useJudging } from '@/context/JudgingContext';
import { format } from 'date-fns';
import type { JudgingScore } from '@/types/judging';

export default function ScoresHistory() {
  const { myScores, scoringConfig } = useJudging();
  const [searchTerm, setSearchTerm] = useState('');

  // Group scores by registration
  const scoresByRegistration = useMemo(() => {
    const grouped: {
      [registrationId: number]: {
        participant_name: string;
        registration_id: number;
        scores: JudgingScore[];
        total_criteria: number;
        submitted_at: string;
      };
    } = {};

    myScores.forEach(score => {
      if (!grouped[score.registration]) {
        grouped[score.registration] = {
          participant_name: score.participant_name,
          registration_id: score.registration,
          scores: [],
          total_criteria: 0,
          submitted_at: score.submitted_at,
        };
      }
      grouped[score.registration].scores.push(score);
      grouped[score.registration].total_criteria = grouped[score.registration].scores.length;
      
      // Keep the latest submission time
      if (score.submitted_at > grouped[score.registration].submitted_at) {
        grouped[score.registration].submitted_at = score.submitted_at;
      }
    });

    return Object.values(grouped).sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  }, [myScores]);

  // Filter by search
  const filteredScores = useMemo(() => {
    if (!searchTerm) return scoresByRegistration;
    
    const term = searchTerm.toLowerCase();
    return scoresByRegistration.filter(entry =>
      entry.participant_name.toLowerCase().includes(term)
    );
  }, [scoresByRegistration, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalParticipants = scoresByRegistration.length;
    const totalScores = myScores.length;
    const avgScoresPerParticipant = totalParticipants > 0 
      ? (totalScores / totalParticipants).toFixed(1) 
      : '0';
    
    // Calculate average score percentage
    const avgPercentage = myScores.length > 0
      ? (myScores.reduce((sum, s) => sum + parseFloat(s.score_percentage), 0) / myScores.length).toFixed(1)
      : '0';

    return {
      totalParticipants,
      totalScores,
      avgScoresPerParticipant,
      avgPercentage,
    };
  }, [scoresByRegistration, myScores]);

  const canRevise = scoringConfig?.allow_revisions ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scoring History</span>
          <Badge variant="outline">
            {stats.totalParticipants} Participants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalScores}</div>
            <div className="text-xs text-muted-foreground">Total Scores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgScoresPerParticipant}</div>
            <div className="text-xs text-muted-foreground">Avg per Person</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by participant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Scores List */}
        {filteredScores.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No scores submitted yet</p>
            {searchTerm && (
              <p className="text-sm mt-2">No matches found for "{searchTerm}"</p>
            )}
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredScores.map((entry) => {
              const avgScore = entry.scores.reduce(
                (sum, s) => sum + parseFloat(s.score_percentage), 
                0
              ) / entry.scores.length;

              return (
                <AccordionItem 
                  key={entry.registration_id} 
                  value={`registration-${entry.registration_id}`}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-semibold">{entry.participant_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(entry.submitted_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {entry.total_criteria} criteria
                        </Badge>
                        <Badge variant="secondary">
                          {avgScore.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      {entry.scores.map((score) => (
                        <div 
                          key={score.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{score.criteria_name}</div>
                            {score.notes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Note: {score.notes}
                              </div>
                            )}
                            {score.revision_number > 1 && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Revision {score.revision_number}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold">
                              {score.raw_score} / {score.max_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {parseFloat(score.score_percentage).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {canRevise && (
                      <div className="mt-4 flex justify-end">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-2" />
                          Revise Scores
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
