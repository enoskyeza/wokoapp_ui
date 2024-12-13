import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParticipantContext } from '@/context/ParticipantContext';
import ScoreForm from './ScoreForm';
import Cookies from 'js-cookie';

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participantId: number;
};

type Criteria = {
    id: number;
    name: string;
};

function ScoreFormModal({ isOpen, setIsOpen, participantId }: InterfaceProps) {
    const [judge, setJudge] = useState<number | null>(null);
    const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
    const [scores, setScores] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<boolean>(false);

    const { getParticipantDetailsById } = useParticipantContext();
    const { participant } = getParticipantDetailsById(participantId);

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
        const fetchCriteria = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/score/criteria/');
                if (response.ok) {
                    const data: Criteria[] = await response.json();
                    setCriteriaList(data);
                } else {
                    console.error('Failed to fetch criteria');
                }
            } catch (error) {
                console.error('Error fetching criteria:', error);
            }
        };
        fetchCriteria();
    }, []);

    const handleScoresChange = (updatedScores: Record<string, string>) => {
        setScores(updatedScores);
    };

    const handleSave = async () => {
        if (!judge || !participantId) {
            alert('Missing judge or participant details. Please reload and try again.');
            return;
        }

        // Format scores for submission
        const formattedScores = Object.entries(scores)
            .filter(([_, score]) => score) // Filter empty scores
            .map(([criteriaName, score]) => {
                const matchingCriteria = criteriaList.find(c => c.name === criteriaName);
                if (!matchingCriteria) {
                    console.warn(`Criteria "${criteriaName}" not found.`);
                    return null;
                }
                return {
                    judge,
                    contestant: participantId,
                    criteria: matchingCriteria.id,
                    score: parseFloat(score),
                };
            })
            .filter((item): item is { judge: number; contestant: number; criteria: number; score: number } => item !== null);

        if (formattedScores.length === 0) {
            alert('No valid scores to submit.');
            return;
        }

        setProcessing(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/score/upload-scores/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedScores),
            });

            if (response.ok) {
                alert('Scores saved successfully!');
                setIsOpen(false); // Close the modal
            } else {
                const errorData = await response.json();
                console.error('Error submitting scores:', errorData);
                alert('Failed to save scores. Please check your input.');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            setProcessing(false);
        }
    };

    if (!participant) return <div>No participant found.</div>;

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>
            </DialogTitle>
            <DialogBody>
                <div>
                    <h1 className="text-2xl font-bold mb-4 text-blue-800">Scoring for {participant.first_name} {participant.last_name}</h1>
                    <ScoreForm onScoresChange={handleScoresChange} />
                </div>
            </DialogBody>
            <DialogActions>
                <div className="flex justify-center gap-3">
                    <Button onClick={() => setIsOpen(false)} disabled={processing}>
                        Close
                    </Button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default ScoreFormModal;
