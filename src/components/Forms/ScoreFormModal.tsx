import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { API_URL } from '@/config';

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    registrationId: number;
    participantName: string;
    categoryValue?: string;
    onScoreSubmitted?: () => void;
};

type RubricCriteria = {
    id: number;
    name: string;
    description: string;
    max_score: string;
    weight: string;
    order: number;
    category: {
        id: number;
        name: string;
    };
};

type Rubric = {
    id: number;
    program: number;
    program_name: string;
    category_value: string | null;
    name: string;
    description: string;
    total_possible_points: string;
    criteria: RubricCriteria[];
};

function ScoreFormModal({ isOpen, setIsOpen, registrationId, participantName, categoryValue, onScoreSubmitted }: InterfaceProps) {
    const [judge, setJudge] = useState<number | null>(null);
    const [rubric, setRubric] = useState<Rubric | null>(null);
    const [scores, setScores] = useState<Record<number, string>>({});
    const [processing, setProcessing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userData = Cookies.get('userData');
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                setJudge(parsedData.id);
            } catch (error) {
                console.error('Error parsing userData cookie: ', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchRubricForRegistration = async () => {
            if (!registrationId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const token = Cookies.get('authToken');
                const response = await fetch(
                    `${API_URL}score/rubrics/for-registration/${registrationId}/`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                
                if (response.ok) {
                    const data: Rubric = await response.json();
                    setRubric(data);
                    
                    // Initialize scores with empty values for each criteria
                    const initialScores: Record<number, string> = {};
                    data.criteria.forEach(c => {
                        initialScores[c.id] = '';
                    });
                    setScores(initialScores);
                } else if (response.status === 404) {
                    const errorData = await response.json();
                    setError(errorData.error || 'No rubric found for this registration');
                } else {
                    setError('Failed to fetch scoring rubric');
                }
            } catch (error) {
                console.error('Error fetching rubric:', error);
                setError('Error loading scoring criteria');
            } finally {
                setLoading(false);
            }
        };
        
        if (isOpen) {
            // Reset modal state on open so we always reflect latest server data
            setRubric(null);
            setScores({});
            fetchRubricForRegistration();
        }
    }, [registrationId, isOpen]);

    useEffect(() => {
        const fetchExistingScores = async () => {
            // Important: wait for rubric to load + scores map to be initialized,
            // otherwise rubric fetch can overwrite prefilled values.
            if (!isOpen || !registrationId || !judge || !rubric) return;

            try {
                const token = Cookies.get('authToken');
                const response = await fetch(
                    `${API_URL}score/judging-scores/?registration=${registrationId}&judge=${judge}`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );

                if (!response.ok) return;

                const raw = await response.json();
                const existing = raw.results || raw;

                // Merge existing scores into the current score map
                setScores(prev => {
                    const next = { ...prev };
                    (existing as Array<{ criteria: number; raw_score: string | number }>).forEach(s => {
                        const criteriaId = Number(s.criteria);
                        const rawScore = typeof s.raw_score === 'number' ? s.raw_score : parseFloat(s.raw_score);
                        if (!Number.isNaN(criteriaId) && !Number.isNaN(rawScore)) {
                            next[criteriaId] = rawScore.toString();
                        }
                    });
                    return next;
                });
            } catch (e) {
                console.error('Error fetching existing scores:', e);
            }
        };

        fetchExistingScores();
    }, [isOpen, registrationId, judge, rubric]);

    const handleScoreChange = (criteriaId: number, value: string) => {
        setScores(prev => ({
            ...prev,
            [criteriaId]: value
        }));
    };

    // Quick score buttons for touch-friendly input
    const handleQuickScore = (criteriaId: number, maxScore: number, percentage: number) => {
        const score = Math.round((maxScore * percentage / 100) * 2) / 2; // Round to nearest 0.5
        setScores(prev => ({
            ...prev,
            [criteriaId]: score.toString()
        }));
    };

    // Calculate progress
    const progress = useMemo(() => {
        if (!rubric) return { filled: 0, total: 0, percentage: 0 };
        const total = rubric.criteria.length;
        const filled = Object.values(scores).filter(s => s && s.trim() !== '').length;
        return {
            filled,
            total,
            percentage: total > 0 ? Math.round((filled / total) * 100) : 0
        };
    }, [scores, rubric]);

    // Calculate total score
    const totalScore = useMemo(() => {
        if (!rubric) return 0;
        return Object.entries(scores).reduce((sum, [, score]) => {
            if (!score || score.trim() === '') return sum;
            return sum + parseFloat(score);
        }, 0);
    }, [scores, rubric]);

    const handleSave = async () => {
        if (!judge || !registrationId || !rubric) {
            toast.error('Missing information', {
                description: 'Judge, registration, or rubric details are missing. Please reload and try again.'
            });
            return;
        }

        // Format scores for submission - now using criteria IDs directly
        const formattedScores = Object.entries(scores)
            .filter(([, score]) => score && score.trim() !== '')
            .map(([criteriaId, score]) => ({
                registration: registrationId,
                criteria: parseInt(criteriaId, 10),
                raw_score: parseFloat(score),
            }));

        if (formattedScores.length === 0) {
            toast.error('No scores to submit', {
                description: 'Please enter at least one valid score before submitting.'
            });
            return;
        }

        // Validate scores against max values
        for (const score of formattedScores) {
            const criteria = rubric.criteria.find(c => c.id === score.criteria);
            if (criteria && score.raw_score > parseFloat(criteria.max_score)) {
                toast.error('Score exceeds maximum', {
                    description: `Score for "${criteria.name}" cannot exceed ${criteria.max_score}`
                });
                return;
            }
        }

        setProcessing(true);

        try {
            // Try new bulk_create endpoint first
            let response = await fetch(`${API_URL}score/judging-scores/bulk_create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('authToken') || ''}`,
                },
                body: JSON.stringify({ 
                    scores: formattedScores,
                    judge_id: judge,  // Include judge_id as fallback
                }),
            });
            
            // If bulk endpoint fails (404), try individual submissions
            if (!response.ok && response.status === 404) {
                console.warn('⚠️ Bulk endpoint not found, trying individual submissions');
                
                const promises = formattedScores.map(score => 
                    fetch(`${API_URL}score/judging-scores/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${Cookies.get('authToken') || ''}`,
                        },
                        body: JSON.stringify(score),
                    })
                );
                
                const responses = await Promise.all(promises);
                response = responses[responses.length - 1];
                
                const allSucceeded = responses.every(r => r.ok);
                if (!allSucceeded) {
                    throw new Error('Some scores failed to submit');
                }
            }

            // bulk_create returns 207 Multi-Status when some entries failed.
            // fetch() considers 207 as ok=true, so we must inspect the payload.
            const responseData = await response.json().catch(() => null);

            if (response.ok) {
                const errors = responseData?.errors;
                if (Array.isArray(errors) && errors.length > 0) {
                    console.error('Partial failure submitting scores:', responseData);
                    const firstError = errors[0]?.error || 'Some scores failed to save.';
                    toast.error('Some scores were not saved', {
                        description: firstError,
                    });
                    return; // keep modal open
                }

                toast.success('Scores saved successfully!', {
                    description: 'All scores have been submitted and recorded.'
                });
                onScoreSubmitted?.();
                setIsOpen(false);
            } else {
                console.error('Error submitting scores:', responseData);
                toast.error('Failed to save scores', {
                    description: responseData?.error || responseData?.detail || 'Please check your input and try again.'
                });
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Unexpected error occurred', {
                description: 'Please try again later or contact support.'
            });
        } finally {
            setProcessing(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>Loading...</DialogTitle>
                <DialogBody>
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading scoring criteria...</span>
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Error state
    if (error) {
        return (
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogBody>
                    <div className="p-4 text-center">
                        <p className="text-red-600 font-semibold">{error}</p>
                        <p className="text-gray-500 mt-2 text-sm">
                            {categoryValue 
                                ? `No rubric configured for category "${categoryValue}"`
                                : 'Please contact an administrator to set up scoring criteria.'
                            }
                        </p>
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (!rubric) {
        return (
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>No Rubric</DialogTitle>
                <DialogBody>
                    <div className="p-4 text-center text-gray-500">
                        No scoring rubric found for this registration.
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Sort criteria by order
    const sortedCriteria = [...rubric.criteria].sort((a, b) => a.order - b.order);

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle></DialogTitle>
            <DialogBody className="p-0">
                <div className="flex flex-col h-full">
                    {/* Header - Sticky */}
                    <div className="sticky top-0 bg-white border-b px-4 py-3 z-10">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                {participantName}
                            </h1>
                            {categoryValue && (
                                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full whitespace-nowrap">
                                    {categoryValue}
                                </span>
                            )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                    {progress.filled} of {progress.total} scored
                                </span>
                                <span className="font-semibold text-blue-600">
                                    {totalScore.toFixed(1)} / {rubric.total_possible_points} pts
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Scrollable Criteria List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {sortedCriteria.map((criteria, index) => {
                            const maxScore = parseFloat(criteria.max_score);
                            const currentScore = scores[criteria.id] ? parseFloat(scores[criteria.id]) : null;
                            const scorePercentage = currentScore !== null ? (currentScore / maxScore) * 100 : 0;
                            
                            return (
                                <div 
                                    key={criteria.id} 
                                    className={`rounded-xl p-4 border-2 transition-all ${
                                        currentScore !== null 
                                            ? 'border-blue-300 bg-blue-50' 
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    {/* Criteria Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 flex items-center justify-center bg-gray-800 text-white text-sm font-bold rounded-full">
                                                    {index + 1}
                                                </span>
                                                <h3 className="font-semibold text-gray-900 text-base">
                                                    {criteria.name}
                                                </h3>
                                            </div>
                                            {criteria.description && (
                                                <p className="text-sm text-gray-500 mt-1 ml-9">
                                                    {criteria.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-2">
                                            <div className="text-2xl font-bold text-gray-800">
                                                {currentScore !== null ? currentScore : '—'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                / {criteria.max_score}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Score Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    scorePercentage >= 80 ? 'bg-green-500' :
                                                    scorePercentage >= 60 ? 'bg-blue-500' :
                                                    scorePercentage >= 40 ? 'bg-yellow-500' :
                                                    scorePercentage > 0 ? 'bg-orange-500' : 'bg-gray-300'
                                                }`}
                                                style={{ width: `${scorePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Quick Score Buttons - Large Touch Targets */}
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {[0, 25, 50, 75, 100].map((pct) => {
                                            const btnScore = Math.round((maxScore * pct / 100) * 2) / 2;
                                            const isSelected = currentScore === btnScore;
                                            return (
                                                <button
                                                    key={pct}
                                                    onClick={() => handleQuickScore(criteria.id, maxScore, pct)}
                                                    className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {btnScore}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Manual Input - Large for Thumbs */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const current = parseFloat(scores[criteria.id] || '0');
                                                if (current > 0) {
                                                    handleScoreChange(criteria.id, Math.max(0, current - 0.5).toString());
                                                }
                                            }}
                                            className="w-14 h-14 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-xl text-2xl font-bold text-gray-700 active:scale-95 transition-all"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            max={criteria.max_score}
                                            step="0.5"
                                            value={scores[criteria.id] || ''}
                                            onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                                            placeholder="0"
                                            className="flex-1 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={() => {
                                                const current = parseFloat(scores[criteria.id] || '0');
                                                if (current < maxScore) {
                                                    handleScoreChange(criteria.id, Math.min(maxScore, current + 0.5).toString());
                                                }
                                            }}
                                            className="w-14 h-14 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-xl text-2xl font-bold text-gray-700 active:scale-95 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogBody>
            
            {/* Fixed Footer Actions */}
            <DialogActions>
                <div className="flex gap-3 w-full px-4 pb-20 pt-3 bg-white border-t">
                    <Button 
                        onClick={() => setIsOpen(false)} 
                        disabled={processing}
                        className="flex-1 h-14 text-base font-semibold rounded-xl"
                    >
                        Cancel
                    </Button>
                    <button
                        onClick={handleSave}
                        disabled={processing || progress.filled === 0}
                        className={`flex-1 h-14 text-base font-semibold rounded-xl transition-all active:scale-95 ${
                            processing || progress.filled === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                        }`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                Saving...
                            </span>
                        ) : (
                            `Submit Scores (${progress.filled}/${progress.total})`
                        )}
                    </button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default ScoreFormModal;
