'use client'
import React, {useState} from 'react';
import FilterMenu from "@/components/Forms/FilterMenu";
import {DateRangePicker} from "@nextui-org/date-picker";
import Link from "next/link";
import {Participant} from "@/types";



function Contestants({participants}: {participants: Participant[]}) {
    const [filters, setFilters] = useState({
        ageCategory: '',
        gender: '',
        startDate: '',
        endDate: '',
        ageCategories: [] as string[],
    });



    const filteredParticipants = participants.filter((participant) => {
        const matchesAgeCategory = filters.ageCategory ? participant.age_category === filters.ageCategory : true;
        const matchesGender = filters.gender ? participant.gender === filters.gender : true;
        const matchesDateRange =
            (!filters.startDate || new Date(participant.created_at) >= new Date(filters.startDate)) &&
            (!filters.endDate || new Date(participant.created_at) <= new Date(filters.endDate));
        return matchesAgeCategory && matchesGender && matchesDateRange;
    });

    return (
        <div className="bg-white shadow-lg rounded-lg border border-stroke col-span-full xl:col-span-8 mt-12">
            <div className="m-6">
                <h5 className="text-xl font-semibold text-black">
                    Contestants
                </h5>
            </div>

            <div className="flex flex-wrap sm:justify-end px-6 mb-6 space-y-4 sm:space-y-0 sm:space-x-4">

                <FilterMenu filters={filters} setFilters={setFilters}/>
                <DateRangePicker
                    variant='bordered'
                    // label="Select date"
                    className=" max-w-xs"
                />

                {/*<input*/}
                {/*    type="date"*/}
                {/*    value={filters.startDate}*/}
                {/*    onChange={(e) => setFilters({...filters, startDate: e.target.value})}*/}
                {/*    className="block w-full sm:w-1/4 px-4 py-2 border rounded-lg"*/}
                {/*/>*/}
                {/*<input*/}
                {/*    type="date"*/}
                {/*    value={filters.endDate}*/}
                {/*    onChange={(e) => setFilters({...filters, endDate: e.target.value})}*/}
                {/*    className="block w-full sm:w-1/4 px-4 py-2 border rounded-lg"*/}
                {/*/>*/}
            </div>

            {/* Table */}
            <div className="overflow-x-auto "> {/* Added for horizontal scrolling if needed */}
                <table className="table-auto w-full">
                    {/* Table header */}
                    <thead className="text-xs uppercase text-gray-100 bg-gray-900 rounded-sm">
                    <tr>
                        <th className="p-2">
                            <div className="font-semibold text-right">#</div>
                            {/* Empty for checkbox column */}
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-left">Contestant</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">TF No.</div>
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
                        participants.map((participant, index) => (
                            <tr key={participant.id}>
                                {/*<td className="p-2 pl-6">*/}
                                {/*    <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"/>*/}
                                {/*</td>*/}
                                <td className="p-2 ">
                                    <div className="text-right">{index + 1}</div>
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center">
                                        <Link
                                            href={'/contestant/id'}
                                            className="text-gray-800 cursor-pointer hover:text-blue-400"
                                        >
                                            {`${participant.first_name} ${participant.last_name}`}
                                        </Link>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">{participant.identifier ? participant.identifier : '-'}</div>
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
                                            className={`my-1 px-3 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-sm ring-[1.5px] ring-offset-1 ${
                                                participant.payment_status === 'paid'
                                                    ? 'ring-green-600 text-green-600 px-4'
                                                    : 'ring-yellow-500 text-yellow-600'
                                            }`}
                                        >
                                            {participant.payment_status === 'paid' ? 'Paid' : 'Pending'}
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