'use client'
import React from 'react';
import {DateRangePicker} from "@nextui-org/date-picker";
// import ReceiptModalDialog from "@/components/DetailViews/ReceiptModal";
// import {PlusCircleIcon} from "@heroicons/react/24/outline";
import {useReceipts} from "@/components/Contexts/ReceiptDataProvider";
import {SimpleDropdown, Option} from "@/components/menus/simpleSelect";
import {MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {useRegistrationData} from "@/components/Contexts/regDataProvider";
import {DynamicSelect} from "@/components/menus/customSelect";
import {Program} from "@/types";


function Receipts() {
    const { receipts, filters, setFilters, clearFilters } = useReceipts();
    const { programs } = useRegistrationData()

    const handleViewReceipt = (receiptId: number) => {
        window.open(`${window.location.origin}/receipts/${receiptId}`, '_blank')
    }

    type PaymentStatus = 'paid' | 'refunded';

    const statusOptions: Option<PaymentStatus>[] = [
      { label: 'Paid',    value: 'paid'    },
      { label: 'Refunded',value: 'refunded'},
    ];

    const selectedProgram = filters.program != null
    ? programs.find(p => p.id === filters.program) ?? null
    : null;

    return (
        <div className="bg-white shadow-lg rounded-lg border border-stroke col-span-full xl:col-span-8 mt-12">
            <div className="flex justify-between m-6">
                <h5 className="text-xl font-semibold text-black">
                    Receipts
                </h5>
            </div>

            <div className="px-6 mb-6 space-y-4 sm:space-y-0 ">
                <div >
                    <label className="block text-sm font-medium text-gray-700"> Search </label>
                    <div className="relative w-full max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-[50%] sm:top-[50%] transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFilters({ ...filters, search: e.target.value, page: 1 })
                              }
                          placeholder={'Search participant.'}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="w-full sm:flex justify-between gap-3 pt-2 space-y-3 sm:space-y-0">
                    <div className="w-full sm:flex gap-3 space-y-3 sm:space-y-0">
                        <div className="w-full max-w-[250px]">
                            <label className="block text-sm font-medium text-gray-700">Filter by program </label>
                            <DynamicSelect<Program>
                            items={programs}
                            value={selectedProgram}
                            onChange={(program) =>
                              setFilters({ ...filters, program: program.id, page: 1 })
                            }
                            itemToLabel={p => p.name}
                            itemToValue={p => p.id}
                        />
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="w-full max-w-[110px]">
                            <SimpleDropdown<typeof statusOptions[number]['value']>
                                            label="Status"
                                            options={statusOptions}
                                            value={filters.status}
                                            onChange={(status) =>
                                              setFilters({ ...filters, status, page: 1 })
                                            }
                                          />
                        </div>
                            <p
                                onClick={clearFilters}
                                className=" w-full text-xs hover:text-red-500 underline cursor-pointer"> Clear Filters</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700"> Date Filter</label>
                        <DateRangePicker
                            variant='bordered'
                            // label="Select date"
                            className=" max-w-xs"
                            aria-label="Select date range"
                        />
                    </div>
                </div>

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
                            <div className="font-semibold text-left">M/s</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-center">Amount</div>
                        </th>
                        <th className="p-2">
                            <div className="font-semibold text-left">Status</div>
                        </th>
                    </tr>
                    </thead>
                    {/* Table body */}
                    <tbody className="text-sm font-medium divide-y divide-gray-100">
                    {receipts.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="p-4 text-center text-gray-500">
                                No Receipts.
                            </td>
                        </tr>
                    ) : (
                        receipts.map((receipt, index) => (
                            <tr key={receipt.id}>
                                {/*<td className="p-2 pl-6">*/}
                                {/*    <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600"/>*/}
                                {/*</td>*/}
                                <td className="p-2 ">
                                    <div className="text-right">{index + 1}</div>
                                </td>
                                <td className="p-2">
                                    <div className="flex flex-col items-left">
                                        <p
                                            onClick={() => handleViewReceipt(receipt.id)}
                                            className="text-gray-800 font-bold cursor-pointer hover:text-blue-600 transition-colors"
                                        >
                                            {`RCT-${String(receipt.id).padStart(3, '0')}`}
                                        </p>
                                        <p
                                            onClick={() => handleViewReceipt(receipt.id)}
                                            className="text-gray-500 text-xs cursor-pointer hover:text-blue-600 transition-colors"
                                        >
                                            {`${receipt.registration}`}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">{receipt.amount}</div>
                                </td>
                                <td className="p-2">
                                    <div className="text-center">
                                        <span
                                            className={`my-1 px-3 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-sm ring-[1.5px] ring-offset-1 ${
                                                receipt.status === 'paid'
                                                    ? 'ring-green-600 text-green-600 px-4'
                                                    : (receipt.status === 'refunded'
                                                       ? 'ring-red-600 text-red-600 px-4' 
                                                        : 'ring-yellow-500 text-yellow-600')
                                            }`}
                                        >
                                            {receipt.status === 'paid' ? 'Paid' : (receipt.status === 'refunded' ? 'Refunded' : 'Pending')}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>


            {/* Modal Component */}
            {/*{isModalOpen && selectedReceipt && (*/}
            {/*    <ReceiptModalDialog isOpen={isModalOpen} setIsOpen={setIsModalOpen} receiptId={selectedReceipt} />*/}
            {/*)}*/}
        </div>
    );
};

export default Receipts;