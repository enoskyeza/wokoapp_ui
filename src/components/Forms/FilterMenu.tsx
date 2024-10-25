'use client'
import { useState } from 'react';
import { FunnelIcon } from "@heroicons/react/24/solid";

// Define types for filters and setFilters props
interface FilterProps {
  filters: {
    ageCategory: string;
    gender: string;
    startDate: string;
    endDate: string;
    ageCategories: string[];
  };
  setFilters: (filters: {
    ageCategory: string;
    gender: string;
    startDate: string;
    endDate: string;
    ageCategories: string[];
  }) => void;
}

const FilterMenu = ({ filters, setFilters }: FilterProps) => {
  const [localFilters, setLocalFilters] = useState({
    gender: filters.gender || '',
    ageCategories: filters.ageCategories || [],
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleFilterMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Corrected: Toggle the menu open state
  };

  const toggleAgeCategory = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      ageCategories: prev.ageCategories.includes(category)
        ? prev.ageCategories.filter((c: string) => c !== category) // Specify type for c
        : [...prev.ageCategories, category],
    }));
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      gender: localFilters.gender,
      ageCategories: localFilters.ageCategories,
    });
    setIsMenuOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({ gender: '', ageCategories: [] });
    setFilters({ ...filters, gender: '', ageCategories: [] });
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button with filter icon */}
      <button
        type="button"
        onClick={toggleFilterMenu}
        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      >
        <FunnelIcon className="h-5 w-5 text-gray-500" />
      </button>

      {isMenuOpen && (
        <div className="absolute z-10 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
          {/* Gender Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex flex-col space-y-2">
              {['M', 'F', ''].map((value, idx) => (
                <label key={idx} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={localFilters.gender === value}
                    onChange={() => setLocalFilters({ ...localFilters, gender: value })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'All Genders'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Categories
            </label>
            <div className="flex flex-col space-y-2">
              {['young', 'middle', 'old'].map((category) => (
                <label key={category} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.ageCategories.includes(category)}
                    onChange={() => toggleAgeCategory(category)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply and Clear Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
