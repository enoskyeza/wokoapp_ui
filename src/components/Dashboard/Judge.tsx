'use client'

import React, { useState, useEffect } from "react";
import { useParticipantContext } from "@/context/ParticipantContext";
import Cookies from "js-cookie";
import Link from "next/link";
import ScoreFormModal from "../Forms/ScoreFormModal";
import { Score, Participant } from "@/types";



const JudgeDashboard: React.FC = () => {
  const [judgeName, setJudgeName] = useState("Judge");
  const [judgeId, setJudgeId] = useState(null);

  useEffect(() => {
    const userData = Cookies.get('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            setJudgeId(parsedData.id);
            setJudgeName(parsedData.username);
        } catch (error) {
            console.error('Error parsing userData cookie: ', error);
        }
    }
}, []);

  const { participants } = useParticipantContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedage_category, setSelectedage_category] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const filteredParticipants = participants.filter((participant) => {
    const paid = participant.payment_status.toLowerCase() === 'paid'

    const matchesSearch =
      participant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesage_category =
      !selectedage_category || participant.age_category === selectedage_category;

    const matchesGender = !selectedGender || participant.gender === selectedGender;

    return paid && matchesSearch && matchesage_category && matchesGender;
  });

  const has_judge_scores = (participant:Participant) => {
    return participant.scores.some((score:Score) => score.judge === judgeId);
  };




  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);

  const handleAddScore = (participantId: number) => {
    setSelectedParticipant(participantId)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-blue-700 mb-4 capitalize">
        Welcome, {judgeName}
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md w-full mb-4"
        />

        <div className="flex gap-4 mb-4">
          <select
            className="p-2 border rounded-md"
            value={selectedage_category || ""}
            onChange={(e) => setSelectedage_category(e.target.value || null)}
          >
            <option value="">All Age Categories</option>
            <option value="junior">3-7 years</option>
            <option value="intermediate">8-12 years</option>
            <option value="senior">13-18 years</option>
          </select>

          <select
            className="p-2 border rounded-md"
            value={selectedGender || ""}
            onChange={(e) => setSelectedGender(e.target.value || null)}
          >
            <option value="">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredParticipants.map((participant, index) => (
          <div key={participant.id}>
            <div
              className={`p-4 flex flex-col items-left justify-between sm:flex-row sm:items-center ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
            >
              <div className="flex-1">
                <Link href={`judge_panel/${participant.id}`} className="font-bold text-gray-700 hover:text-blue-500">
                  {participant.identifier}
                </Link>
                <p className="text-gray-600">
                  {participant.first_name} {participant.last_name}
                </p>
              </div>
              <div className="flex gap-2">
              {
                participant.scores && has_judge_scores(participant) ? (
                  <button
                    onClick={() => handleAddScore(participant.id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm">
                    Update Scores
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddScore(participant.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">
                    Add Score
                  </button>
                )
              }


                <button className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm">
                  Comment
                </button>
              </div>
            </div>
            {index < filteredParticipants.length - 1 && (
              <hr className="border-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Modal Component */}
      {isModalOpen && selectedParticipant && (
        <ScoreFormModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} participantId={selectedParticipant} />
      )}
    </div>
  );
};

export default JudgeDashboard;