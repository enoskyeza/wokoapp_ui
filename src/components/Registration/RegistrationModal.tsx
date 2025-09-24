'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight,
  FileText,
  X,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  registrationService, 
  type RegistrationFormStructure, 
  type HybridRegistrationPayload,
  type GuardianData,
  type ParticipantData
} from '@/services/registrationService';
import { GuardianStep } from './GuardianStep';
import { ParticipantStep } from './ParticipantStep';
import { DynamicStep } from './DynamicStep';

interface RegistrationModalProps {
  programId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ programId, isOpen, onClose }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formStructure, setFormStructure] = useState<RegistrationFormStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data state
  const [guardianData, setGuardianData] = useState<GuardianData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    profession: '',
    address: '',
  });
  
  const [participantsData, setParticipantsData] = useState<ParticipantData[]>([{
    first_name: '',
    last_name: '',
    email: '',
    gender: 'M',
    age_at_registration: 5,
    school_at_registration: { 
      name: '',
      address: '',
      phone_number: ''
    },
    category_value: '',
  }]);
  
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});

  // Load form structure when modal opens
  useEffect(() => {
    if (isOpen && programId) {
      loadFormStructure();
    }
  }, [isOpen, programId]);

  const loadFormStructure = async () => {
    setLoading(true);
    try {
      const structure = await registrationService.getRegistrationForm(programId);
      setFormStructure(structure);
    } catch (error) {
      console.error('Error loading form structure:', error);
      toast.error('Failed to load registration form');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!formStructure) return;
    
    const totalSteps = formStructure.form_structure.total_steps;
    if (currentStep < totalSteps - 1) {
      // Validate current step before proceeding
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    if (!formStructure) return false;
    
    if (currentStep === 0) {
      // Validate guardian data
      if (!guardianData.first_name.trim() || !guardianData.last_name.trim() || !guardianData.phone_number.trim()) {
        toast.error('Please fill in all required guardian fields');
        return false;
      }
    } else if (currentStep === 1) {
      // Validate participants data
      if (participantsData.length === 0) {
        toast.error('Please add at least one participant');
        return false;
      }
      
      for (const participant of participantsData) {
        if (!participant.first_name.trim() || !participant.last_name.trim()) {
          toast.error('Please fill in all required participant fields');
          return false;
        }
        
        // Validate school - either ID or name must be provided
        const school = participant.school_at_registration;
        if (!school.id && !school.name?.trim()) {
          toast.error('Please select or enter a school for all participants');
          return false;
        }
      }
    }
    // Additional validation for dynamic steps can be added here
    
    return true;
  };

  const handleSubmit = async () => {
    if (!formStructure || !validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const payload: HybridRegistrationPayload = {
        program: programId,
        guardian: guardianData,
        participants: participantsData,
        custom_fields: customFieldsData,
      };

      const result = await registrationService.submitRegistration(payload);
      
      toast.success('Registration submitted successfully!', {
        description: `${result.participants.length} participant(s) registered for ${result.guardian}`
      });
      
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading registration form...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!formStructure) return null;

  const allSteps = [...formStructure.form_structure.static_steps, ...formStructure.form_structure.dynamic_steps];
  const currentStepData = allSteps[currentStep];
  const isStaticStep = currentStep < formStructure.form_structure.static_steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto text-gray-900" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-blue-100 rounded-t-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">Register for Program</span>
              </div>
              <div className="text-right">
                <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{formStructure.program.name}</h2>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                Step {currentStep + 1} of {allSteps.length}
              </Badge>
            </div>
            <Progress value={((currentStep + 1) / allSteps.length) * 100} className="h-2 mb-4" />

            {/* Step Navigation */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {allSteps.map((step, index) => {
                const isStatic = index < formStructure.form_structure.static_steps.length;
                return (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        index < currentStep
                          ? 'bg-green-600 text-white'
                          : index === currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-2">
                      <p className={`text-sm font-medium ${
                        index === currentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                        {isStatic && <span className="ml-1 text-xs text-gray-400">(Required)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                    {index < allSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-300 ml-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {currentStepData.title}
                  {isStaticStep && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Required
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentStepData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Render appropriate step component */}
                {currentStep === 0 && (
                  <GuardianStep
                    data={guardianData}
                    onChange={setGuardianData}
                  />
                )}
                
                {currentStep === 1 && (
                  <ParticipantStep
                    data={participantsData}
                    onChange={setParticipantsData}
                    program={formStructure.program}
                  />
                )}
                
                {currentStep >= 2 && (
                  <DynamicStep
                    step={currentStepData}
                    data={customFieldsData}
                    onChange={setCustomFieldsData}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="text-sm text-gray-600 font-medium">
                {currentStep + 1} of {allSteps.length}
              </div>
              
              {currentStep === allSteps.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
