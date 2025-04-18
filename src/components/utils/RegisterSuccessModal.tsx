"use client"

import React from 'react'
import {Dialog, DialogActions, DialogBody, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {FormParticipant} from "@/types";
import SocialSharingSection from "@/components/utils/SocialSharingSection";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";

// interface Participant {
//     first_name: string;
//     last_name: string;
//     email: string;
//     age: number;
//     gender: 'M' | 'F';
//     school: string;
// }
interface ReportItem {
  name: string;
  reason: string;
}

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participants: FormParticipant[];
    report?: ReportItem[];
    eventLink: string;
    program?: string

}

function SuccessModalDialog({isOpen, setIsOpen, participants, report=[], program, eventLink}: InterfaceProps) {

    const {setSelectedProgram, setStarted} = useRegistrationData()

    const handleClose = () => {
        setIsOpen(false)
        setStarted(false)
        setSelectedProgram(null)
      }

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>
                <p className="text-center text-lg font-semibold text-green-600">Successfully Registered!</p>
            </DialogTitle>
            <DialogBody>
                <div>
                    <p className="text-center mt-4 text-gray-600">
                        You have successfully registered{' '}
                        {participants.map((participant, index) => (
                            <span key={index} className="font-medium text-red-400">
                                {participant.first_name.toUpperCase()} {participant.last_name.toUpperCase()}
                                {index < participants.length - 1 && ', '}
                            </span>
                        ))}{' '}
                        for the {`${program ? program : ''}`}! You will receive event details one week before
                        the event.
                    </p>

                    {report.length > 0 && (
                        <p className="mt-2 text-center text-red-400 text-sm italic">
                            Skipped registration of{' '}
                            {report.map((item, idx) => (
                                <span key={idx} className="font-medium text-blue-800">
                                    {item.name.toUpperCase()}
                                    {idx < report.length - 1 ? ', ' : ''}
                </span>
                            ))}{' '}
                            because they are already registered. Contact us for more details.
                        </p>
                    )}
                    <SocialSharingSection eventLink={eventLink}/>
                </div>
            </DialogBody>
            <DialogActions>
                <Button plain onClick={handleClose}>
                    Close
                </Button>
                {/*<Button type="submit">Add</Button>*/}
            </DialogActions>
        </Dialog>
    );
}

export default SuccessModalDialog
