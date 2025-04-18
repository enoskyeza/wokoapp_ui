import React from 'react';
import RegisterPage from "@/app/register/regPage";
import {RegistrationProvider} from "@/components/Contexts/regDataProvider";
// import Link from 'next/link';
// import Image from 'next/image';
// import LoginPage from "@/app/login/page";

const RegistrationLandingPage: React.FC = () => {
    return (

      <RegistrationProvider>
        <div
            style={{backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat"}}
            className="min-h-screen bg-theme-primary flex flex-col items-center justify-center"
        >
            <RegisterPage />
        </div>
      </RegistrationProvider>
    );
};

export default RegistrationLandingPage;
