'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { ParticipantData } from '@/services/registrationService';
import { SchoolSearch } from './SchoolSearch';

interface ParticipantStepProps {
  data: ParticipantData[];
  onChange: (data: ParticipantData[]) => void;
  program: {
    id: number;
    name: string;
    age_min?: number;
    age_max?: number;
    category_label?: string;
    category_options?: string[];
  };
}

export function ParticipantStep({ data, onChange, program }: ParticipantStepProps) {
  const addParticipant = () => {
    const newParticipant: ParticipantData = {
      first_name: '',
      last_name: '',
      email: '',
      gender: 'M',
      age_at_registration: program.age_min || 5,
      school_at_registration: { 
        name: '',
        address: '',
        phone_number: ''
      },
      category_value: '',
    };
    onChange([...data, newParticipant]);
  };

  const removeParticipant = (index: number) => {
    if (data.length <= 1) {
      toast.error('At least one participant is required');
      return;
    }
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const updateParticipant = (index: number, field: keyof ParticipantData, value: any) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    onChange(newData);
  };

  const validateAge = (age: number): boolean => {
    if (program.age_min && age < program.age_min) {
      toast.error(`Minimum age for this program is ${program.age_min}`);
      return false;
    }
    if (program.age_max && age > program.age_max) {
      toast.error(`Maximum age for this program is ${program.age_max}`);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants
          </h3>
          <p className="text-sm text-gray-600">
            Add details for each participant you want to register
            {program.age_min && program.age_max && (
              <span className="ml-2 text-blue-600">
                (Ages {program.age_min}-{program.age_max})
              </span>
            )}
          </p>
        </div>
        <Button onClick={addParticipant} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Participant
        </Button>
      </div>

      {data.map((participant, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Participant {index + 1}</span>
              {data.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeParticipant(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={participant.first_name}
                  onChange={(e) => updateParticipant(index, 'first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={participant.last_name}
                  onChange={(e) => updateParticipant(index, 'last_name', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">Email Address</Label>
                <Input
                  type="email"
                  value={participant.email || ''}
                  onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={participant.gender}
                  onValueChange={(value) => updateParticipant(index, 'gender', value as 'M' | 'F')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="block text-left text-black font-medium">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={participant.age_at_registration}
                  onChange={(e) => {
                    const age = parseInt(e.target.value);
                    if (validateAge(age)) {
                      updateParticipant(index, 'age_at_registration', age);
                    }
                  }}
                  min={program.age_min || 1}
                  max={program.age_max || 100}
                  placeholder="Enter age"
                  required
                />
              </div>

              {program.category_label && program.category_options && program.category_options.length > 0 && (
                <div className="space-y-2">
                  <Label className="block text-left text-black font-medium">{program.category_label}</Label>
                  <Select
                    value={participant.category_value || ''}
                    onValueChange={(value) => updateParticipant(index, 'category_value', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${program.category_label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {program.category_options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* School Search Component */}
            <div className="space-y-2">
              <Label className="block text-left text-black font-medium">
                School <span className="text-red-500">*</span>
              </Label>
              <SchoolSearch
                value={participant.school_at_registration}
                onChange={(school) => updateParticipant(index, 'school_at_registration', school)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
