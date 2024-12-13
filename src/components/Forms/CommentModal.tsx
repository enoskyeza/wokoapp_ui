import React, { useState } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { API_URL } from '@/config';

interface CommentModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participantId: number;
}

function CommentModal({ isOpen, setIsOpen, participantId }: CommentModalProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async () => {
        const userData = Cookies.get('userData');
        if (!userData) {
            setError('User data not found. Please log in again.');
            return;
        }

        let judgeId;
        try {
            const parsedData = JSON.parse(userData);
            judgeId = parsedData.id;
        } catch (e) {
            console.log(e)
            setError('Invalid user data. Please log in again.');
            return;
        }

        if (!comment.trim()) {
            setError('Comment cannot be empty.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}score/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    judge: judgeId,
                    contestant: participantId,
                    comment,
                }),
            });

            if (response.ok) {
                alert('Comment submitted successfully!');
                setComment(''); // Clear the comment field after success
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to submit comment.');
            }
        } catch (e) {
            console.log(e)
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>Add Comment
            </DialogTitle>
            <DialogBody>
                <div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter your comment here"
                        rows={5}
                    />
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                </div>
            </DialogBody>
            <DialogActions>
                <div className="flex justify-center gap-3">
                    <Button onClick={() => setIsOpen(false)} disabled={processing}>
                        Close
                    </Button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600"
                        disabled={processing}
                    >
                        {processing ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default CommentModal;
