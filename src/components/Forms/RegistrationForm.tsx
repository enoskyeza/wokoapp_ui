import React, {useState} from 'react';
import GuardianFieldset from '@/components/Forms/GuardianForm';
import ParticipantFieldset from '@/components/Forms/ParticipantForm';

interface Participant {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: 'M' | 'F';
    school: string;
}

const RegistrationForm: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>([{
        firstName: '',
        lastName: '',
        email: '',
        age: 1,
        gender: 'M',
        school: ''
    }]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [errors, setErrors] = useState<{ paymentMethod?: string }>({});

    const addParticipant = () => {
        setParticipants([...participants, {
            firstName: '',
            lastName: '',
            email: '',
            age: 1,
            gender: 'M',
            school: ''
        }]);
    };


    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const handleParticipantChange = (
        index: number,
        field: keyof Participant,
        value: string | number
    ) => {
        setParticipants((prevContestants) =>
            prevContestants.map((contestant, i) =>
                i === index ? {...contestant, [field]: value} : contestant,
            ),
        );
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const newErrors: { paymentMethod?: string } = {};

        // Validate payment method
        if (!paymentMethod) {
            newErrors.paymentMethod = 'Please select a payment method.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Process the registration (send data to the backend)
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({participants, paymentMethod}), // Add other form data here
                });

                if (response.ok) {
                    // Successful registration - handle redirect or message
                    console.log('Registration successful!');
                } else {
                    // Handle registration error
                    const data = await response.json();
                    console.error('Registration failed:', data.message);
                }
            } catch (error) {
                console.error('An error occurred during registration:', error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/*<h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Registration Form</h2>*/}

            {/* Guardian Fieldset */}
            <GuardianFieldset/>

            {/* Participants Fieldset */}
            <fieldset className="border border-gray-300 rounded-lg p-6 mb-6">
                <legend className="text-xl font-semibold text-blue-700 px-2">
                    Participants Information
                </legend>

                {/* Note about participants */}
                <p className="text-sm text-gray-600 mb-4">
                    Note: All added participants should be under the same guardian.
                </p>

                {participants.map((participant, index) => (
                    <div key={index} className="relative mb-4">
                        <ParticipantFieldset
                            key={index}
                            participant={participant}
                            index={index}
                            onChange={handleParticipantChange}
                        />
                        {participants.length > 1 &&
                            (<button
                                type="button"
                                onClick={() => removeParticipant(index)}
                                className="absolute top-1.5 right-2.5 text-red-500 text-xs underline"
                            >
                                Remove
                            </button>)
                        }
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addParticipant}
                    className="px-4 mt-4 w-fit bg-green-500 text-white py-2 rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105 focus:scale-105"
                >
                    Add Another Participant
                </button>
            </fieldset>

            {/* Payment Fieldset */}
            <fieldset className="border border-gray-300 rounded-lg p-6 mb-6">
                <legend className="text-xl font-semibold text-blue-700 px-2">
                    Payment Information
                </legend>

                <div className="mb-4">
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
                            Payment to be made at Wokober offices, located at Elephante Commons, Gulu City before 10th
                            December 2024.
                        </p>
                    </div>
                    {errors.paymentMethod && (
                        <p className="text-red-500 text-xs italic">{errors.paymentMethod}</p>
                    )}
                </div>
            </fieldset>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105 focus:scale-105"
            >
                Register
            </button>
        </form>
    );
};

export default RegistrationForm;
