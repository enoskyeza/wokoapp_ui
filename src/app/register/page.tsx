// pages/register.tsx
'use client';
import RegistrationForm from '@/components/Forms/RegistrationForm';
// import RegisterForm from "@/components/Forms/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Participant(s)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill out the form below to register for the Wokober Toy & Innovation Festival.
          </p>
        </div>
        <RegistrationForm />
        {/*<RegisterForm />*/}
      </div>
    </div>
  );
};

export default RegisterPage;