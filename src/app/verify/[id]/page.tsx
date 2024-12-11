'use client'
import { useEffect, useState, use } from "react";
import Link from 'next/link';
import { API_URL } from "@/config";

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  school?: string;
}

export default function VerifyParticipant({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);
  const participantId = id
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await fetch(`${API_URL}register/contestants/${participantId}`);
        if (!response.ok) {
          throw new Error("Participant not found.");
        }

        const data: Participant = await response.json();
        setParticipant(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">Error</h1>
          <p className="mt-4 text-gray-600">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Participant Verified 🎉
        </h1>
        <div className="text-gray-700 space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {participant?.first_name}{" "}
            {participant?.last_name}
          </p>
          <p>
            <span className="font-semibold">Age:</span> {participant?.age}
          </p>
          <p>
            <span className="font-semibold">Gender:</span>{" "}
            {participant?.gender === "M" ? "Male" : "Female"}
          </p>
          {participant?.school && (
            <p>
              <span className="font-semibold">School:</span> {participant.school}
            </p>
          )}
        </div>
        <Link
          href="/"
          className="mt-6 inline-block w-full text-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
}
