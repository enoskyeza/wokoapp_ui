import React from 'react';

const GuardianFieldset = () => {
    return (
        <fieldset className="border-t border-gray-300 rounded-lg p-0 pt-6 mb-6">
            <legend className="text-xl font-semibold text-blue-700 px-2">
                Guardian Information
            </legend>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="mb-4">
                    <label htmlFor="first_name" className="block text-gray-700 font-medium mb-2">
                        First Name <span className="text-sm text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        name="guardian_first_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter first name"
                        required
                    />
                </div>

                {/* Last Name */}
                <div className="mb-4">
                    <label htmlFor="last_name" className="block text-gray-700 font-medium mb-2">
                        Last Name <span className="text-sm text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        name="guardian_last_name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter last name"
                        required
                    />
                </div>


                {/* Phone Number */}
                <div className="mb-4">
                    <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-2">
                        Phone Number <span className="text-sm text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id="phone_number"
                        name="guardian_phone_number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter phone number"
                        maxLength={13}
                        minLength={10}
                        required
                    />
                </div>

                {/* Address */}
                <div className="mb-4">
                    <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                        Address <span className="text-sm text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="guardian_address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter address"
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="guardian_email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter email address"
                        required
                    />
                </div>

                {/* Profession */}
                <div className="mb-4">
                    <label htmlFor="profession" className="block text-gray-700 font-medium mb-2">
                        Profession
                    </label>
                    <input
                        type="text"
                        id="profession"
                        name="guardian_profession"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        placeholder="Enter profession"
                    />
                </div>
            </div>
        </fieldset>
);
};

export default GuardianFieldset;
