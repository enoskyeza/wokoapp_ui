// components/ContestantDetails.tsx
'use client';
import React from 'react';

interface Contestant {
    firstName: string;
    lastName: string;
    id: string;
    age: number;
    gender: 'M' | 'F';
    school: string;
    paymentStatus: 'PAID' | 'NOT_PAID';
    parent: {
        firstName: string;
        lastName: string;
        profession: string;
        address: string;
        email: string;
        phoneNumber: string;
    };
}



const ContestantDetails = () => {

    const contestant:Contestant = {
        id: 'TF23001',
        firstName: 'Jane',
        lastName: 'Doe',
        age: 12,
        school: 'Bright Future Academy',
        gender: 'F',
        paymentStatus: 'NOT_PAID',
        parent: {
            firstName: 'John',
            lastName: 'Doe',
            profession: 'Engineer',
            email: 'jondoe@example.com',
            phoneNumber: '+256 755 678901',
            address: 'Gulu City, Uganda',
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Card */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contestant Details</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Section - Image */}
                    <div className="w-full md:w-1/3">
                        <img src="/contestant.jpg" alt="Contestant" className="rounded-lg"/>
                    </div>

                    {/* Right Section - Details */}
                    <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name:</label>
                                <p className="text-lg text-gray-900">
                                    {contestant.firstName} {contestant.lastName}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID No:</label>
                                <p className="text-lg text-gray-900">{contestant.id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Age:</label>
                                <p className="text-lg text-gray-900">{contestant.age}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">School:</label>
                                <p className="text-lg text-gray-900">{contestant.school}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender:</label>
                                <p className="text-lg text-gray-900">{contestant.gender}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Status:</label>
                                <p className="text-lg text-gray-900">
                  <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contestant.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {contestant.paymentStatus}
                  </span>
                                </p>
                            </div>
                        </div>

                        {/* Approve Payment Button (if not paid) */}
                        {contestant.paymentStatus === 'NOT_PAID' && (
                            <button
                                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Approve Payment
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lower Cards */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Lower Left Card - Parent Details */}
                <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Parent Details</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name:</label>
                            <p className="text-lg text-gray-900">
                                {contestant.parent.firstName} {contestant.parent.lastName}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profession:</label>
                            <p className="text-lg text-gray-900">{contestant.parent.profession}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address:</label>
                            <p className="text-lg text-gray-900">{contestant.parent.address}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email:</label>
                            <p className="text-lg text-gray-900">{contestant.parent.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number:</label>
                            <p className="text-lg text-gray-900">{contestant.parent.phoneNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Lower Right Card - Toy Gallery */}
                <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Toy Gallery</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Sample toy images */}
                        {Array.from({length: 6}).map((_, index) => (
                            <img
                                key={index}
                                src={`/toy-${index + 1}.jpg`} // Replace with actual toy image paths
                                alt={`Toy ${index + 1}`}
                                className="rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestantDetails;