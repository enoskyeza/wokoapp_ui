import React from 'react';
import { Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProgramOption {
  id: string;
  title: string;
}

interface FormBasicInfo {
  name: string;
  description: string;
  programId: string;
}

interface FormSettingsProps {
  basicInfo: FormBasicInfo;
  layoutColumns: number;
  programs: ProgramOption[];
  onUpdateBasic: (field: keyof FormBasicInfo, value: string) => void;
  onUpdateLayoutColumns: (columns: number) => void;
}

/**
 * FormSettings: Sidebar component for form metadata configuration
 * Handles form name, description, program association, and layout settings
 */
export function FormSettings({
  basicInfo,
  layoutColumns,
  programs,
  onUpdateBasic,
  onUpdateLayoutColumns,
}: FormSettingsProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Form Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Name */}
        <div className="space-y-2">
          <Label>Form Name</Label>
          <Input
            value={basicInfo.name}
            onChange={(e) => onUpdateBasic('name', e.target.value)}
            placeholder="Registration Form"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={basicInfo.description}
            onChange={(e) => onUpdateBasic('description', e.target.value)}
            placeholder="Form description"
            rows={3}
          />
        </div>

        {/* Associated Program */}
        <div className="space-y-2">
          <Label>Associated Program</Label>
          <Select
            value={basicInfo.programId || ''}
            onValueChange={(value) => onUpdateBasic('programId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Column Layout */}
        <div className="space-y-2">
          <Label>Default Column Layout</Label>
          <Select
            value={String(layoutColumns)}
            onValueChange={(value) => onUpdateLayoutColumns(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} column{option > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Used as the default span for new steps and fields (max 4 columns).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
