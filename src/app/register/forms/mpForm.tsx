// pages/register.tsx
'use client';
import Image from 'next/image';
import MpRegistrationForm from "@/components/Forms/MpRegistrationForm";

const mpForm = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Image
                src="/wokober_logo.png"
                alt="Wokober Logo"
                width={200}
                height={60}
                priority
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-yellow-300">
            MENTORSHIP PROGRAM 2025.
          </h2>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
            Participants&apos; Register
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Please fill out the form below to register for the Wokober Mentorship Programme 2025.
          </p>
        </div>
        <MpRegistrationForm />
        {/*<RegisterForm />*/}
      </div>
    </div>
  );
};

export default mpForm;