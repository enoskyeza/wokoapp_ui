'use client'

import React, {useState, ChangeEvent} from 'react';
import {TrashIcon} from "@heroicons/react/20/solid";
import SearchSelectInput from "@/components/menus/searchSelect";
import {School} from "@/types";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";

interface Student {
    firstName: string;
    lastName: string;
    age: number;
    gender: 'M' | 'F';
    guardianName: string;
    contact: string;
    schoolQuery: string;
    selectedSchool: School | null;
}

const ParticipantRegFieldset: React.FC = () => {
    const {schools: allSchools} = useRegistrationData();

    const emptyStudent: Student = {
        firstName: '',
        lastName: '',
        age: 0,
        gender: 'M',
        guardianName: '',
        contact: '',
        schoolQuery: '',
        selectedSchool: null
    };

    const [students, setStudents] = useState<Student[]>([emptyStudent]);

    const handleChange = (
        index: number,
        field: keyof Student,
        value: string | number | School | null
    ) => {
        setStudents(prev => {
            const copy = [...prev];
            copy[index] = {...copy[index], [field]: value} as Student;
            return copy;
        });
    };

    const addStudent = () => {
        setStudents(prev => [...prev, {...emptyStudent}]);
    };

    const removeStudent = (index: number) => {
        setStudents(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <fieldset className="space-y-6">
            {students.map((student, index) => {
                // local filtering of schools based on each student's query
                const filteredSchools = allSchools.filter(s =>
                    s.name.toLowerCase().includes(student.schoolQuery.toLowerCase())
                );

                return (
                    <div key={index} className="">
                        <div className="grid grid-cols-6 gap-4">
                            {/* First Name */}
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor={`participant-first-name-${index}`}
                                       className="block text-gray-700 font-medium mb-2">
                                    First Name <span className="text-sm text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={student.firstName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'firstName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* last Name */}
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor={`participant-first-name-${index}`}
                                       className="block text-gray-700 font-medium mb-2">
                                    First Name <span className="text-sm text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={student.lastName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'lastName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Age */}
                            <div className="col-span-3 sm:col-span-1">
                                <label htmlFor={`participant-age-${index}`}
                                       className="block text-gray-700 font-medium mb-2">
                                    Age <span className="text-sm text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Age"
                                    value={student.age}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'age', parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Gender */}
                            <div className="col-span-3 sm:col-span-1">
                                <label htmlFor={`participant-gender-${index}`}
                                       className="block text-gray-700 font-medium mb-2">
                                    Gender <span className="text-sm text-red-500">*</span>
                                </label>
                                <select
                                    value={student.gender}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(index, 'gender', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    required
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>

                            {/* School */}
                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor={`participant-school-${index}`}
                                       className="block text-gray-700 font-medium mb-2">
                                    School
                                </label>
                                <SearchSelectInput<School>
                                    selected={student.selectedSchool}
                                    setSelected={(school) => handleChange(index, 'selectedSchool', school)}
                                    query={student.schoolQuery}
                                    setQuery={(q) => handleChange(index, 'schoolQuery', q)}
                                    data={filteredSchools}
                                    displayField={item => item.name}
                                    getId={item => item.id}
                                    input_name="school"
                                    // label={'School'}
                                    // note={'Search by name, eg: St Augustine Junior School'}
                                />

                                <p
                                    className="text-blue-700 mt-2 font-light text-sm hover:text-purple-500 hover:cursor-pointer"
                                    // onClick={toggleNewSchoolForm}
                                >
                                    New School? Click here to add details!
                                </p>
                            </div>

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => removeStudent(index)}
                                className="text-red-500 hover:text-red-700 p-2 self-start sm:self-center"
                                aria-label="Remove student"
                            >
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>

                    </div>
                );
            })}


            {/* Note about participants */}
            {students.length > 1 && <p className="italic text-sm text-gray-600 mb-6">
                <span className="font-semibold">Note:</span> All participants listed above should belong to the
                same parent or guardian.
            </p>}

            <button
                type="button"
                onClick={addStudent}
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105 focus:scale-105"
            >
                {students.length > 0 ? 'Add Another Participant' : 'Add Participant'}
            </button>
        </fieldset>
    );
};

export default ParticipantRegFieldset;
