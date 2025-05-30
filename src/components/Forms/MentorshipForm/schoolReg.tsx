'use client'
import { useState, ChangeEvent, } from "react";
import SearchSelectInput from "@/components/menus/searchSelect";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import {School} from "@/types";



const SchoolSection = () => {
    const { schools, selectedSchool, setSelectedSchool, schoolQuery, setSchoolQuery} = useRegistrationData();

    // const [schoolQuery, setSchoolQuery] = useState('');


    // Handler for toggling new School form visibility
    const [showNewSchoolForm, setShowNewSchoolForm] = useState(false);
    const [newSchool, setNewSchool] = useState({
        name: "",
        email: "",
        contact: "",
        address: "",
    });

    const toggleNewSchoolForm = () => {
        setShowNewSchoolForm((prev) => !prev);
    };

    const handleNewSchoolChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewSchool({ ...newSchool, [e.target.name]: e.target.value });
    };

    return (
        <fieldset>
        <div className="mb-10 border-solid border border-gray-200 rounded-xl shadow-lg">
            <h2 className="text-base font-semibold leading-7 text-gray-400 uppercase text-center bg-gray-50 p-2">Search
                registered school</h2>
            <div className="py-3 px-5 pb-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-full">
                    <div className="">
                        <SearchSelectInput<School>
                            selected={selectedSchool}
                            setSelected={setSelectedSchool}
                            query={schoolQuery}
                            setQuery={setSchoolQuery}
                            data={schools}
                            // label={'School'}
                            note={'Search by name, eg: St Augustine Junior School'}
                            displayField={item => (`${item.name}`)}
                            getId={item => item.id}
                            input_name="school"
                        />
                    </div>
                    <p
                        className="text-blue-700 mt-2 font-light text-sm hover:text-purple-500 hover:cursor-pointer"
                        onClick={toggleNewSchoolForm}
                    >
                        New School? Click here to add details!
                    </p>

                </div>
            </div>
        </div>

            {/* New School Form Section - Hidden by default */}
            {showNewSchoolForm && (
                <div className=" mb-10 border-solid border border-gray-200 rounded-xl shadow-lg">
                    <h2 className="text-base font-semibold leading-7 text-gray-400 uppercase text-center bg-gray-50 p-2">Add
                        new school</h2>
                    <div className="py-3 px-5 pb-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        {/* First Name */}
                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="first-name"
                                    name="first_name"
                                    type="text"
                                    value={newSchool.name}
                                    onChange={handleNewSchoolChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="adress"
                                    name="adress"
                                    type="text"
                                    value={newSchool.address}
                                    onChange={handleNewSchoolChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={newSchool.email}
                                    onChange={handleNewSchoolChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="col-span-3">
                            <label htmlFor="phoneNumber" className="block text-sm font-medium leading-6 text-gray-900">
                                Phone number
                            </label>
                            <div className="mt-2">
                                <input
                                    id="contact"
                                    name="contact"
                                    type="tel"
                                    value={newSchool.contact}
                                    onChange={handleNewSchoolChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </fieldset>
    );
};

export default SchoolSection;
