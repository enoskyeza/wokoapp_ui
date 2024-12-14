'use client';
import React, { useState, useEffect } from "react";
import { PaginatedResults } from "@/types";
import { API_URL } from "@/config";
import ResultsTable from "@/components/Tables/Results";
import DashboardLayout from '@/components/Layouts/Dashboard';

const ResultsPage: React.FC = () => {
  const [data, setData] = useState<PaginatedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [ageCategory, setAgeCategory] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [query, ageCategory, gender, page]);

  const fetchData = async () => {
    setLoading(true);

    const filters = new URLSearchParams();
    if (query) filters.append("search", query);
    if (ageCategory) filters.append("age_category", ageCategory);
    if (gender) filters.append("gender", gender ?? "");
    filters.append("page", page.toString());

    const response = await fetch(`${API_URL}score/results/?${filters.toString()}`);
    const result: PaginatedResults = await response.json();

    // Sort by overall total in case backend doesn't handle it
    result.results.sort((a, b) => b.overall_total - a.overall_total);

    setData(result);
    setLoading(false);
  };

  return (

    <DashboardLayout>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Contestant Results</h1>

      {/* Filters Section */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or identifier"
          className="w-full md:w-1/3 px-4 py-2 border rounded shadow"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <div className="flex space-x-4">
          {["all", "junior", "intermediate", "senior"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded ${
                ageCategory === category || (category === "all" && !ageCategory)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setAgeCategory(category === "all" ? null : category);
                setPage(1);
              }}
            >
              {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <select
          className="w-full md:w-1/4 px-4 py-2 border rounded shadow"
          value={gender ?? ""}
          onChange={(e) => {
            setGender(e.target.value || null);
            setPage(1);
          }}
        >
          <option value="">All Genders</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="text-center py-6 text-lg">Loading...</div>
      ) : data?.results.length ? (
        <ResultsTable data={data.results} page={page} />
      ) : (
        <div className="text-center py-6 text-lg">No results found.</div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          className={`px-4 py-2 rounded ${
            data?.previous ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          }`}
          onClick={() => data?.previous && setPage((prev) => Math.max(prev - 1, 1))}
          disabled={!data?.previous}
        >
          Previous
        </button>
        <span className="text-gray-700">Page {page}</span>
        <button
          className={`px-4 py-2 rounded ${
            data?.next ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          }`}
          onClick={() => data?.next && setPage((prev) => prev + 1)}
          disabled={!data?.next}
        >
          Next
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
