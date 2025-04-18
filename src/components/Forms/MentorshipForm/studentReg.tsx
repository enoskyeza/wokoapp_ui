'use client'
import React, { useState, ChangeEvent } from 'react';
import { TrashIcon } from "@heroicons/react/20/solid";

interface Student {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F';
  guardianName: string;
  contact: string;
}

const StudentFieldset: React.FC = () => {
  const emptyStudent: Student = {
    firstName: '',
    lastName: '',
    age: 0,
    gender: 'M',
    guardianName: '',
    contact: ''
  };

  const [students, setStudents] = useState<Student[]>([emptyStudent]);

  const handleChange = (
    index: number,
    field: keyof Student,
    value: string | number
  ) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addStudent = () => {
    setStudents(prev => [...prev, { ...emptyStudent }]);
  };

  const removeStudent = (index: number) => {
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  return (
    // <fieldset className="border shadow-lg rounded-lg p-4 mb-6">
     // <legend className="text-xl font-semibold mb-4 px-2">Students</legend>
    <fieldset className="p-4 mb-6">
      {students.map((student, index) => (
        <div key={index} className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="First Name"
            value={student.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'firstName', e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={student.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'lastName', e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={student.age}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'age', parseInt(e.target.value, 10) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          />
          <select
            value={student.gender}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(index, 'gender', e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            required
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

          <div className="flex gap-4">
          <input
            type="text"
            placeholder="Guardian Name"
            value={student.guardianName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'guardianName', e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Guardian's Contact"
            value={student.contact}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, 'contact', e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          </div>
          <button
            type="button"
            onClick={() => removeStudent(index)}
            className="text-red-500 hover:text-red-700 p-2"
            aria-label="Remove student"
          >
            <TrashIcon className="h-5 w-5 " />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStudent}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Student
      </button>
    </fieldset>
  );
};

export default StudentFieldset;
