'use client'
import {ParticipantProvider} from "@/context/ParticipantContext";
import JudgeDashboard from "@/components/Dashboard/Judge"

// import dynamic from "next/dynamic";


const JudgePage = () => {

    return (
        <ParticipantProvider>
            <JudgeDashboard />
        </ParticipantProvider>
    )
};

export default JudgePage;

