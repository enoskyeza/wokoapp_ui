import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export interface Option<T extends string | number> {
  label: string;
  value: T;
}

export interface SimpleDropdownProps<T extends string | number> {
  /** Visible label above the dropdown */
  label?: string;
  /** Currently selected value, or undefined for placeholder */
  value?: T;
  /** Array of options to choose from */
  options: Option<T>[];
  /** Placeholder text and the “clear” option label */
  placeholder?: string;
  /** Called when user selects a value, or undefined when cleared */
  onChange: (value?: T) => void;
  /** Extra wrapper classes */
  className?: string;
}

export function SimpleDropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'All',
  className = '',
}: SimpleDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine what to show in the button
  const displayLabel =
    value === undefined
      ? placeholder
      : options.find(opt => opt.value === value)?.label ?? placeholder;

  return (
    <div className={`space-y-0 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative inline-block text-left w-full max-w-xs" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:border-gray-400"
        >
          <span className="block truncate w-full">{displayLabel}</span>
          {open ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {open && (
          <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg">
            {/* Clear selection option */}
            <li
              key="__clear__"
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              {placeholder}
            </li>

            {/* Render each option */}
            {options.map(opt => (
              <li
                key={String(opt.value)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
