// utils/scoreUtils.ts

import { API_URL } from '@/config';
import { Score, ScoreViewOnly, Criteria } from "@/types";

interface NewCriteria {
    id: number;
    name: string;
    score?: string
 }

interface CategoryProp {
    id?: number
    name: string;
    criteria: NewCriteria[];
}

// Function to filter scores by judge and tally by category
export const calculateScores = (scores: Score[], loggedInJudge: number | null) => {

    // Step 1: Filter scores by the logged-in judge
    const filteredScores = scores.filter((score) => score.judge === loggedInJudge);

    // Step 2: Define categories and their total possible scores
    const categories = [
        { name: "Fun", total: 50, icon: "/icon-01.png" },
        { name: "Function", total: 40, icon: "/icon-02.png" },
        { name: "Engineering and crafting", total: 40, icon: "/icon-03.png" },
        { name: "Creativity & Innovation", total: 50, icon: "/icon-04.png" },
    ];

    // Step 3: Initialize scoresByCategory with zero scores for each category
    const scoresByCategory = categories.map((category) => ({
        category: category.name,
        total: category.total,
        score: 0,
        icon: category.icon,
    }));

    // Step 4: Tally scores by category
    filteredScores.forEach((score) => {
        const categoryName = score.criteria.category.name;
        const categoryIndex = categories.findIndex(
            (category) => category.name === categoryName
        );

        if (categoryIndex !== -1) {
            scoresByCategory[categoryIndex].score += parseFloat(score.score);
        }

    });

    // Step 5: Calculate total score and total possible
    const totalScore = scoresByCategory.reduce((sum, category) => sum + category.score, 0);
    const totalPossible = scoresByCategory.reduce((sum, category) => sum + category.total, 0);

    return { scoresByCategory, totalScore, totalPossible };
};



/**
 * Fetches criteria data from the API and formats it by categories.
 * @returns {Promise<CategoryProp[]>} The formatted categories with their criteria.
 */
export const fetchCriteria = async (): Promise<CategoryProp[]> => {
    try {
        const response = await fetch(`${API_URL}score/criteria/`);
        if (!response.ok) {
            throw new Error('Failed to fetch criteria.');
        }

        const data: Criteria[] = await response.json();
        const categoriesMap: Record<string, CategoryProp> = {};

        data.forEach((item) => {
            const { category, name, id } = item;

            if (!categoriesMap[category.name]) {
                categoriesMap[category.name] = {
                    id: category.id,
                    name: category.name,
                    criteria: [],
                };
            }

            categoriesMap[category.name].criteria.push({ id, name });
        });

        return Object.values(categoriesMap);
    } catch (error) {
        console.error('Error fetching criteria:', error);
        throw error;
    }
};

/**
 * Maps scores by categories and criteria.
 * @param {Category[]} categories The list of categories with criteria.
 * @param {Score[]} scores The list of scores to map.
 * @returns {Category[]} The categories enriched with scores.
 */
export const mapScoresByCategory = (categories: CategoryProp[], scores: ScoreViewOnly[]): CategoryProp[] => {
    // Create a map where the key is the criteria ID and the value is the score
    const scoresMap: Record<number, string> = scores.reduce((acc, score) => {
        acc[score.criteria] = score.score; // Use score.criteria.id
        return acc;
    }, {} as Record<number, string>);

    // Map categories and add scores to criteria
    const data = categories.map((category) => ({
        ...category,
        criteria: category.criteria.map((criteria) => ({
            ...criteria,
            score: scoresMap[criteria.id] || '', // Add the score if it exists
        })),
    }));

    return data;
};

