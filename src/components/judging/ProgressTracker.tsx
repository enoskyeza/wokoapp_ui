/**
 * Progress Tracker Component
 * Shows judge's scoring progress and statistics
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';
import { useJudging } from '@/context/JudgingContext';

export default function ProgressTracker() {
  const { progress, currentAssignment, myScores } = useJudging();

  if (!currentAssignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Select a program to view your progress
          </p>
        </CardContent>
      </Card>
    );
  }

  const completion = progress?.completion_percentage || 0;
  const scored = progress?.scored_count || 0;
  const total = progress?.total_assigned || 0;
  const remaining = progress?.remaining || 0;

  // Calculate scores submitted today
  const today = new Date().toDateString();
  const scoresToday = myScores.filter(s => 
    new Date(s.submitted_at).toDateString() === today
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Progress</span>
          <Badge variant={completion === 100 ? 'default' : 'secondary'}>
            {completion.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Participants Scored</span>
            <span className="font-semibold">
              {scored} / {total}
            </span>
          </div>
          <Progress value={completion} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completed */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Completed</span>
            </div>
            <div className="text-2xl font-bold">{scored}</div>
          </div>

          {/* Remaining */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Remaining</span>
            </div>
            <div className="text-2xl font-bold">{remaining}</div>
          </div>

          {/* Today */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Today</span>
            </div>
            <div className="text-2xl font-bold">{scoresToday}</div>
          </div>

          {/* Assignment */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Target className="w-4 h-4 text-purple-500" />
              <span>Category</span>
            </div>
            <div className="text-sm font-semibold truncate">
              {currentAssignment.category_value || 'All'}
            </div>
          </div>
        </div>

        {/* Program Info */}
        <div className="pt-4 border-t space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Program:</span>
            <span className="ml-2 font-medium">{progress?.program_name}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="ml-2">
              {currentAssignment.status}
            </Badge>
          </div>
        </div>

        {/* Motivational Message */}
        {completion === 100 ? (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              🎉 Assignment Complete!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              You've scored all assigned participants
            </p>
          </div>
        ) : remaining <= 3 && remaining > 0 ? (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Almost there! 🎯
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Just {remaining} more to go
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
