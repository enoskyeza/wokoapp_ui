// pages/register.tsx
'use client';
import RegistrationForm from '@/components/Forms/RegistrationForm';
import Image from 'next/image';
// import WokoberLogo from '/wokober_logo.png'
// import RegisterForm from "@/components/Forms/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Image
                src="/wokober_logo.png"
                alt="Wokober Logo"
                width={150}
                height={60}
                priority
            />
          </div>
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

export default RegisterPage;