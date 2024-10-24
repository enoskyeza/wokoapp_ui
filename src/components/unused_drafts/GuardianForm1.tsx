'use client';
import React from 'react';

interface Guardian {
  firstName: string;
  lastName: string;
  profession: string;
  address: string;
  email: string;
  phoneNumber: string;
}

interface Props {
  guardian: Guardian;
  onChange: (field: keyof Guardian, value: string) => void;
}

const GuardianFieldset: React.FC<Props> = ({ guardian, onChange }) => (
  <fieldset className="mb-6 border border-gray-300 rounded-md p-4">
    <legend className="text-lg font-medium leading-6 text-gray-900">Guardian Information</legend>
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="guardian-first-name" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name="guardian-first-name"
          id="guardian-first-name"
          value={guardian.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="guardian-last-name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name="guardian-last-name"
          id="guardian-last-name"
          value={guardian.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="guardian-profession" className="block text-sm font-medium text-gray-700">
          Profession
        </label>
        <input
          type="text"
          name="guardian-profession"
          id="guardian-profession"
          value={guardian.profession}
          onChange={(e) => onChange('profession', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="guardian-address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          name="guardian-address"
          id="guardian-address"
          value={guardian.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="guardian-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="guardian-email"
          id="guardian-email"
          value={guardian.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="guardian-phone-number" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          name="guardian-phone-number"
          id="guardian-phone-number"
          value={guardian.phoneNumber}
          onChange={(e) => onChange('phoneNumber', e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </div>
  </fieldset>
);

export default GuardianFieldset;