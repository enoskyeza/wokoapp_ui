"use client"
import React, {useState, useEffect} from 'react'
import {Dialog, DialogActions, DialogBody, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import Image from "next/image";
import participantMale from '/public/contestant_boy.jpg';
import participantFemale from '/public/contestant_girl.jpg';

// import { API_URL } from '@/config';

// import ReactDOMServer from 'react-dom/server';
// import Ticket from './Ticket';
import {useEnrollmentData} from "@/components/Contexts/enrollmentDataProvider";

type InterfaceProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

function RegistrationModalDialog({isOpen, setIsOpen}: InterfaceProps) {
    const [processing, setProcessing] = useState<boolean>(false);
    // const [ticketing, setTicketing] = useState<boolean>(false);
    const {selectedEnrollment} = useEnrollmentData()

    const [userRole, setUserRole] = useState<string | null>(null);

    // Fetch user role from cookies
    useEffect(() => {
        const cookieData = document.cookie
            .split("; ")
            .find((row) => row.startsWith("userData="));
        if (cookieData) {
            const user = JSON.parse(decodeURIComponent(cookieData.split("=")[1]));
            setUserRole(user.role || null);
        }
    }, []);

    if (!selectedEnrollment) return <div>No participant found.</div>;

    const handleApproval = async () => {
        setProcessing(true); // Disable further actions

        // Call the global approvePayment function
        // await handleApprovePayment(selectedEnrollment.id);
        console.log('procecing approval...')

        // Wait for 2 seconds (simulate processing time)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // setProcessing(false); // Re-enable actions after processing
    };

    // const handleTicketing = async () => {
    //     setTicketing(true);
    //
    //     try {
    //         // Fetch the ticket details
    //         const response = await fetch(`${API_URL}register/tickets/`);
    //         // const tickets = await response.json();
    //         const tickets: { participant: number; qr_code: string }[] = await response.json();
    //
    //
    //         const ticket = tickets.find((t) => t.participant === participantId);
    //
    //         if (!ticket) {
    //             alert('Ticket not found for this participant.');
    //             return;
    //         }
    //
    //         // Render the Ticket component to a string
    //         const ticketHTML = ReactDOMServer.renderToString(
    //             <Ticket
    //                 attendeeName={`${participant.first_name} ${participant.last_name}`}
    //                 ticketNumber={participant.identifier}
    //                 qrCode={ticket.qr_code}
    //             />
    //         );
    //
    //         // Add a wrapper HTML document for printing
    //         const printContent = `
    //             <html>
    //             <head>
    //                 <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    //                 <style>
    //                     @media print {
    //                         body {
    //                             margin: 40;
    //                             padding: 0;
    //                         }
    //                         @page {
    //                             margin: 0;
    //                         }
    //                     }
    //                 </style>
    //             </head>
    //             <body>
    //                 ${ticketHTML}
    //             </body>
    //             </html>
    //         `;
    //
    //         // Open a new window and print
    //         const printWindow = window.open('', '_blank');
    //         if (printWindow) {
    //             printWindow.document.write(printContent);
    //             printWindow.document.close();
    //
    //             // Wait for the content to load before printing
    //             printWindow.onload = () => {
    //                 printWindow.focus();
    //                 printWindow.print();
    //                 printWindow.close();
    //             };
    //         }
    //     } catch (error) {
    //         console.error('Error generating ticket:', error);
    //         alert('An error occurred while generating the ticket.');
    //     }
    // };
    //

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
                            <div className="">
                                <p className="text-xl font-semibold">{selectedEnrollment.participant.first_name} {selectedEnrollment.participant.last_name}</p>
                                <p className="text-md font-semibold">{`REG:${String(selectedEnrollment.id).padStart(3, '0')}`}</p>
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
            <DialogActions>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    {(selectedEnrollment.status !== 'paid' && selectedEnrollment.status !== 'cancelled') &&
                        userRole === 'admin' && (
                            <div className="flex flex-wrap justify-center gap-3">

                            <button
                                className={`sm:w-auto text-white font-semibold text-md px-4 py-2 rounded-md
                                            shadow-md hover:bg-green-700 transition-colors ${processing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'}`}
                                disabled={processing}
                                onClick={handleApproval}
                            >
                                {processing ? 'Processing...' : 'Approve Payment'}
                            </button>

                            <button
                                className={`sm:w-auto text-white font-semibold text-md px-4 py-2 rounded-md
                                            shadow-md hover:bg-red-700 transition-colors ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600'}`}
                                disabled={processing}
                                onClick={handleApproval}
                            >
                                {processing ? 'Processing...' : 'Cancel Registration'}
                            </button>

                            </div>
                    )}

                    {selectedEnrollment.status === 'paid' && (

                        // Dropdown button with "Actions" and options [Download Receipt, PrintReceipt, DownloadTicket, print Ticket]
                        <div>
                            <button
                            className={`sm:w-auto text-white font-semibold text-md px-4 py-2 rounded-md
                                        shadow-md hover:bg-purple-700 transition-colors `}
                                        // ${ticketing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600'}`}
                            // disabled={processing}
                            // onClick={handleTicketing}
                        >
                            {'Download Ticket'}
                        </button>

                        {/*<button*/}
                        {/*    className={`sm:w-auto text-white font-semibold text-md px-4 py-2 rounded-md*/}
                        {/*                shadow-md hover:bg-purple-700 transition-colors ${ticketing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600'}`}*/}
                        {/*    // disabled={processing}*/}
                        {/*    // onClick={handleTicketing}*/}
                        {/*>*/}
                        {/*    {ticketing ? 'Downloading...' : 'Download Ticket'}*/}
                        {/*</button>*/}
                        </div>
                    )}
                </div>
                {/*<Button type="submit">Add</Button>*/}
            </DialogActions>
        </Dialog>
    );
}

export default RegistrationModalDialog





// const handleTicketing = async () => {
//     console.log("Ticket print triggered")
//     setTicketing(true); // Disable further actions

//     try {
//         // Fetch the ticket details for the participant
//         const response = await fetch(`http://127.0.0.1:8000/register/tickets/`);
//         const tickets = await response.json();

//         console.log(participantId,tickets)
//         // Find the ticket for the current participant
//         const ticket = tickets.find((t: any) => t.participant === participantId);

//         if (!ticket) {
//             alert('Ticket not found for this participant.');
//             setTicketing(false);
//             return;
//         }


//         // Dynamically create printable content
//         const printContent = `
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         margin: 20px;
//                     }
//                     .ticket {
//                         border: 2px solid #000;
//                         padding: 20px;
//                         width: 300px;
//                         text-align: center;
//                     }
//                     .qr-code {
//                         margin-top: 10px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="ticket">
//                     <h2>Event Ticket</h2>
//                     <p><strong>Name:</strong> ${participant.first_name} ${participant.last_name}</p>
//                     <p><strong>Ticket Number:</strong> ${participant.identifier}</p>
//                     <img class="qr-code" src="${ticket.qr_code}" alt="${ticket.qr_code}" width="200" />
//                 </div>
//             </body>
//             </html>
//         `;

//         // Open a new window and print
//         const printWindow = window.open('', '_blank');
//         if (printWindow) {
//             printWindow.document.write(printContent);
//             printWindow.document.close();
//             printWindow.focus();
//             printWindow.print();
//             printWindow.close();
//         }
//     } catch (error) {
//         console.error('Error fetching or printing ticket:', error);
//         alert('An error occurred while generating the ticket.');
//     } finally {
//         setTicketing(false);
//     }
// };