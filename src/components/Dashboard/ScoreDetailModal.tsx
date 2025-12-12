import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { API_URL } from '@/config';

interface ScoreDetailModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    registrationId: number;
    participantName: string;
    categoryValue?: string;
    currentJudgeName: string;
}

interface CriteriaScore {
    criteria_id: number;
    criteria_name: string;
    max_score: number;
    scores: {
        judge_name: string;
        judge_id: number;
        raw_score: number;
    }[];
    average: number;
    my_score: number | null;
}

interface ScoreData {
    registration_id: number;
    participant_name: string;
    category_value: string;
    rubric_name: string;
    total_possible: number;
    criteria_scores: CriteriaScore[];
    overall_average: number;
    my_total: number | null;
    judges: { id: number; name: string; initials: string }[];
}

function ScoreDetailModal({ 
    isOpen, 
    setIsOpen, 
    registrationId, 
    participantName, 
    categoryValue,
    currentJudgeName 
}: ScoreDetailModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);
    const [viewMode, setViewMode] = useState<'my_scores' | 'overall'>('my_scores');

    useEffect(() => {
        const fetchScores = async () => {
            if (!registrationId || !isOpen) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const token = Cookies.get('authToken');
                const response = await fetch(
                    `${API_URL}score/judging-scores/?registration=${registrationId}`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                
                if (response.ok) {
                    const rawScores = await response.json();
                    const scoresArray = rawScores.results || rawScores;
                    
                    // Also fetch the rubric to get criteria info
                    const rubricResponse = await fetch(
                        `${API_URL}score/rubrics/for-registration/${registrationId}/`,
                        {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                        }
                    );
                    
                    if (rubricResponse.ok) {
                        const rubric = await rubricResponse.json();
                        
                        // Process scores by criteria
                        const criteriaMap = new Map<number, CriteriaScore>();
                        const judgesSet = new Map<number, { id: number; name: string; initials: string }>();
                        
                        // Initialize from rubric criteria
                        rubric.criteria.forEach((c: { id: number; name: string; max_score: string }) => {
                            criteriaMap.set(c.id, {
                                criteria_id: c.id,
                                criteria_name: c.name,
                                max_score: parseFloat(c.max_score),
                                scores: [],
                                average: 0,
                                my_score: null,
                            });
                        });
                        
                        // Populate with actual scores
                        scoresArray.forEach((score: { 
                            criteria: number; 
                            judge: number; 
                            judge_username?: string;
                            raw_score: string;
                        }) => {
                            const criteriaScore = criteriaMap.get(score.criteria);
                            if (criteriaScore) {
                                const judgeName = score.judge_username || `Judge ${score.judge}`;
                                const initials = judgeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                
                                criteriaScore.scores.push({
                                    judge_name: judgeName,
                                    judge_id: score.judge,
                                    raw_score: parseFloat(score.raw_score),
                                });
                                
                                // Track if this is current judge's score (compare username)
                                if (judgeName.toLowerCase() === currentJudgeName.toLowerCase()) {
                                    criteriaScore.my_score = parseFloat(score.raw_score);
                                }
                                
                                // Track unique judges
                                if (!judgesSet.has(score.judge)) {
                                    judgesSet.set(score.judge, { id: score.judge, name: judgeName, initials });
                                }
                            }
                        });
                        
                        // Calculate averages
                        let totalAverage = 0;
                        let myTotal = 0;
                        let hasMyScores = false;
                        
                        criteriaMap.forEach(cs => {
                            if (cs.scores.length > 0) {
                                cs.average = cs.scores.reduce((sum, s) => sum + s.raw_score, 0) / cs.scores.length;
                                totalAverage += cs.average;
                            }
                            if (cs.my_score !== null) {
                                myTotal += cs.my_score;
                                hasMyScores = true;
                            }
                        });
                        
                        setScoreData({
                            registration_id: registrationId,
                            participant_name: participantName,
                            category_value: categoryValue || '',
                            rubric_name: rubric.name,
                            total_possible: parseFloat(rubric.total_possible_points),
                            criteria_scores: Array.from(criteriaMap.values()).sort((a, b) => a.criteria_id - b.criteria_id),
                            overall_average: totalAverage,
                            my_total: hasMyScores ? myTotal : null,
                            judges: Array.from(judgesSet.values()),
                        });
                    } else {
                        setError('Could not load rubric information');
                    }
                } else {
                    setError('Failed to fetch scores');
                }
            } catch (err) {
                console.error('Error fetching scores:', err);
                setError('Error loading scores');
            } finally {
                setLoading(false);
            }
        };
        
        fetchScores();
    }, [registrationId, isOpen, participantName, categoryValue, currentJudgeName]);

    if (loading) {
        return (
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>Loading Scores...</DialogTitle>
                <DialogBody>
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (error || !scoreData) {
        return (
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogBody>
                    <p className="text-red-600 text-center p-4">{error || 'No score data available'}</p>
                </DialogBody>
                <DialogActions>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const displayTotal = viewMode === 'my_scores' ? scoreData.my_total : scoreData.overall_average;
    const percentage = displayTotal !== null ? (displayTotal / scoreData.total_possible) * 100 : 0;

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle></DialogTitle>
            <DialogBody className="p-0">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4">
                        <h2 className="text-xl font-bold">{participantName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {categoryValue && (
                                <span className="px-2 py-0.5 bg-white/20 rounded text-sm">
                                    {categoryValue}
                                </span>
                            )}
                            <span className="text-blue-100 text-sm">
                                {scoreData.judges.length} judge{scoreData.judges.length !== 1 ? 's' : ''} scored
                            </span>
                        </div>
                    </div>
                    
                    {/* View Mode Toggle */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setViewMode('my_scores')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                                viewMode === 'my_scores'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            My Scores
                        </button>
                        <button
                            onClick={() => setViewMode('overall')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                                viewMode === 'overall'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Overall Average
                        </button>
                    </div>
                    
                    {/* Total Score Summary */}
                    <div className="px-4 py-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">
                                {viewMode === 'my_scores' ? 'Your Total' : 'Average Total'}
                            </span>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-gray-800">
                                    {displayTotal !== null ? displayTotal.toFixed(1) : '—'}
                                </span>
                                <span className="text-gray-500 text-lg">
                                    / {scoreData.total_possible}
                                </span>
                            </div>
                        </div>
                        {displayTotal !== null && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all ${
                                            percentage >= 80 ? 'bg-green-500' :
                                            percentage >= 60 ? 'bg-blue-500' :
                                            percentage >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
                                        }`}
                                        style={{ width: `${Math.min(100, percentage)}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-1 text-right">{percentage.toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Criteria Breakdown */}
                    <div className="px-4 py-4 space-y-3 max-h-80 overflow-y-auto">
                        {scoreData.criteria_scores.map((cs, index) => {
                            const score = viewMode === 'my_scores' ? cs.my_score : cs.average;
                            const scorePercent = score !== null ? (score / cs.max_score) * 100 : 0;
                            
                            return (
                                <div key={cs.criteria_id} className="bg-white rounded-lg border p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 flex items-center justify-center bg-gray-800 text-white text-xs font-bold rounded-full">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-gray-800 text-sm">
                                                {cs.criteria_name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-gray-800">
                                                {score !== null ? score.toFixed(1) : '—'}
                                            </span>
                                            <span className="text-gray-400 text-sm">/{cs.max_score}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full transition-all ${
                                                scorePercent >= 80 ? 'bg-green-500' :
                                                scorePercent >= 60 ? 'bg-blue-500' :
                                                scorePercent >= 40 ? 'bg-yellow-500' :
                                                scorePercent > 0 ? 'bg-orange-500' : 'bg-gray-300'
                                            }`}
                                            style={{ width: `${scorePercent}%` }}
                                        />
                                    </div>
                                    
                                    {/* Show all judges' scores in overall mode */}
                                    {viewMode === 'overall' && cs.scores.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {cs.scores.map((s, i) => (
                                                <span 
                                                    key={i}
                                                    className={`text-xs px-2 py-0.5 rounded ${
                                                        s.judge_name.toLowerCase() === currentJudgeName.toLowerCase()
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                    title={s.judge_name}
                                                >
                                                    {s.judge_name.split(' ')[0]}: {s.raw_score}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Judges who scored */}
                    {scoreData.judges.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t">
                            <p className="text-xs text-gray-500 mb-2">Scored by:</p>
                            <div className="flex flex-wrap gap-2">
                                {scoreData.judges.map(judge => (
                                    <span 
                                        key={judge.id}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                            judge.name.toLowerCase() === currentJudgeName.toLowerCase()
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-800 text-white text-xs font-bold rounded-full">
                                            {judge.initials}
                                        </span>
                                        {judge.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogBody>
            <DialogActions>
                <div className="w-full px-4 pb-20">
                    <Button 
                        onClick={() => setIsOpen(false)}
                        className="w-full h-12 text-base font-semibold"
                    >
                        Close
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default ScoreDetailModal;
