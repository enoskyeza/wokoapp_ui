'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GuardianData } from '@/services/registrationService';

interface GuardianStepProps {
  data: GuardianData;
  onChange: (data: GuardianData) => void;
}

export function GuardianStep({ data, onChange }: GuardianStepProps) {
  const updateField = (field: keyof GuardianData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
      <div className="space-y-2">
        <Label htmlFor="guardian-first-name" className="block text-left text-black font-medium">
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="guardian-first-name"
          value={data.first_name}
          onChange={(e) => updateField('first_name', e.target.value)}
          placeholder="Enter first name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian-last-name" className="block text-left text-black font-medium">
          Last Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="guardian-last-name"
          value={data.last_name}
          onChange={(e) => updateField('last_name', e.target.value)}
          placeholder="Enter last name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian-email" className="block text-left text-black font-medium">Email Address</Label>
        <Input
          id="guardian-email"
          type="email"
          value={data.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian-phone" className="block text-left text-black font-medium">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="guardian-phone"
          type="tel"
          value={data.phone_number}
          onChange={(e) => updateField('phone_number', e.target.value)}
          placeholder="Enter phone number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian-profession" className="block text-left text-black font-medium">Profession</Label>
        <Input
          id="guardian-profession"
          value={data.profession || ''}
          onChange={(e) => updateField('profession', e.target.value)}
          placeholder="Enter profession"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="guardian-address" className="block text-left text-black font-medium">Address</Label>
        <Textarea
          id="guardian-address"
          value={data.address || ''}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Enter address"
          rows={3}
        />
      </div>
    </div>
  );
}
