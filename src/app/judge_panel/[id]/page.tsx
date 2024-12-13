'use client'
import React, { useEffect, useState, use } from "react";
import ScoreDetails from "@/components/Score/ScoreDetails";
import { ParticipantProvider } from "@/context/ParticipantContext";
import DashboardLayout from '@/components/Layouts/Dashboard';
import { API_URL } from "@/config";
import BackButton from "@/components/Buttons/BackButton";
import { ParticipantDetails } from "@/types";
import LoadingSpinner from "@/components/utils/LoadingSpinner";



const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  // State to store the fetched participant data
  const [participant, setParticipant] = useState<ParticipantDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Fetch participant data when the component is mounted and ID is available
      const fetchParticipantData = async () => {
        try {
          const response = await fetch(`${API_URL}score/participant-dets/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch participant data');
          }
          const data = await response.json();
          setParticipant(data);
        } catch (err) {
          console.log(err)
          setError('Failed to fetch participant data');
        } finally {
          setLoading(false);
        }
      };

      fetchParticipantData();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (

    <ParticipantProvider>
      <DashboardLayout>
        <BackButton link="/judge_panel"/>
        {participant &&
        <ScoreDetails participant={participant} />
        }
      </DashboardLayout>
    </ParticipantProvider>
  );
};

export default Page;
