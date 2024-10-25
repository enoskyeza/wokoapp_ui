'use client'
import React, {useState} from 'react';
import FilterMenu from "@/components/Forms/FilterMenu";


interface Participant {
    contestant: string;
    id: string;
    age: number;
    gender: 'M' | 'F';
    parent: string;
    school: string;
    paymentStatus: 'PAID' | 'NOT_PAID';
    ageCategory: string;
    created_at: string;
}


const participants: Participant[] = [
    {
        contestant: 'Alice Johnson',
        id: 'TF23001',
        age: 10,
        gender: 'F',
        parent: 'John Johnson',
        school: 'ABC School',
        paymentStatus: 'PAID',
        ageCategory: '8-12',
        created_at: '2024-10-23T10:00:00Z',
    },
    {
        contestant: 'Bob Williams',
        id: 'TF23002',
        age: 12,
        gender: 'M',
        parent: 'Sarah Williams',
        school: 'XYZ School',
        paymentStatus: 'NOT_PAID',
        ageCategory: '8-12',
        created_at: '2024-10-23T10:05:00Z',
    },
    {
        contestant: 'Charlie Brown',
        id: 'TF23003',
        age: 5,
        gender: 'M',
        parent: 'Peter Brown',
        school: 'ABC School',
        paymentStatus: 'PAID',
        ageCategory: '3-7',
        created_at: '2024-10-23T10:10:00Z',
    },
    {
        contestant: 'David Miller',
        id: 'TF23004',
        age: 15,
        gender: 'M',
        parent: 'Emily Miller',
        school: 'GHI School',
        paymentStatus: 'PAID',
        ageCategory: '13-17',
        created_at: '2024-10-23T10:15:00Z',
    },
    {
        contestant: 'Eve Davis',
        id: 'TF23005',
        age: 8,
        gender: 'F',
        parent: 'David Davis',
        school: 'XYZ School',
        paymentStatus: 'NOT_PAID',
        ageCategory: '8-12',
        created_at: '2024-10-23T10:20:00Z',
    },
    {
        contestant: 'Fiona Rodriguez',
        id: 'TF23006',
        age: 11,
        gender: 'F',
        parent: 'Maria Rodriguez',
        school: 'JKL School',
        paymentStatus: 'PAID',
        ageCategory: '8-12',
        created_at: '2024-10-23T10:25:00Z',
    },
    {
        contestant: 'George Garcia',
        id: 'TF23007',
        age: 6,
        gender: 'M',
        parent: 'Jose Garcia',
        school: 'ABC School',
        paymentStatus: 'PAID',
        ageCategory: '3-7',
        created_at: '2024-10-23T10:30:00Z',
    },
    {
        contestant: 'Hannah Wilson',
        id: 'TF23008',
        age: 13,
        gender: 'F',
        parent: 'Lisa Wilson',
        school: 'GHI School',
        paymentStatus: 'NOT_PAID',
        ageCategory: '13-17',
        created_at: '2024-10-23T10:35:00Z',
    },
    {
        contestant: 'Ian Martinez',
        id: 'TF23009',
        age: 9,
        gender: 'M',
        parent: 'Carlos Martinez',
        school: 'XYZ School',
        paymentStatus: 'PAID',
        ageCategory: '8-12',
        created_at: '2024-10-23T10:40:00Z',
    },
    {
        contestant: 'Julia Anderson',
        id: 'TF23010',
        age: 16,
        gender: 'F',
        parent: 'Thomas Anderson',
        school: 'JKL School',
        paymentStatus: 'PAID',
        ageCategory: '13-17',
        created_at: '2024-10-23T10:45:00Z',
    },
    {
        contestant: 'Kevin Taylor',
        id: 'TF23011',
        age: 7,
        gender: 'M',
        parent: 'Susan Taylor',
        school: 'ABC School',
        paymentStatus: 'NOT_PAID',
        ageCategory: '3-7',
        created_at: '2024-10-23T10:50:00Z',
    },
    {
        contestant: 'Lily Moore',
        id: 'TF23012',
        age: 14,
        gender: 'F',
        parent: 'Paul Moore',
        school: 'GHI School',
        paymentStatus: 'PAID',
        ageCategory: '13-17',
        created_at: '2024-10-23T10:55:00Z',
    },
];

function Contestants() {
    const [filters, setFilters] = useState({
        ageCategory: '',
        gender: '',
        startDate: '',
        endDate: '',
        ageCategories: [] as string[],
    });

    const filteredParticipants = participants.filter((participant) => {
        const matchesAgeCategory = filters.ageCategory ? participant.ageCategory === filters.ageCategory : true;
        const matchesGender = filters.gender ? participant.gender === filters.gender : true;
        const matchesDateRange =
            (!filters.startDate || new Date(participant.created_at) >= new Date(filters.startDate)) &&
            (!filters.endDate || new Date(participant.created_at) <= new Date(filters.endDate));
        return matchesAgeCategory && matchesGender && matchesDateRange;
    });

    return (
        <div className="col-span-full xl:col-span-8 bg-white shadow-sm rounded-xl mt-8">
            <header className="px-5 py-4 ">
                <h2 className="font-semibold text-gray-800">Contestants</h2>
            </header>

            {/* ... (filters code can remain the same) */}
            <div className="flex flex-wrap justify-end mb-6 space-y-4 sm:space-y-0 sm:space-x-4">

                <FilterMenu filters={filters} setFilters={setFilters}/>

                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="block w-full sm:w-1/4 px-4 py-2 border rounded-lg"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="block w-full sm:w-1/4 px-4 py-2 border rounded-lg"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto"> {/* Added for horizontal scrolling if needed */}
                <table className="table-auto w-full">
                    {/* Table header */}
                    <thead className="text-xs uppercase text-gray-400 bg-gray-50 rounded-sm">
                    <tr>
                        <th className="p-2">
                            <div className="font-semibold text-left"></div>
                            {/* Empty for checkbox column */}
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">ID</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-left">Contestant</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">Age</div>

                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">Gender</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-left">Parent</div>

                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-left">School</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">Payment Status</div>
                        </th>
                    </tr>
                    </thead>
                    {/* Table body */}
                    <tbody className="text-sm font-medium divide-y divide-gray-100">
                    {filteredParticipants.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="p-4 text-center text-gray-500">
                                No participants registered yet.
                            </td>
                        </tr>
                    ) : (
                        participants.map((participant) => (
                            <tr key={participant.id}>
                                <td className="p-2">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"/>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">{participant.id}</div>
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center">
                                        <div className="text-gray-800">
                                            {participant.contestant}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">{participant.age}</div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">{participant.gender}</div>
                                </td>
                                <td className="p-2">
                                    <div className="text-gray-800">{participant.parent}</div>
                                </td>
                                <td className="p-2">
                                    <div className="text-gray-800">{participant.school}</div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">
                      <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${
                              participant.paymentStatus === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {participant.paymentStatus}
                      </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contestants;