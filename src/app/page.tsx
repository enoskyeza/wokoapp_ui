import React from 'react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Main Container */}
      <div className="max-w-4xl w-full px-6 py-10 bg-white shadow-lg rounded-lg text-center">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-blue-700 mb-6">
          WOKOBER TOY & INNOVATION FESTIVAL
        </h1>

        {/* Welcome Message */}
        <p className="text-lg text-gray-700 mb-8">
          Welcome to the biggest Toy and Innovation event of the year. Whether you are a participant, staff member, or a judge, this platform will guide you through all the steps. Get ready to showcase your innovation and creativity!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <Link href="/register">
            <p className="w-full md:w-auto text-center bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:scale-105">
              Register a Participant
            </p>
          </Link>

          <Link href="/login">
            <p className="w-full md:w-auto text-center bg-gray-700 text-white py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:scale-105">
              Login as Staff
            </p>
          </Link>
        </div>

        {/* Decorative Divider */}
        <div className="my-10 border-t-2 border-dashed border-gray-300"></div>

        {/* Event Info Section */}
        <div className="text-gray-600 space-y-4">
          <p>Dates: November 25 - November 30, 2024</p>
          <p>Venue: Wokober Innovation Center</p>
          <p>Join us for workshops, exhibitions, and competitions!</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-gray-500">
        &copy; 2024 Wokober. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
