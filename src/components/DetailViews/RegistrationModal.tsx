"use client"
import React from 'react'
import {Dialog,  DialogBody, DialogTitle} from '@/components/ui/dialog';
import Image from "next/image";

import {useEnrollmentData} from "@/components/Contexts/enrollmentDataProvider";
import RegistrationActions from "@/components/Buttons/RegistrationActions";

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

function RegistrationModalDialog({isOpen, setIsOpen}: InterfaceProps){
    const {selectedEnrollment} = useEnrollmentData()
    if (!selectedEnrollment) return <div>No participant found.</div>;

    const participantMale = '/contestant_boy.jpg'
    const participantFemale = '/contestant_girl.jpg'


    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>
            </DialogTitle>
            <DialogBody>
                <>
                    <div className="">
                        <div className="flex items-end gap-3">
                            {selectedEnrollment.participant.gender === 'M' ? (
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
                            <div className="w-full">
                                <p className="text-xl font-semibold">{selectedEnrollment.participant.first_name} {selectedEnrollment.participant.last_name}</p>
                                <p className="text-md font-semibold">{`REG:${String(selectedEnrollment.id).padStart(3, '0')}`}</p>
                                <div className="flex flex-row items-end justify-between w-full gap-2">
                                    <div>
                                <p> {selectedEnrollment.age_at_registration} Years | {selectedEnrollment.participant.gender === 'M' ? 'Male' : 'Female'}</p>
                                <span className={`px-2 py-1 text-xs rounded-md font-semibold ${
                                    selectedEnrollment.status === 'paid' 
                                        ? 'bg-green-200 text-green-800' 
                                        : selectedEnrollment.status === 'cancelled' 
                                            ? 'bg-red-200 text-red-800'
                                            : 'bg-yellow-200 tebg-yellow-800'
                                }`}>
                                    {selectedEnrollment.status === 'paid' ? 'Paid' : (selectedEnrollment.status === 'cancelled' ? 'cancelled' : 'Pending payment')}
                                </span>
                                        </div>
                                <div className="">
                                    {selectedEnrollment && (<RegistrationActions registration={selectedEnrollment} />)}
                                </div>
                                    </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="space-y-2 bg-gray-100 p-3 border-l-3 border-green-200 rounded-md">
                                <p className="capitalize">
                                    <strong>School:</strong> {selectedEnrollment.school_at_registration?.toLowerCase()}</p>
                                <p>
                                    <strong>Guardian Name: </strong>{`${selectedEnrollment.guardian_at_registration?.first_name} ${selectedEnrollment.guardian_at_registration?.last_name}`}
                                </p>
                                {selectedEnrollment.guardian_at_registration && (
                                    <>
                                        <p><strong>Contact:</strong> {selectedEnrollment.guardian_at_registration.phone_number}</p>
                                        {selectedEnrollment.guardian_at_registration.email && <p><strong>Email:</strong> {selectedEnrollment.guardian_at_registration.email}</p>}
                                        {selectedEnrollment.guardian_at_registration.address && <p><strong>Address:</strong> {selectedEnrollment.guardian_at_registration.address}</p>}
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </>
            </DialogBody>
        </Dialog>
    );
}

export default RegistrationModalDialog


