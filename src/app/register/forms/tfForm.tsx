// pages/register.tsx
'use client';
import RegistrationForm from '@/components/Forms/RegistrationForm';
import Image from 'next/image';

const tfForm = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Image
                src="/theme-logo.png"
                alt="Wokober Logo"
                width={200}
                height={60}
                priority
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-yellow-300">
            Nurturing My Child&apos;s Creativity, Their Limitless Future.
          </h2>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
            Participants&apos; Register
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Please fill out the form below to register for the Wokober Toy & Innovation Festival.
          </p>
        </div>
        <RegistrationForm/>
        {/*<RegisterForm />*/}
      </div>
    </div>
  );
};

export default tfForm;