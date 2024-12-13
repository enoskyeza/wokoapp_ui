'use client'
import React, { useEffect, useState } from "react";
import { ParticipantDetails } from "@/types";
import Cookies from "js-cookie";
import { calculateScores } from "@/components/utils/scoreUtils";

interface ScoreDetailsProps {
  participant: ParticipantDetails;
}

const ScoreDetails: React.FC<ScoreDetailsProps> = ({ participant }) => {

  const [judge, setJudge] = useState(null);

  useEffect(() => {
    const userData = Cookies.get("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setJudge(parsedData.id);
      } catch (error) {
        console.error("Error parsing userData cookie: ", error);
      }
    }
  }, []);

  if (judge === null) {
    return
  }

  // Use the helper function to calculate scores
  const { scoresByCategory, totalScore, totalPossible } = calculateScores(
    participant.scores,
    judge
  );

  // filter comments

const comments = participant.comments.filter(comment => comment.judge===judge)


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Participant Details */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2"> {participant.first_name} {participant.last_name}</h2>
        <p>{participant.identifier} | {participant.gender} - {participant.age} Years</p>
      </div>

      {/* Scoring Tabs */}
      <div className="grid grid-cols-2 gap-4 text-center">
        {scoresByCategory.map((score, index) => (
          <div
            key={score.category}
            className={`p-6 rounded-lg shadow-md ${index === 0 || index === 3 ? "bg-blue-300 text-blue-700" : "bg-blue-700 text-blue-300"
              }`}
          >
            <div className="flex flex-col items-center">
              <img src={score.icon} alt={score.category} className="w-12 h-12 mb-2" />
              <h3 className="font-bold text-lg">{score.category}</h3>
              <p className="text-[32px] font-bold">
                {score.score}/{score.total}
              </p>
            </div>
          </div>
        ))}

        {/* Total Tab */}
        <div className="p-6 rounded-lg shadow-md bg-orange-500 text-blue-700 col-span-2">
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-lg">Total Points</h3>
            <p className="lead text-[32px] font-bold">
              {totalScore}/{totalPossible}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment, index) => (
              <li key={index} className="p-2 text-gray-500 italic">
                <p><strong>{comment.judge_name}:</strong> {comment.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments available.</p>
        )}
      </div>
    </div>
  );
};

export default ScoreDetails;
