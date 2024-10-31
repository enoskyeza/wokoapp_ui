'use client'
import { useEffect, useState } from "react";
import { Participant } from "@/types";

import DashboardLayout from '@/components/Layouts/Dashboard';
import DashboardStats from '@/components/Dashboard/Stats';
import Contestants from "@/components/Tables/Contestants";

import dynamic from "next/dynamic";

const AgeCategoryChart = dynamic(() => import("@/components/Dashboard/CategoryPieChart"), {
    ssr: false,
});

const DashboardPage = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [stats, setStats] = useState<{total:number; paid:number; unpaid:number}>({total:0, paid:0,unpaid:0});
    const [ageCategoryStats, setAgeCategoryStats] = useState<{total:number; junior:number; intermediate:number, senior:number}>({total:0, junior:0, intermediate:0, senior:0,});

    // const devUrl = "http://127.0.0.1:8000/register/contestants/"
    const prodUrl = "https://kyeza.pythonanywhere.com/register/contestants/"


    useEffect(() => {
        const fetchParticipants = async () => {
            const res = await fetch(prodUrl);
            const data = await res.json();
            setParticipants(data);
        };
        fetchParticipants();
    }, []);

    useEffect(() => {
        if ((Array.isArray(participants) && participants.length > 0)) {
            const total = participants.length;
            const paid = (participants.filter((participant) => participant.payment_status === "paid" )).length;
            const unpaid = total - paid
            const junior = (participants.filter((participant) => participant.age_category === "junior" )).length;
            const intermediate = (participants.filter((participant) => participant.age_category === "intermediate" )).length;
            const senior = (participants.filter((participant) => participant.age_category === "senior" )).length;

            setStats(prevState => (
                {...prevState,
                    total: total,
                    paid:paid,
                    unpaid:unpaid
                })
            );

            setAgeCategoryStats(prevState => (
                {...prevState,
                    total:total,
                    junior:junior,
                    intermediate:intermediate,
                    senior:senior,
                }
            ))
        }
    }, [participants])


    return (
        <DashboardLayout>
            {/* Statistics Cards */}
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <AgeCategoryChart stats={ageCategoryStats} />
            </div>

            {/* Participants Table */}
            <Contestants participants={participants} />
        </DashboardLayout>
    )
};

export default DashboardPage;