import React, {useState} from 'react';
import GuardianFieldset from '@/components/Forms/GuardianForm';
// import Link from "next/link";
import SuccessModalDialog from "@/components/utils/RegisterSuccessModal";
// import {registerContestant} from "@/actions/register";

import axios, {AxiosError} from 'axios';
import ParticipantRegFieldset from "@/components/Forms/MentorshipForm/participantReg";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import {Participant} from "@/types";

// interface Participant {
//     first_name: string;
//     last_name: string;
//     email: string;
//     age: number;
//     gender: 'M' | 'F';
//     school: string;
// }

interface ErrorMessages {
    [key: string]: string;
}

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com/register/self-register/'
  : 'http://127.0.0.1:8000/register/self-register/';

const registerContestant = async (formData: FormData) => {

    console.log(API_URL)

    // Selected Program
    const programData =  formData.get('program') as string

    // Guardian data
    const guardianData = {
        first_name: formData.get('guardian_first_name') as string,
        last_name: formData.get('guardian_last_name') as string,
        profession: formData.get('guardian_profession') as string,
        address: formData.get('guardian_address') as string,
        email: formData.get('guardian_email') as string,
        phone_number: formData.get('guardian_phone_number') as string,
    };

    // Contestants data
    const contestantsData = [];
    let i = 0;
    while (formData.has(`participant-first-name-${i}`)) {
        contestantsData.push({
            first_name: formData.get(`participant-first-name-${i}`) as string,
            last_name: formData.get(`participant-last-name-${i}`) as string,
            email: formData.get(`participant-email-${i}`) as string,
            age_at_registration: parseInt(formData.get(`participant-age-${i}`) as string, 10),
            gender: formData.get(`participant-gender-${i}`) as string,
            school_at_registration: {
                id: formData.get(`participant-school-${i}`) as string,
                name: formData.get(`participant-school-name-${i}`) as string
            },
            // payment_method: {
            //     payment_method: formData.get('payment_method') as string // Nested payment method
            // },
        });
        i++;
    }

    // Combined data for ParentCreateUpdateSerializer
    const requestData = {
        guardian: guardianData,
        participants: contestantsData,
        program: programData
    };

    // console.log('Form Submitted(Sever):', requestData);

    try {
        const response = await axios.post(API_URL, requestData);
        // console.log('SERVER RESPONSE', response.data)
        return {success: true, data: response.data};
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            return {success: false, errors: axiosError.response.data};
        } else {
            return {success: false, errors: {general: 'An unexpected error occurred.'}};
        }
    }
};

const MpRegistrationForm: React.FC = () => {
    const {selectedProgram, setSelectedProgram, setStarted} = useRegistrationData()

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submittedParticipants, setSubmittedParticipants] = useState<Participant[]>([])
    const [submittedReport, setSubmittedReport] = useState<{name:string, reason:string }[]>([])
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [errors, setErrors] = useState<ErrorMessages>({});
    console.log(errors)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const result = await registerContestant(formData)

        if (result.success) {
            console.log('CLIENT RESPONSE', result.data)
            setSubmittedParticipants(result.data.participants)
            setSubmittedReport(result.data.report)
            setIsModalOpen(true)
            setErrors({})
            form.reset();
        } else {
            const error: ErrorMessages = result.errors as ErrorMessages
            setErrors(error)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
                {/*<h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Registration Form</h2>*/}

                {/* Hidden input for selected program*/}
                <input name='program' value={selectedProgram?.id} hidden readOnly/>

                {/* Guardian Fieldset */}
                <GuardianFieldset/>

                {/* Participants Fieldset */}
                <fieldset className="border-t border-gray-300 rounded-lg p-0 pt-6 mb-8">
                    <legend className="text-xl font-semibold text-blue-700 px-2">
                        Participants Information
                    </legend>

                    <ParticipantRegFieldset />

                </fieldset>


                {/* Payment Fieldset */}
                <fieldset className="border-t border-gray-300 rounded-lg p-0 pt-6 mt-8 mb-6">
                    <legend className="text-xl font-semibold text-blue-700 px-2">
                        Payment Information
                    </legend>

                    <div className="mx-6 mb-4">
                        {/*<label className="block text-gray-700 font-medium mb-2">*/}
                        {/*    Payment Method <span className="text-sm text-red-500">*</span>*/}
                        {/*</label>*/}
                        <div className="flex items-center mb-4">
                            <input
                                type="radio"
                                name="payment_method"
                                value="mobile_money"
                                checked={paymentMethod === 'mobile_money'}
                                onChange={() => setPaymentMethod('mobile_money')}
                                className="h-4 w-4 text-blue-600 focus:ring focus:ring-blue-500"
                            />
                            <label className="ml-2">Mobile Money</label>
                        </div>
                        <div className="pl-8 mb-4">
                            <p className="text-gray-600">
                                Payment to be made to 0784 041804 (Names: Ben Wokorach) including the full name of the
                                participant. You will be contacted to receive your proof of payment receipt.
                            </p>
                        </div>
                        <div className="flex items-center mb-4">
                            <input
                                type="radio"
                                name="payment_method"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                                className="h-4 w-4 text-blue-600 focus:ring focus:ring-blue-500"
                            />
                            <label className="ml-2">Cash</label>
                        </div>
                        <div className="pl-8 mb-4">
                            <p className="text-gray-600">
                                Payment to be made at Wokober offices, located at Elephante Commons, Gulu City before
                                10th
                                May 2025.
                            </p>
                        </div>
                    </div>
                </fieldset>


                {/* Display general errors */}
                {errors.general && (
                    <p className="text-red-500 text-xs italic">{errors.general}</p>
                )}

                <div className="flex items-center justify-end gap-4">

                    {/*<Link href={`/`} className="hover:text-red-500 cursor-pointer hover:underline">Cancel</Link>*/}
                    {/* Submit Button */}
                    {/*<button*/}
                    {/*    type="submit"*/}
                    {/*    className="w-fit px-6 bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105 focus:scale-105"*/}
                    {/*>*/}
                    {/*    Register*/}
                    {/*</button>*/}
                    <button
                        onClick={()=>{ setStarted(false); setSelectedProgram(null) }}
                        className="hover:text-red-500 cursor-pointer hover:underline "
                    >
                        Cancel
                    </button>

                    <button
                        // disabled
                        type="submit"
                        className="w-fit px-6 bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105 focus:scale-105"
                    >
                        Register
                    </button>
                </div>
            </form>

             {/*Modal Component*/}
            {isModalOpen && (
                <SuccessModalDialog
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    participants={submittedParticipants}
                    program={selectedProgram?.name}
                    report={submittedReport}
                    eventLink={'app.wokober.com/register'}
                />
            )}
        </div>
    );
};

export default MpRegistrationForm;
