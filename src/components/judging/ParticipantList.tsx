/**
 * Participant List Component
 * Display list of participants to judge with filters and search
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';
import { useJudging } from '@/context/JudgingContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { RegistrationToJudge } from '@/types/judging';

interface ParticipantListProps {
  programId: number;
}

export default function ParticipantList({ programId }: ParticipantListProps) {
  const router = useRouter();
  const { participants, isLoadingParticipants, checkConflict, myScores } = useJudging();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scored' | 'unscored'>('all');

  // Filter and search participants
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Status filter
    if (statusFilter === 'scored') {
      filtered = filtered.filter(p => p.is_scored);
    } else if (statusFilter === 'unscored') {
      filtered = filtered.filter(p => !p.is_scored);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.participant.first_name.toLowerCase().includes(term) ||
        p.participant.last_name.toLowerCase().includes(term) ||
        p.category_value.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [participants, statusFilter, searchTerm]);

  const handleScoreClick = (participantId: number) => {
    router.push(`/judging/score/${participantId}`);
  };

  // Stats
  const totalCount = participants.length;
  const scoredCount = participants.filter(p => p.is_scored).length;
  const unscoredCount = totalCount - scoredCount;
  const conflictCount = participants.filter(p => p.has_conflict).length;

  if (isLoadingParticipants) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants to Judge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Participants to Judge</span>
          <div className="flex gap-2 text-sm font-normal">
            <Badge variant="outline">
              Total: {totalCount}
            </Badge>
            <Badge variant="default">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {scoredCount}
            </Badge>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {unscoredCount}
            </Badge>
            {conflictCount > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {conflictCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Participants</SelectItem>
              <SelectItem value="unscored">Unscored Only</SelectItem>
              <SelectItem value="scored">Scored Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Participant List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No participants found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            filteredParticipants.map((participant) => {
              const hasConflict = checkConflict(participant.participant.id);
              const isScored = participant.is_scored;
              const myScoreCount = participant.my_scores?.length || 0;

              return (
                <Card key={participant.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg truncate">
                            {participant.participant.first_name} {participant.participant.last_name}
                          </h4>
                          {isScored && (
                            <Badge variant="default" className="shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Scored
                            </Badge>
                          )}
                          {hasConflict && (
                            <Badge variant="destructive" className="shrink-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Conflict
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {participant.category_value}
                            </Badge>
                          </span>
                          <span>Age: {participant.age_at_registration}</span>
                          {myScoreCount > 0 && (
                            <span>• {myScoreCount} criteria scored</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleScoreClick(participant.id)}
                        disabled={hasConflict}
                        size="sm"
                        variant={isScored ? 'outline' : 'default'}
                      >
                        {isScored ? 'View/Edit Scores' : 'Score Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
