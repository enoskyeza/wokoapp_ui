import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_URL } from '@/config';
import Cookies from 'js-cookie';

interface CommentModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participantId: number;
    participantName?: string;
    onCommentAdded?: () => void;
}

interface ExistingComment {
    id: number;
    judge: number;
    judge_name: string;
    comment: string;
    created_at: string;
}

function CommentModal({ isOpen, setIsOpen, participantId, participantName, onCommentAdded }: CommentModalProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [existingComments, setExistingComments] = useState<ExistingComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [currentJudgeName, setCurrentJudgeName] = useState('');

    // Load existing comments when modal opens
    useEffect(() => {
        const fetchComments = async () => {
            if (!isOpen || !participantId) return;
            
            setLoadingComments(true);
            try {
                const token = Cookies.get('authToken');
                const response = await fetch(
                    `${API_URL}score/comments/?participant_id=${participantId}`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setExistingComments(data.results || data);
                }
            } catch (e) {
                console.error('Error fetching comments:', e);
            } finally {
                setLoadingComments(false);
            }
        };
        
        fetchComments();
        
        // Get current judge name
        const userData = Cookies.get('userData');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setCurrentJudgeName(parsed.username || '');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, [isOpen, participantId]);

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
            const token = Cookies.get('authToken');
            const response = await fetch(`${API_URL}score/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    judge: judgeId,
                    participant: participantId,
                    comment,
                }),
            });

            if (response.ok) {
                const newComment = await response.json();
                toast.success('Comment submitted successfully!');
                setComment('');
                // Add to existing comments list
                setExistingComments(prev => [
                    {
                        ...newComment,
                        judge_name: currentJudgeName,
                        created_at: new Date().toISOString(),
                    },
                    ...prev
                ]);
                onCommentAdded?.();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || errorData.participant?.[0] || 'Failed to submit comment.');
            }
        } catch (e) {
            console.log(e)
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle></DialogTitle>
            <DialogBody className="p-0">
                <div className="flex flex-col max-h-[70vh]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">
                            💬 Comments
                        </h2>
                        {participantName && (
                            <p className="text-sm text-gray-600">{participantName}</p>
                        )}
                    </div>
                    
                    {/* Existing Comments */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[100px] max-h-[250px] bg-gray-50">
                        {loadingComments ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : existingComments.length === 0 ? (
                            <p className="text-center text-gray-400 py-4 text-sm">
                                No comments yet. Be the first to add one!
                            </p>
                        ) : (
                            existingComments.map((c) => (
                                <div 
                                    key={c.id} 
                                    className={`p-3 rounded-lg ${
                                        c.judge_name.toLowerCase() === currentJudgeName.toLowerCase()
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-semibold ${
                                            c.judge_name.toLowerCase() === currentJudgeName.toLowerCase()
                                                ? 'text-blue-700'
                                                : 'text-gray-700'
                                        }`}>
                                            {c.judge_name}
                                            {c.judge_name.toLowerCase() === currentJudgeName.toLowerCase() && (
                                                <span className="ml-1 text-xs font-normal">(You)</span>
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(c.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{c.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* New Comment Input */}
                    <div className="px-4 py-3 border-t bg-white">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Write your comment..."
                            rows={3}
                        />
                        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
                    </div>
                </div>
            </DialogBody>
            <DialogActions>
                <div className="flex gap-3 w-full px-4 pb-20">
                    <Button 
                        onClick={() => setIsOpen(false)} 
                        disabled={processing}
                        className="flex-1 h-12"
                    >
                        Close
                    </Button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing || !comment.trim()}
                        className={`flex-1 h-12 font-semibold rounded-lg transition-all ${
                            processing || !comment.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {processing ? 'Sending...' : 'Send Comment'}
                    </button>
                </div>
            </DialogActions>
        </Dialog>
    );
}

export default CommentModal;
