"use client"
import React, {useState} from 'react'
import {Dialog, DialogActions, DialogBody, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import Image from "next/image";
import participantMale from '/public/contestant_boy.jpg';
import participantFemale from '/public/contestant_girl.jpg';
import {useParticipantContext} from "@/context/ParticipantContext";

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participantId: number;
}

function ParticipantModalDialog({isOpen, setIsOpen, participantId}: InterfaceProps) {
    const [processing, setProcessing] = useState<boolean>(false);
    const {getParticipantDetailsById, handleApprovePayment} = useParticipantContext();
    const {participant, parent} = getParticipantDetailsById(participantId);

    if (!participant) return <div>No participant found.</div>;

    const handleApproval = async () => {
        setProcessing(true); // Disable further actions
        console.log("Approving payment for", participantId);

        // Call the global approvePayment function
        await handleApprovePayment(participantId);

        // Wait for 2 seconds (simulate processing time)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // setProcessing(false); // Re-enable actions after processing
    };

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>
            </DialogTitle>
            <DialogBody>
                <>
                    <div className="">
                        <div className="flex items-end gap-3">
                            {participant.gender === 'M' ? (
                                <Image
                                    src={participantMale}
                                    alt="participant"
                                    className="rounded-md shadow-md object-cover"
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <Image
                                    src={participantFemale}
                                    alt="participant"
                                    className="rounded-md shadow-md object-cover"
                                    width={100}
                                    height={100}
                                />
                            )}
                            <div className="">
                                <p className="text-xl font-semibold">{participant.first_name} {participant.last_name}</p>
                                <p className="text-md font-semibold">{participant.identifier}</p>
                                <p> {participant.age} Years | {participant.gender === 'M' ? 'Male' : 'Female'}</p>
                                <span className={`px-2 py-1 text-xs rounded-md font-semibold ${
                                    participant.payment_status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                }`}>
                                    {participant.payment_status === 'paid' ? 'Paid' : 'Pending payment'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="space-y-2 bg-gray-100 p-3 border-l-3 border-green-200 rounded-md">
                                <p><strong>School:</strong> {participant.school}</p>
                                <p className="">
                                    <strong>Guardian Name: </strong>{participant.parent_name}
                                </p>
                                {parent && (
                                    <>
                                        <p><strong>Contact:</strong> {parent.phone_number}</p>
                                        {parent.email && <p><strong>Email:</strong> {parent.email}</p>}
                                        {parent.address && <p><strong>Address:</strong> {parent.address}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            </DialogBody>
            <DialogActions>
                <div className="flex justify-center gap-3">
                    <Button onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    {participant.payment_status === 'not_paid' && (
                        <button
                            className={`sm:w-auto text-white font-semibold text-md px-4 py-2 rounded-md 
                                        shadow-md hover:bg-green-700 transition-colors ${processing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'}`}
                            disabled={processing}
                            onClick={handleApproval}
                        >
                            {processing ? 'Processing...' : 'Approve Payment'}
                        </button>
                    )}
                </div>
                {/*<Button type="submit">Add</Button>*/}
            </DialogActions>
        </Dialog>
    );
}

export default ParticipantModalDialog
