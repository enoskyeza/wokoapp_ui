'use client'
import React, { useEffect, useState } from "react";
import ScoreDetails from "@/components/Score/ScoreDetails";
import { ParticipantProvider } from "@/context/ParticipantContext";
import DashboardLayout from '@/components/Layouts/Dashboard';
import { useParams } from "next/navigation";
import { API_URL } from "@/config";
import BackButton from "@/components/Buttons/BackButton";

interface PageProps {
  params: {
    id: string; // ID of the participant passed as a parameter
  };
}

const Page: React.FC<PageProps> = () => {

  const params = useParams();
  const id = params?.id;

  // State to store the fetched participant data
  const [participant, setParticipant] = useState<any>(null);
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
          setError('Failed to fetch participant data');
        } finally {
          setLoading(false);
        }
      };

      fetchParticipantData();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (

    <ParticipantProvider>
      <DashboardLayout>
        <BackButton link="/judge_panel"/>
        <ScoreDetails participant={participant} />
      </DashboardLayout>
    </ParticipantProvider>
  );
};

export default Page;
