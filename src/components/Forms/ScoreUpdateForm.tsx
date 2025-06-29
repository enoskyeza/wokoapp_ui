// import React from 'react';

// interface NewCriteria {
//     id: number;
//     name: string;
//     score: string
//  }

// interface CategoryProp {
//     id?: number
//     name: string;
//     criteria: NewCriteria[];
// }

// interface ScoreUpdateFormProps {
//     categories: CategoryProp[];
//     scores: Record<string, string>;
//     onScoresChange: (updatedScores: Record<string, string>) => void;
//     openSections: string[];
//     toggleSection: (categoryName: string) => void;
// }

// const ScoreUpdateForm: React.FC<ScoreUpdateFormProps> = ({
//     categories,
//     scores,
//     onScoresChange,
//     openSections,
//     toggleSection,
// }) => {
//     const handleInputChange = (criteriaName: string, value: string) => {
//         const updatedScores = {
//             ...scores,
//             [criteriaName]: value,
//         };
//         onScoresChange(updatedScores);
//     };


//     return (
//         <div className="p-4 max-w-4xl mx-auto shadow-md rounded-lg">
//             {categories.map((category) => (
//                 <div key={category.name} className="mb-4">
//                     <button
//                         onClick={() => toggleSection(category.name)}
//                         className="w-full text-left bg-blue-100 text-blue-700 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
//                     >
//                         {category.name}
//                     </button>
//                     {openSections.includes(category.name) && (
//                         <fieldset className="mt-2 border border-gray-300 rounded-md p-4">
//                             <legend className="text-lg font-semibold text-gray-700">
//                                 {category.name}
//                             </legend>
//                             {category.criteria.map((criteria) => (
//                                 <div key={criteria.id} className="mb-2">
//                                     <label
//                                         htmlFor={`criteria-${criteria.id}`}
//                                         className="block text-sm font-medium text-gray-600"
//                                     >
//                                         {criteria.name}
//                                     </label>
//                                     <input
//                                         id={`criteria-${criteria.id}`}
//                                         type="number"
//                                         step="0.01"
//                                         max="10"
//                                         value={scores[criteria.score] || ''}
//                                         onChange={(e) =>
//                                             handleInputChange(criteria.name, e.target.value)
//                                         }
//                                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                                         placeholder="Enter score (max 10)"
//                                     />
//                                 </div>
//                             ))}
//                         </fieldset>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ScoreUpdateForm;
