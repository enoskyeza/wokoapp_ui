import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react";


type Props<T> = {
    selected: T | null
    setSelected: (selected: T) => void
    query: string
    setQuery: (query: string) => void
    data: T[]
    label?: string
    note?: string
    input_name?: string
    displayField: (item: T) => string; // Custom function to extract the display value
    getId: (item: T) => number; // Function to extract the id from the data
    required?: boolean;
}

export default function SearchSelectInput<T>(
    {
        selected,
        setSelected,
        query,
        setQuery,
        data,
        label,
        note,
        input_name,
        displayField,
        getId,
        required=false
    }: Props<T>) {


  const [error, setError] = useState<string>("");

    useEffect(() => {
    if (selected) {
      setError("");
    }
  }, [selected]);

      const handleInvalid = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    setError("Please select a value.");
  };

    return (
        <div>
            <Combobox
                as="div"
                value={selected}
                onChange={(item: T | null) => {
                    if (item) {
                        setSelected(item);
                        setQuery('');
                    }
                }}
            // onChange={(item) => {
            //     setQuery('')
            //     setSelected(item)
            // }}
            >
                {label && <Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Label>}
                {note && <p className="mt-2 text-xs font-light italic text-gray-400">{note}</p>}
                <div className="relative mt-2">
                    <ComboboxInput
                        className={`w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm 
                            ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600
                            ${required ? "ring-red-300" : "ring-gray-300"} sm:text-sm sm:leading-6`}
                        onChange={(event) => setQuery(event.target.value)}
                        onBlur={() => setQuery('')}
                        displayValue={(item: T) => (item ? displayField(item) : '')}
                        placeholder={required ? 'Required' : ''}
                    />
                    <ComboboxButton
                        className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>

                    {Array.isArray(data) && data.length > 0 && (
                        <ComboboxOptions
                            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {data.map((item) => (
                                <ComboboxOption
                                    key={getId(item)}
                                    value={item}
                                    className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                                >
                                    <span
                                        className="block truncate group-data-[selected]:font-semibold">{displayField(item)}</span>

                                    <span
                                        className="absolute inset-y-0 left-0 hidden items-center pl-1.5 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                </ComboboxOption>
                            ))}
                        </ComboboxOptions>
                    )}
                </div>
            </Combobox>

            {(selected && input_name) && (
                <input
                    type="hidden"
                    name={input_name}
                    value={getId(selected)}
                    required={required}
                />
            )}
        </div>
    )
}