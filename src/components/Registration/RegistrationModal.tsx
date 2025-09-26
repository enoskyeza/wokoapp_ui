'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FileText, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  registrationService,
  type RegistrationFormStructure,
  type HybridRegistrationPayload,
  type GuardianData,
  type ParticipantData,
  type CustomFieldPayload,
} from '@/services/registrationService';
import { GuardianStep } from './GuardianStep';
import { ParticipantStep } from './ParticipantStep';
import { DynamicStep, type DynamicStepProps } from './DynamicStep';
import { evaluateConditions, type ConditionGroup, type ConditionContext } from './conditionUtils';

interface RegistrationModalProps {
  programId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomFieldState {
  global: Record<string, unknown>;
  perParticipant: Array<Record<string, unknown>>;
}

const emptyCustomFieldState: CustomFieldState = {
  global: {},
  perParticipant: [],
};

const isValueEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export function RegistrationModal({ programId, isOpen, onClose }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formStructure, setFormStructure] = useState<RegistrationFormStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      phone_number: '',
    },
    category_value: '',
  }]);

  const [customFieldsState, setCustomFieldsState] = useState<CustomFieldState>(emptyCustomFieldState);

  const allSteps = useMemo(() => {
    if (!formStructure) return [] as RegistrationFormStructure['form_structure']['static_steps'];
    return [
      ...formStructure.form_structure.static_steps,
      ...formStructure.form_structure.dynamic_steps,
    ];
  }, [formStructure]);

  const ensureParticipantFieldState = (length: number) => {
    setCustomFieldsState((prev) => {
      const next = prev.perParticipant.slice();
      if (length > next.length) {
        while (next.length < length) {
          next.push({});
        }
      } else if (length < next.length) {
        next.length = length;
      }
      if (next === prev.perParticipant) {
        return prev;
      }
      return {
        ...prev,
        perParticipant: next,
      };
    });
  };

  useEffect(() => {
    ensureParticipantFieldState(participantsData.length);
  }, [participantsData.length]);

  const loadFormStructure = useCallback(async () => {
    setLoading(true);
    try {
      const structure = await registrationService.getRegistrationForm(programId);
      setFormStructure(structure);
      setCurrentStep(0);
      setCustomFieldsState(emptyCustomFieldState);
    } catch (error) {
      console.error('Error loading form structure:', error);
      toast.error('Failed to load registration form');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [programId, onClose]);

  useEffect(() => {
    if (isOpen && programId) {
      void loadFormStructure();
    }
  }, [isOpen, programId, loadFormStructure]);

  const buildContext = useCallback((participantIndex?: number): ConditionContext => {
    const answers: Record<string, unknown> = {
      ...customFieldsState.global,
    };
    if (typeof participantIndex === 'number' && customFieldsState.perParticipant[participantIndex]) {
      Object.assign(answers, customFieldsState.perParticipant[participantIndex]);
    }

    const participant = typeof participantIndex === 'number'
      ? (participantsData[participantIndex] || {})
      : undefined;

    return {
      guardian: guardianData as unknown as Record<string, unknown>,
      participant: participant as unknown as Record<string, unknown> | undefined,
      answers,
    };
  }, [customFieldsState, guardianData, participantsData]);

  const stepIsVisible = useCallback((stepIndex: number): boolean => {
    if (!formStructure) return true;
    const step = allSteps[stepIndex];
    if (!step) return false;

    const stepCond = (step as unknown as { conditional_logic?: ConditionGroup }).conditional_logic;
    const perParticipant = (step as { per_participant?: boolean }).per_participant ?? false;

    if (perParticipant) {
      return participantsData.some((_, idx) => {
        const ctx = buildContext(idx);
        if (!evaluateConditions(stepCond, ctx)) return false;
        return step.fields.some((field) => {
          const group = field.conditional_logic as ConditionGroup | undefined;
          return evaluateConditions(group, ctx);
        });
      });
    }

    const ctx = buildContext();
    if (!evaluateConditions(stepCond, ctx)) return false;
    if (step.fields.length === 0) return true;
    return step.fields.some((field) => {
      const group = field.conditional_logic as ConditionGroup | undefined;
      return evaluateConditions(group, ctx);
    });
  }, [allSteps, buildContext, formStructure, participantsData]);

  const findNextVisibleStep = useCallback((fromIndex: number): number => {
    const total = allSteps.length;
    let idx = fromIndex + 1;
    while (idx < total) {
      if (stepIsVisible(idx)) return idx;
      idx += 1;
    }
    return fromIndex;
  }, [allSteps.length, stepIsVisible]);

  const findPrevVisibleStep = useCallback((fromIndex: number): number => {
    let idx = fromIndex - 1;
    while (idx >= 0) {
      if (stepIsVisible(idx)) return idx;
      idx -= 1;
    }
    return fromIndex;
  }, [stepIsVisible]);

  useEffect(() => {
    if (!formStructure) return;
    if (!stepIsVisible(currentStep)) {
      const nextIdx = findNextVisibleStep(currentStep);
      if (nextIdx !== currentStep) {
        setCurrentStep(nextIdx);
        return;
      }
      const prevIdx = findPrevVisibleStep(currentStep);
      if (prevIdx !== currentStep) {
        setCurrentStep(prevIdx);
      }
    }
  }, [formStructure, currentStep, guardianData, participantsData, customFieldsState, stepIsVisible, findNextVisibleStep, findPrevVisibleStep]);

  const validateCurrentStep = (): boolean => {
    if (!formStructure) return false;

    if (currentStep === 0) {
      if (!guardianData.first_name.trim() || !guardianData.last_name.trim() || !guardianData.phone_number.trim()) {
        toast.error('Please fill in all required guardian fields');
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      if (participantsData.length === 0) {
        toast.error('Please add at least one participant');
        return false;
      }
      for (const participant of participantsData) {
        if (!participant.first_name.trim() || !participant.last_name.trim()) {
          toast.error('Please fill in all required participant fields');
          return false;
        }
        const school = participant.school_at_registration;
        if (!school.id && !school.name?.trim()) {
          toast.error('Please select or enter a school for all participants');
          return false;
        }
      }
      return true;
    }

    const step = allSteps[currentStep];
    if (!step) return false;
    const perParticipant = (step as { per_participant?: boolean }).per_participant ?? false;

    if (perParticipant) {
      return participantsData.every((_, idx) => {
        const context = buildContext(idx);
        return step.fields.every((field) => {
          if (!field.required) return true;
          const group = field.conditional_logic as ConditionGroup | undefined;
          if (!evaluateConditions(group, context)) return true;
          const value = customFieldsState.perParticipant[idx]?.[field.name];
          if (isValueEmpty(value)) {
            toast.error(`Please fill in required field for participant ${idx + 1}: ${field.label}`);
            return false;
          }
          return true;
        });
      });
    }

    const context = buildContext();
    return step.fields.every((field) => {
      if (!field.required) return true;
      const group = field.conditional_logic as ConditionGroup | undefined;
      if (!evaluateConditions(group, context)) return true;
      const value = customFieldsState.global[field.name];
      if (isValueEmpty(value)) {
        toast.error(`Please fill in required field: ${field.label}`);
        return false;
      }
      return true;
    });
  };

  const handleNext = () => {
    if (!formStructure) return;
    if (!validateCurrentStep()) return;
    const nextIdx = findNextVisibleStep(currentStep);
    setCurrentStep(Math.min(nextIdx, allSteps.length - 1));
  };

  const handlePrevious = () => {
    const prevIdx = findPrevVisibleStep(currentStep);
    setCurrentStep(Math.max(prevIdx, 0));
  };

  const computeVisibleFields = () => {
    const visibleGlobal = new Set<string>();
    const visiblePerParticipant = new Map<number, Set<string>>();

    if (!formStructure) {
      return { visibleGlobal, visiblePerParticipant };
    }

    formStructure.form_structure.dynamic_steps.forEach((step) => {
      const perParticipant = (step as { per_participant?: boolean }).per_participant ?? false;
      const stepCond = (step as unknown as { conditional_logic?: ConditionGroup }).conditional_logic;

      if (perParticipant) {
        participantsData.forEach((_, idx) => {
          const ctx = buildContext(idx);
          if (!evaluateConditions(stepCond, ctx)) return;
          step.fields.forEach((field) => {
            const group = field.conditional_logic as ConditionGroup | undefined;
            if (!evaluateConditions(group, ctx)) return;
            if (!visiblePerParticipant.has(idx)) {
              visiblePerParticipant.set(idx, new Set<string>());
            }
            visiblePerParticipant.get(idx)!.add(field.name);
          });
        });
      } else {
        const ctx = buildContext();
        if (!evaluateConditions(stepCond, ctx)) return;
        step.fields.forEach((field) => {
          const group = field.conditional_logic as ConditionGroup | undefined;
          if (!evaluateConditions(group, ctx)) return;
          visibleGlobal.add(field.name);
        });
      }
    });

    return { visibleGlobal, visiblePerParticipant };
  };

  const buildCustomFieldPayload = (): CustomFieldPayload | undefined => {
    const { visibleGlobal, visiblePerParticipant } = computeVisibleFields();

    const globalEntries = Object.entries(customFieldsState.global).filter(
      ([fieldName, value]) => visibleGlobal.has(fieldName) && !isValueEmpty(value),
    );

    const globalPayload = globalEntries.length > 0
      ? Object.fromEntries(globalEntries)
      : undefined;

    const perParticipantPayload = participantsData
      .map((_, idx) => {
        const visible = visiblePerParticipant.get(idx);
        if (!visible || visible.size === 0) {
          return undefined;
        }
        const values = customFieldsState.perParticipant[idx] || {};
        const filtered = Object.entries(values)
          .filter(([fieldName, value]) => visible.has(fieldName) && !isValueEmpty(value))
          .reduce<Record<string, unknown>>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
        if (Object.keys(filtered).length === 0) {
          return undefined;
        }
        return {
          participant_index: idx,
          values: filtered,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (!globalPayload && perParticipantPayload.length === 0) {
      return undefined;
    }

    return {
      ...(globalPayload ? { global: globalPayload } : {}),
      ...(perParticipantPayload.length > 0 ? { per_participant: perParticipantPayload } : {}),
    };
  };

  const handleSubmit = async () => {
    if (!formStructure) return;
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const customFieldPayload = buildCustomFieldPayload();

      const payload: HybridRegistrationPayload = {
        program: programId,
        guardian: guardianData,
        participants: participantsData,
        ...(customFieldPayload ? { custom_fields: customFieldPayload } : {}),
      };

      const result = await registrationService.submitRegistration(payload);
      toast.success('Registration submitted successfully!', {
        description: `${result.participants.length} participant(s) registered for ${result.guardian}`,
      });
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again',
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

  const currentStepData = allSteps[currentStep];
  const isStaticStep = currentStep < formStructure.form_structure.static_steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{formStructure.program.name}</h2>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                Step {currentStep + 1} of {allSteps.length}
              </Badge>
            </div>
            <Progress value={((currentStep + 1) / allSteps.length) * 100} className="h-2 mb-4" />

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
                      <p
                        className={`text-sm font-medium ${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}
                      >
                        {step.title}
                        {isStatic && <span className="ml-1 text-xs text-gray-400">(Required)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                    {index < allSteps.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300 ml-4" />}
                  </div>
                );
              })}
            </div>
          </div>

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
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    step={currentStepData as unknown as DynamicStepProps['step']}
                    globalValues={customFieldsState.global}
                    participantValues={customFieldsState.perParticipant}
                    onGlobalChange={(next) => setCustomFieldsState((prev) => ({
                      ...prev,
                      global: next,
                    }))}
                    onParticipantChange={(index, next) => setCustomFieldsState((prev) => {
                      const updated = prev.perParticipant.slice();
                      updated[index] = next;
                      return {
                        ...prev,
                        perParticipant: updated,
                      };
                    })}
                    baseContext={{
                      guardian: guardianData as unknown as Record<string, unknown>,
                    }}
                    participants={participantsData}
                  />
                )}
              </CardContent>
            </Card>

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
