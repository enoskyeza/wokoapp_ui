import React from 'react';

interface Participant {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: 'M' | 'F';
    school: string;
}

interface Props {
    participant: Participant;
    index: number;
    onChange: (index: number, field: keyof Participant, value: string | number) => void;
}

const ParticipantFieldset: React.FC<Props> = ({participant, index, onChange}) => (
    <fieldset className="p-0 mb-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
                <label htmlFor={`participant-first-name-${index}`} className="block text-gray-700 font-medium mb-2">
                    First Name <span className="text-sm text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name={`participant-first-name-${index}`}
                    id={`participant-first-name-${index}`}
                    value={participant.firstName}
                    onChange={(e) => onChange(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter first name"
                    required
                />
            </div>

            {/* Last Name */}
            <div>
                <label htmlFor={`participant-last-name-${index}`} className="block text-gray-700 font-medium mb-2">
                    Last Name <span className="text-sm text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name={`participant-last-name-${index}`}
                    id={`participant-last-name-${index}`}
                    value={participant.lastName}
                    onChange={(e) => onChange(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter last name"
                    required
                />
            </div>


            {/* Email (optional) */}
            <div className="sm:col-span-2">
                <label htmlFor={`participant-email-${index}`} className="block text-gray-700 font-medium mb-2">
                    Email (Optional)
                </label>
                <input
                    type="email"
                    name={`participant-email-${index}`}
                    id={`participant-email-${index}`}
                    value={participant.email}
                    onChange={(e) => onChange(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter email (optional)"
                />
            </div>

            {/* Age */}
            <div>
                <label htmlFor={`participant-age-${index}`} className="block text-gray-700 font-medium mb-2">
                    Age <span className="text-sm text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name={`participant-age-${index}`}
                    id={`participant-age-${index}`}
                    value={participant.age}
                    onChange={(e) => onChange(index, 'age', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter age"
                    required
                />
            </div>

            {/* Gender */}
            <div>
                <label htmlFor={`participant-gender-${index}`} className="block text-gray-700 font-medium mb-2">
                    Gender <span className="text-sm text-red-500">*</span>
                </label>
                <select
                    id={`participant-gender-${index}`}
                    name={`participant-gender-${index}`}
                    value={participant.gender}
                    onChange={(e) => onChange(index, 'gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    required
                >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
            </div>

            {/* School */}
            <div className="sm:col-span-2">
                <label htmlFor={`participant-school-${index}`} className="block text-gray-700 font-medium mb-2">
                    School <span className="text-sm text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name={`participant-school-${index}`}
                    id={`participant-school-${index}`}
                    value={participant.school}
                    onChange={(e) => onChange(index, 'school', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Enter school name"
                    required
                />
            </div>


        </div>
    </fieldset>
);

export default ParticipantFieldset;
