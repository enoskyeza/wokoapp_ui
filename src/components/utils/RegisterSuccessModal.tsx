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

function SuccessModalDialog({isOpen, setIsOpen, participants, report = [], program, eventLink}: InterfaceProps) {

    const {setSelectedProgram, setStarted} = useRegistrationData()

    const handleClose = () => {
        setIsOpen(false)
        setStarted(false)
        setSelectedProgram(null)
      }

    const participantNames = participants
      .map((participant) => `${participant.first_name} ${participant.last_name}`.trim())
      .filter(Boolean)

    const hasFailures = report.length > 0
    const hasSuccesses = participantNames.length > 0

    return (
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle>
                <p
                  className={`text-center text-lg font-semibold ${
                    hasFailures ? 'text-blue-600' : 'text-green-600'
                  }`}
                >
                  {hasFailures ? 'Registration Unsuccessful' : 'Successfully Registered!'}
                </p>
            </DialogTitle>
            <DialogBody>
                <div>
                    {!hasFailures && hasSuccesses && (
                      <p className="text-center mt-4 text-gray-600">
                        You have successfully registered{' '}
                        <span className="font-medium text-green-600">
                          {participantNames.join(', ')}
                        </span>
                        {program ? ` for the ${program}!` : '!'} You will receive event details one week before the event.
                      </p>
                    )}

                    {!hasFailures && !hasSuccesses && (
                      <p className="text-center mt-4 text-gray-600">
                        Registration completed successfully. You will receive event details one week before the event.
                      </p>
                    )}

                    {hasFailures && (
                      <div className="mt-4 space-y-2 text-center">
                        {hasSuccesses && (
                          <p className="text-gray-600">
                            The following participants were registered successfully:{' '}
                            <span className="font-medium text-green-600">{participantNames.join(', ')}</span>
                          </p>
                        )}
                        <p className="text-red-500 text-sm font-medium">
                          We could not complete registration for:
                        </p>
                        <ul className="space-y-1 text-sm text-red-500">
                          {report.map((item, idx) => (
                            <li key={`${item.name}-${idx}`}>
                              <span className="font-semibold text-red-600">{item.name}</span>
                              {item.reason ? ` — ${item.reason}` : ''}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-500">
                          Please review the details or contact support for assistance.
                        </p>
                      </div>
                    )}

                    {!hasFailures && (
                      <SocialSharingSection eventLink={eventLink} />
                    )}
                </div>
            </DialogBody>
            <DialogActions>
                <Button variant="ghost" onClick={handleClose}>
                    Close
                </Button>
                {/*<Button type="submit">Add</Button>*/}
            </DialogActions>
        </Dialog>
    );
}

export default SuccessModalDialog
