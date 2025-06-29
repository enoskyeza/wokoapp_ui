import React, { useState } from 'react';

const categories = [
    {
        name: 'Fun',
        criteria: [
            'Did the child have fun building it?',
            'Linking hobby to the activity',
            'Toy demonstration moment',
            'Passion',
            'Bonus point',
        ],
    },
    {
        name: 'Function',
        criteria: [
            'Functionality',
            'Applicability',
            'Lends itself to more than one use?',
            'Bonus points',
        ],
    },
    {
        name: 'Engineering and crafting',
        criteria: [
            'Neatness',
            'Quality of execution',
            'Attention to detail',
            'Build Style',
        ],
    },
    {
        name: 'Creativity & Innovation',
        criteria: [
            'Build Style',
            'Uniqueness',
            'Demonstrate an understanding of material properties',
            'Combining different materials/resources',
            'Bonus point',
        ],
    },
];

type ScoreFormProps = {
    onScoresChange: (scores: Record<string, string>) => void;
};


const ScoreForm: React.FC<ScoreFormProps> = ({ onScoresChange }) => {
    const [scores, setScores] = useState<Record<string, string>>({});
    const [openSections, setOpenSections] = useState<string[]>([]);

    const handleInputChange = (criteria: string, value: string) => {
        const updatedScores = {
          ...scores,
          [criteria]: value,
        };
        setScores(updatedScores);
        onScoresChange(updatedScores); // Notify the parent about score changes
      };

    const handleToggleSection = (category: string) => {
        setOpenSections((prevSections) =>
            prevSections.includes(category)
                ? prevSections.filter((section) => section !== category)
                : [...prevSections, category]
        );
    };



    return (
        <div className="p-4 max-w-4xl mx-auto  shadow-md rounded-lg">
            {categories.map((category) => (
                <div key={category.name} className="mb-4">
                    <button
                        onClick={() => handleToggleSection(category.name)}
                        className="w-full text-left bg-blue-100 text-blue-700 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        {category.name}
                    </button>
                    {openSections.includes(category.name) && (
                        <fieldset className="mt-2 border border-gray-300 rounded-md p-4">
                            <legend className="text-lg font-semibold text-gray-700">
                                {category.name}
                            </legend>
                            {category.criteria.map((criteria) => (
                                <div key={criteria} className="mb-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        {criteria}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        max="10"
                                        value={scores[criteria] || ''}
                                        onChange={(e) => handleInputChange(criteria, e.target.value)}
                                        className="mt-1 block px-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter score (max 10)"
                                    />
                                </div>
                            ))}
                        </fieldset>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ScoreForm;
