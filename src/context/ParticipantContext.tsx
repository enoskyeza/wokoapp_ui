import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import {Participant, Parent} from "@/types";
import axios, {AxiosError} from 'axios';
// import {approvePayment} from "@/actions/approvePayment";

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com'
  : 'http://127.0.0.1:8000';

const approvePayment = async (registrationId: number) => {
    // Update registration status instead of old contestant endpoint
    const url = `${API_BASE_URL}/register/registrations/${registrationId}/`

    const requestData = {
        status: "paid"  // Changed from payment_status to status
    };

    try {
        const response = await axios.patch(url, requestData);
        return {success: true, data: response.data};
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            return {success: false, errors: axiosError.response.data};
        } else {
            return {success: false, errors: {general: 'An unexpected error occurred.'}};
        }
    }
};

interface Stats {
    total: number;
    paid: number;
    unpaid: number
}

interface AgeCategoryStats {
    total: number;
    junior: number;
    intermediate: number;
    senior: number;
}

interface ApprovePaymentResponse {
    success: boolean;
    errors?: unknown; // Replace 'unknown' with a more specific type if possible
}

interface ParticipantContextType {
    participants: Participant[];
    parents: Parent[];
    stats: Stats;
    ageCategoryStats: AgeCategoryStats;
    getParticipantDetailsById: (id: number) => { participant: Participant | undefined; parent: Parent | undefined };
    handleApprovePayment: (participantId: number) => Promise<ApprovePaymentResponse>;
    fetchParticipants: () => Promise<void>;
}

// // 1. Create the context
// const ParticipantContext = createContext();

// Create the context with the defined type
const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

// 2. Create a provider component
export const ParticipantProvider = ({children}: { children: ReactNode }) => {
    const [parents, setParents] = useState<Parent[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [stats, setStats] = useState<Stats>({total: 0, paid: 0, unpaid: 0});
    const [ageCategoryStats, setAgeCategoryStats] = useState<{
        total: number;
        junior: number;
        intermediate: number,
        senior: number
    }>({total: 0, junior: 0, intermediate: 0, senior: 0,});

    // Fetch data initially
    const fetchParticipants = async () => {
        try {
            const res = await fetch('/api/contestants');
            const data = await res.json();
            setParticipants(data.contestants);
            setParents(data.parents);
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };


    useEffect(() => {
        fetchParticipants();
    }, []);

    // Update stats
    useEffect(() => {
        if ((Array.isArray(participants) && participants.length > 0)) {
            const total = participants.length;
            const paid = (participants.filter((participant) => participant.payment_status === "paid")).length;
            const unpaid = total - paid
            const junior = (participants.filter((participant) => participant.age_category === "junior")).length;
            const intermediate = (participants.filter((participant) => participant.age_category === "intermediate")).length;
            const senior = (participants.filter((participant) => participant.age_category === "senior")).length;

            setStats(prevState => (
                {
                    ...prevState,
                    total: total,
                    paid: paid,
                    unpaid: unpaid
                })
            );

            setAgeCategoryStats(prevState => (
                {
                    ...prevState,
                    total: total,
                    junior: junior,
                    intermediate: intermediate,
                    senior: senior,
                }
            ))
        }
    }, [participants])

    // Define the filter function
    const getParticipantDetailsById = (id: number) => {
        const participant: Participant = participants.find(p => p.id === id) as Participant;
        const parent: Parent = parents.find(p => p.id === participant?.parent) as Parent;
        return {participant, parent};
    };


    const handleApprovePayment = async (participantId: number) => {
        const res = await approvePayment(participantId)

        if (res.success) {
            setParticipants(prevParticipants =>
                prevParticipants.map(participant =>
                    participant.id === participantId ? {...participant, payment_status: 'paid'} : participant
                )
            );
        }

        return res;
    }

    return (
        <ParticipantContext.Provider value={{
            participants,
            parents,
            stats,
            ageCategoryStats,
            fetchParticipants,
            getParticipantDetailsById,
            handleApprovePayment
        }}>
            {children}
        </ParticipantContext.Provider>
    );
};

// Custom hook for consuming context
export const useParticipantContext = (): ParticipantContextType => {
    const context = useContext(ParticipantContext);
    if (!context) throw new Error("useParticipantContext must be used within a ParticipantProvider");
    return context;
};
