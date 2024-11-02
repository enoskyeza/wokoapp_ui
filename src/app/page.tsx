import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage: React.FC = () => {
    return (
        <div
            style={{backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat"}}
            className="min-h-screen bg-theme-primary flex flex-col items-center justify-center"
        >


            {/* Main Container */}
            <div className="max-w-4xl w-full px-6 py-10 bg-none md:shadow-lg md:rounded-lg text-center">
                {/* Logo Section */}
                <div className="flex justify-center mb-12">
                    <Image src="/theme-logo.png" alt="Theme Logo" width={320} height={100} className="object-contain"/>
                </div>

                {/* Title Section */}
                <h1 className="text-4xl font-bold text-white text-center mb-12">
                    WOKOBER <br/> <span className="text-yellow-300">TOY & INNOVATION</span> FESTIVAL 2024
                </h1>

                {/* Welcome Message */}
                <p className="text-lg text-white text-center max-w-xl mb-8 mx-auto">
                    The biggest <span className="text-yellow-500 font-semibold">Toy and Innovation</span> event of the
                    year.
                    Happening on <span className="text-yellow-500 font-semibold">13th-14th, Dec</span> at <span
                    className="text-yellow-500 font-semibold">Elephante Commons, Gulu City.</span>
                </p>
                <p className="text-lg text-white text-center max-w-xl mb-8 mx-auto">
                    Registration fee for participants: <span className="text-yellow-500 font-semibold">20,000UGX</span>
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
                    <Link href="/register">
                        <p className="w-full md:w-auto text-center bg-yellow-300 text-black py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:scale-105">
                            Register a Participant
                        </p>
                    </Link>

                    <Link href="/login">
                        <p className="w-full md:w-auto text-center bg-blue-400 text-white py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:scale-105">
                            Login as Staff
                        </p>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
