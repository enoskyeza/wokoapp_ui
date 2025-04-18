'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios, { AxiosError } from 'axios';

export type School = {
  id: number;
  name: string;
  contact: string;
  address: string;
  email: string;
};

export type DataContextType = {
  schools: School[];
  isLoading: boolean;
  error: unknown;
  // School filtering
  selectedSchool: School | null;
  setSelectedSchool: (customer: School | null) => void;
  schoolQuery: string;
  setSchoolQuery: (query: string) => void;
  refreshSchools: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function MpDataProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  // Filtering state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolQuery, setSchoolQuery] = useState<string>("");

  // Fetch schools from the API
  const fetchSchools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Append query param if present
      const url = `/api/mp/schools${schoolQuery ? `?search=${encodeURIComponent(schoolQuery)}` : ''}`;
      const response = await axios.get<{ results: School[] }>(url);
      setSchools(response.data.results);
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        setError(axiosError.response.data);
      } else {
        setError({ message: 'An unexpected error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and refetch when query changes
  useEffect(() => {
    void fetchSchools();
  }, [schoolQuery]);

  // Expose a manual refresh as well
  const refreshSchools = async () => {
    await fetchSchools();
  };

  const value: DataContextType = {
    schools,
    isLoading,
    error,
    selectedSchool,
    setSelectedSchool,
    schoolQuery,
    setSchoolQuery,
    refreshSchools,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a MpDataProvider");
  }
  return context;
}
