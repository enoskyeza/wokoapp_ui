import React from 'react';
import Image from 'next/image';

interface TicketProps {
    attendeeName: string;
    ticketNumber: string;
    qrCode: string;
}

const Ticket: React.FC<TicketProps> = ({ attendeeName, ticketNumber, qrCode }) => {
    return (
        <div className="max-w-sm mx-auto border-2 border-blue-700 rounded-lg shadow-xl p-6 bg-white print:shadow-none">
            {/* Logo Section */}
            <div className="flex justify-center mb-4">
                <Image
                    src="/theme-logo-blue.png"
                    alt="Wokober Logo"
                    width={200}
                    height={60}
                    priority
                />
            </div>

            {/* Header */}
            <div className="text-center border-b border-blue-700 pb-4 mb-4 print:border-black">
                <h1 className="text-2xl font-extrabold text-blue-700 uppercase print:text-black">
                    Wokober Toy & Innovation Festival 2024
                </h1>
                <p className="text-sm text-blue-500 mt-1 print:text-gray-700">Presented by Wokober</p>
            </div>

            {/* Event Details */}
            <div className="mb-4">
                <p className="text-sm font-medium text-blue-600 print:text-gray-700">Location:</p>
                <p className="text-lg font-bold text-blue-800 print:text-black">
                    Elephante Commons, Gulu City
                </p>

                <p className="text-sm font-medium text-blue-600 mt-2 print:text-gray-700">Dates:</p>
                <p className="text-lg font-bold text-blue-800 print:text-black">13th - 14th December</p>
            </div>

            {/* Attendee Info */}
            <div className="mb-4">
                <p className="text-sm font-medium text-blue-600 print:text-gray-700">Attendee:</p>
                <p className="text-lg font-bold text-blue-800 print:text-black">{attendeeName}</p>

                <p className="text-sm font-medium text-blue-600 mt-2 print:text-gray-700">
                    Ticket Number:
                </p>
                <p className="text-lg font-bold text-blue-800 print:text-black">{ticketNumber}</p>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center items-center">
                <div className="w-32 h-32 border-2 border-blue-700 rounded-lg flex justify-center items-center bg-white print:border-black">
                    <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 text-xs text-blue-500 print:text-gray-500">
                <p>Keep this ticket safe. Present it at the entrance.</p>
            </div>
        </div>
    );
};

export default Ticket;
