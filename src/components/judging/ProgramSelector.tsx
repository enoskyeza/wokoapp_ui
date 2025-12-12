/**
 * Program Selector Component
 * Dropdown to select which program to judge
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useJudging } from '@/context/JudgingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Program {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
}

export default function ProgramSelector() {
  const { selectedProgramId, selectProgram, scoringConfig, isLoading, myAssignments } = useJudging();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Load programs from assignments
  useEffect(() => {
    const uniquePrograms = Array.from(
      new Map(
        myAssignments
          .filter(a => a.status === 'ACTIVE')
          .map(a => [a.program, {
            id: a.program,
            name: a.program_name,
            type: 'Program',
            is_active: true,
          }])
      ).values()
    );
    setPrograms(uniquePrograms);
    setLoadingPrograms(false);
  }, [myAssignments]);

  const handleProgramChange = async (programId: string) => {
    await selectProgram(Number(programId));
  };

  const isWithinScoringWindow = scoringConfig?.is_scoring_active || false;

  if (loadingPrograms) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Program</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No active judge assignments found.</p>
            <p className="text-sm mt-2">Contact an administrator to get assigned to programs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Program to Judge</span>
          {scoringConfig && (
            <Badge variant={isWithinScoringWindow ? 'default' : 'secondary'}>
              {isWithinScoringWindow ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Scoring Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Scoring Closed
                </>
              )}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedProgramId?.toString()}
          onValueChange={handleProgramChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a program..." />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProgramId && scoringConfig && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Scoring Window: {new Date(scoringConfig.scoring_start).toLocaleDateString()} - {new Date(scoringConfig.scoring_end).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {isWithinScoringWindow
                  ? `Closes ${new Date(scoringConfig.scoring_end).toLocaleString()}`
                  : 'Scoring window has closed'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
