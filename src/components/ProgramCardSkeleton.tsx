"use client";
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramCardSkeleton() {
  return (
    <Card className="border-blue-100 bg-white/80 animate-pulse">
      <div className="relative w-full h-48">
        <Skeleton className="absolute inset-0 rounded-t-lg" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </CardContent>
    </Card>
  );
}
