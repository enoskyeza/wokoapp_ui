'use client';
import React from 'react';

// Assuming these types are defined elsewhere in your project
// You might want to create a separate file for types
interface Contestant {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: 'M' | 'F';
  school: string;
}

interface Props {
  contestant: Contestant;
  index: number;
  onChange: (index: number, field: keyof Contestant, value: string | number) => void;
}

const ContestantFieldset: React.FC<Props> = ({ contestant, index, onChange }) => (
  <fieldset className="mb-6 bg-white border border-gray-300 rounded-md p-4">
    <legend className="text-lg font-medium leading-6 text-gray-900">Contestant Information</legend>
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor={`contestant-first-name-${index}`} className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name={`contestant-first-name-${index}`}
          id={`contestant-first-name-${index}`}
          value={contestant.firstName}
          onChange={(e) => onChange(index, 'firstName', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor={`contestant-last-name-${index}`} className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name={`contestant-last-name-${index}`}
          id={`contestant-last-name-${index}`}
          value={contestant.lastName}
          onChange={(e) => onChange(index, 'lastName', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`contestant-email-${index}`} className="block text-sm font-medium text-gray-700">
          Email (Optional)
        </label>
        <input
          type="email"
          name={`contestant-email-${index}`}
          id={`contestant-email-${index}`}
          value={contestant.email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor={`contestant-age-${index}`} className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          name={`contestant-age-${index}`}
          id={`contestant-age-${index}`}
          value={contestant.age}
          onChange={(e) => onChange(index, 'age', parseInt(e.target.value, 10))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor={`contestant-gender-${index}`} className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id={`contestant-gender-${index}`}
          name={`contestant-gender-${index}`}
          value={contestant.gender}
          onChange={(e) => onChange(index, 'gender', e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`contestant-school-${index}`} className="block text-sm font-medium text-gray-700">
          School
        </label>
        <input
          type="text"
          name={`contestant-school-${index}`}
          id={`contestant-school-${index}`}
          value={contestant.school}
          onChange={(e) => onChange(index, 'school', e.target.value)}
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3"
        />
      </div>
    </div>
  </fieldset>
);

export default ContestantFieldset;