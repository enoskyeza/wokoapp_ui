"use client"

import React from 'react'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SocialSharingSection from "@/components/utils/SocialSharingSection";

interface Participant {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: 'M' | 'F';
    school: string;
}

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    participants: Participant[];
    eventLink: string;
}

function SuccessModalDialog({isOpen,setIsOpen, participants, eventLink}: InterfaceProps) {

  return (
    <Dialog open={isOpen} onClose={setIsOpen}>
      <DialogTitle>
                    <p className="text-center text-lg font-semibold text-green-600">Successfully Registered!</p>
      </DialogTitle>
        <DialogBody>
            <div>
            <p className="text-center mt-4 text-gray-600">
                You have successfully registered{' '}
                {participants.map((participant, index) => (
                    <span key={index} className="font-medium text-red-400">
                                {participant.firstName.toUpperCase()} {participant.lastName.toUpperCase()}
                        {index < participants.length - 1 && ', '}
                            </span>
                ))}{' '}
                for the Toy Making & Innovation Festival 2024! You will receive event details one week before
                the event.
            </p>
                <SocialSharingSection eventLink={eventLink} />
                </div>
        </DialogBody>
        <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
                Close
            </Button>
            {/*<Button type="submit">Add</Button>*/}
        </DialogActions>
    </Dialog>
  );
}

export default SuccessModalDialog
