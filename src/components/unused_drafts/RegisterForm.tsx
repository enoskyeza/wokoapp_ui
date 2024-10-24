'use client';
import React, { useState } from 'react';
// import GuardianFieldset from './GuardianForm';
import ContestantFieldset from './ContestantForm';

interface Contestant {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: 'M' | 'F';
  school: string;
}

// interface Guardian {
//   firstName: string;
//   lastName: string;
//   profession: string;
//   address: string;
//   email: string;
//   phoneNumber: string;
// }

const RegistrationForm: React.FC = () => {
  const [contestants, setContestants] = useState<Contestant[]>([
    { firstName: '', lastName: '', email: '', age: 0, gender: 'M', school: '' },
  ]);
  // const [guardian, setGuardian] = useState<Guardian>({
  //   firstName: '',
  //   lastName: '',
  //   profession: '',
  //   address: '',
  //   email: '',
  //   phoneNumber: '',
  // });
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'cash'>('Mobile Money');

  const handleAddContestant = () => {
    setContestants([
      ...contestants,
      { firstName: '', lastName: '', email: '', age: 0, gender: 'M', school: '' },
    ]);
  };

  // const handleRemoveContestant = (index: number) => {
  //   setContestants(contestants.filter((_, i) => i !== index));
  // };

  const handleContestantChange = (
    index: number,
    field: keyof Contestant,
    value: string | number
  ) => {
    setContestants((prevContestants) =>
      prevContestants.map((contestant, i) =>
        i === index ? { ...contestant, [field]: value } : contestant,
      ),
    );
  };

  // const handleGuardianChange = (field: keyof Guardian, value: string) => {
  //   setGuardian((prevGuardian) => ({ ...prevGuardian, [field]: value }));
  // };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic frontend validation (you should add more robust validation)
    if (contestants.some((c) => !c.firstName || !c.lastName || !c.age || !c.school)) {
      alert('Please fill in all required fields for each contestant.');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contestants, paymentMethod }), // Include paymentMethod
      });

      if (response.ok) {
        // Registration successful - handle redirect or display success message
        console.log('Registration successful!');
        // You might want to redirect to a success page or show a confirmation message
      } else {
        // Handle registration error (e.g., display error message from API)
        const data = await response.json();
        console.error('Registration failed:', data.message);
        // Consider setting an error state to display the message to the user
      }
    } catch (error) {
      console.error('An error occurred during registration:', error);
      // Handle unexpected errors
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Guardian Fieldset */}
      {/*<GuardianFieldset guardian={guardian} onChange={handleGuardianChange} />*/}

      {/* Contestant Fieldsets */}
      {contestants.map((contestant, index) => (
        <ContestantFieldset
          key={index}
          contestant={contestant}
          index={index}
          onChange={handleContestantChange}
        />
      ))}

      {/* Add Contestant Button */}
      <button
        type="button"
        onClick={handleAddContestant}
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Contestant
      </button>

      {/* Payment Method Fieldset */}
      <fieldset className="border border-gray-300 rounded-md p-4">
        <legend className="text-lg font-medium leading-6 text-gray-900">Payment Method</legend>
        <div className="mt-4 space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment_method"
              value="Mobile Money"
              checked={paymentMethod === 'Mobile Money'}
              onChange={() => setPaymentMethod('Mobile Money')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="block text-sm font-medium text-gray-700">
              <p>
                **Mobile Money:** Payment to be made to 0784 041804 (Names: Ben Wokorach) including
                full name of Participant. You will be contacted to receive your proof of payment
                receipt.
              </p>
            </span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment_method"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="block text-sm font-medium text-gray-700">
              <p>
                **Cash:** Payment to be made at Wokober offices, located at Elephante Commons, Gulu
                City before 10th December, 2024.
              </p>
            </span>
          </label>
        </div>
      </fieldset>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Register
      </button>
    </form>
  );
};

export default RegistrationForm;