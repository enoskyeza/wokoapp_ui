// utils/scoreUtils.ts

import { Score } from "@/types";

// Function to filter scores by judge and tally by category
export const calculateScores = (scores: Score[], loggedInJudge: number | null) => {

    // Step 1: Filter scores by the logged-in judge
    const filteredScores = scores.filter((score) => score.judge === loggedInJudge);

    // Step 2: Define categories and their total possible scores
    const categories = [
        { name: "Fun", total: 50, icon: "/icon-01.png" },
        { name: "Function", total: 40, icon: "/icon-02.png" },
        { name: "Engineering and Crafting", total: 40, icon: "/icon-03.png" },
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
