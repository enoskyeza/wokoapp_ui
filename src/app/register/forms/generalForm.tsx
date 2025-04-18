'use client'
import MpRegistrationForm from "@/components/Forms/MpRegistrationForm";
import {MpDataProvider} from "@/components/Contexts/mpDataProvider";

// import dynamic from "next/dynamic";


const generalForm = () => {

    return (
        <MpDataProvider>
            <MpRegistrationForm />
        </MpDataProvider>
    )
};

export default generalForm;

