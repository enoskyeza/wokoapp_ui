import React from "react";
import { Contestant } from "@/types";

interface ResultsTableProps {
  data: Contestant[]; // Array of contestants
  page: number; // Current page number
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, page }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left">Position</th>
            <th className="border p-3 text-left">Identifier</th>
            <th className="border p-3 text-left">Name</th>
            <th className="border p-3 text-left">Age</th>
            <th className="border p-3 text-left">Age Category</th>
            <th className="border p-3 text-left">Gender</th>
            {/* Dynamically add columns for categories */}
            {Object.keys(data[0]?.categories || {}).map((category) => (
              <th key={category} className="border p-3 text-left">
                {category} Average
              </th>
            ))}
            <th className="border p-3 text-left">Overall Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((contestant, index) => (
            <tr key={contestant.identifier} className="hover:bg-gray-50">
              <td className="border p-3">{index + 1 + (page - 1) * data.length}</td>
              <td className="border p-3">{contestant.identifier}</td>
              <td className="border p-3">{contestant.name}</td>
              <td className="border p-3">{contestant.age}</td>
              <td className="border p-3">{contestant.age_category}</td>
              <td className="border p-3">{contestant.gender === "M" ? "Male" : "Female"}</td>
              {Object.entries(contestant.categories).map(([category, details]) => (
                <td key={category} className="border p-3">
                  {details.totals.average.toFixed(2)}
                </td>
              ))}
              <td className="border p-3">{contestant.overall_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
