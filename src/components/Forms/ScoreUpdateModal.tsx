// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import Cookies from 'js-cookie';
// import { API_URL } from '@/config';
// import ScoreUpdateForm from './ScoreUpdateForm';
// import { fetchCriteria, mapScoresByCategory } from '@/components/utils/scoreUtils';

// interface NewCriteria {
//     id: number;
//     name: string;
//     score?: string
//  }

// interface CategoryProp {
//     id?: number
//     name: string;
//     criteria: NewCriteria[];
// }

// type ScoreUpdateModalProps = {
//     isOpen: boolean;
//     setIsOpen: (isOpen: boolean) => void;
//     participantId: number;
// };

// function ScoreUpdateModal({ isOpen, setIsOpen, participantId }: ScoreUpdateModalProps) {
//     const [judge, setJudge] = useState<number | null>(null);
//     const [categories, setCategories] = useState<CategoryProp[]>([]);
//     const [scores, setScores] = useState<Record<string, string>>({});
//     const [openSections, setOpenSections] = useState<string[]>([]);
//     const [processing, setProcessing] = useState<boolean>(false);

//     // Fetch judge ID from cookies
//     useEffect(() => {
//         const userData = Cookies.get('userData');
//         if (userData) {
//             try {
//                 const parsedData = JSON.parse(userData);
//                 setJudge(parsedData.id);
//             } catch (error) {
//                 console.error('Error parsing userData cookie:', error);
//             }
//         }
//     }, []);

//     // Fetch and map criteria and scores
//     useEffect(() => {
//         const initializeData = async () => {
//             try {
//                 const criteriaData = await fetchCriteria() as CategoryProp[];
//                 const scoresResponse = await fetch(
//                     `${API_URL}score/score-dets/?judge=${judge}&contestant=${participantId}`
//                 );

//                 if (scoresResponse.ok) {
//                     const scoresData = await scoresResponse.json();
//                     setCategories(mapScoresByCategory(criteriaData, scoresData));
//                 } else {
//                     console.error('Failed to fetch scores.');
//                 }
//             } catch (error) {
//                 console.error('Error initializing data:', error);
//             }
//         };

//         if (judge && participantId) {
//             initializeData();
//         }
//     }, [judge, participantId]);

//     const handleScoresChange = (updatedScores: Record<string, string>) => {
//         setScores(updatedScores);
//     };

//     const toggleSection = (categoryName: string) => {
//         setOpenSections((prevSections) =>
//             prevSections.includes(categoryName)
//                 ? prevSections.filter((section) => section !== categoryName)
//                 : [...prevSections, categoryName]
//         );
//     };

//     const handleSave = async () => {
//         setProcessing(true);

//         try {
//             const updatedScores = Object.entries(scores).map(([criteriaName, score]) => {
//                 const matchingCategory = categories.find((category) =>
//                     category.criteria.some((criteria) => criteria.name === criteriaName)
//                 );
//                 const matchingCriteria = matchingCategory?.criteria.find(
//                     (criteria) => criteria.name === criteriaName
//                 );

//                 return matchingCriteria
//                     ? {
//                           judge,
//                           contestant: participantId,
//                           criteria: matchingCriteria.id,
//                           score: parseFloat(score),
//                       }
//                     : null;
//             });

//             const validScores = updatedScores.filter((score) => score !== null);

//             if (validScores.length === 0) {
//                 alert('No valid scores to submit.');
//                 return;
//             }

//             const response = await fetch(`${API_URL}score/upload-scores/`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(validScores),
//             });

//             if (response.ok) {
//                 alert('Scores updated successfully!');
//                 setIsOpen(false);
//             } else {
//                 console.error('Failed to save scores.');
//             }
//         } catch (error) {
//             console.error('Unexpected error saving scores:', error);
//         } finally {
//             setProcessing(false);
//         }
//     };

//     return (
//         <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
//             <DialogTitle>Update Scores</DialogTitle>
//             <DialogBody>
//                 <ScoreUpdateForm
//                     categories={categories}
//                     scores={scores}
//                     onScoresChange={handleScoresChange}
//                     openSections={openSections}
//                     toggleSection={toggleSection}
//                 />
//             </DialogBody>
//             <DialogActions>
//                 <div className="flex justify-center gap-3">
//                     <Button onClick={() => setIsOpen(false)} disabled={processing}>
//                         Close
//                     </Button>
//                     <button
//                         onClick={handleSave}
//                         className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow hover:bg-green-600"
//                         disabled={processing}
//                     >
//                         {processing ? 'Saving...' : 'Save'}
//                     </button>
//                 </div>
//             </DialogActions>
//         </Dialog>
//     );
// }

// export default ScoreUpdateModal;
