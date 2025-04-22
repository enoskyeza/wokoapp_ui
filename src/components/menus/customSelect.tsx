import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface DynamicSelectProps<T> {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  itemToLabel: (item: T) => string;
  itemToValue: (item: T) => string | number;
  placeholder?: string;
}
export function DynamicSelect<T>({
  items,
  value,
  onChange,
  itemToLabel,
  itemToValue,
  placeholder = 'Select...'
}: DynamicSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-full max-w-xs" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        // className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:border-gray-400"
        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300
                    rounded-xl shadow-sm bg-white hover:border-gray-400"
       >
        {/*<span>{value ? itemToLabel(value) : placeholder}</span>*/}
        <span className="block truncate w-full">
          {value ? itemToLabel(value) : placeholder}
        </span>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {items.map(item => (
            <li
              key={itemToValue(item)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
            >
              {itemToLabel(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
