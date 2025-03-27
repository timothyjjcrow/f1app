import React, { useEffect, useState } from "react";
import { useRaceResultsContext } from "../contexts/RaceResultsContext";
import { useSeasonContext } from "../contexts/SeasonContext";

const CircuitDebugger: React.FC = () => {
  const { allRaceResults, isLoadingResults, resultsError, fetchAllResults } =
    useRaceResultsContext();
  const { selectedYear } = useSeasonContext();
  const [circuitMap, setCircuitMap] = useState<Record<string, string>>({});
  const [categoryMap, setcategoryMap] = useState<Record<string, string[]>>({});

  // Define circuit categories (simplified version for testing)
  const CIRCUIT_CATEGORIES: Record<string, string[]> = {
    "Street Circuits": [
      "monaco",
      "monaco_circuit",
      "bahrain",
      "bahrain_international_circuit",
      "jeddah",
      "jeddah_street_circuit",
      "jedda",
      "jedha",
      "singapore",
      "marina_bay",
      "yas_marina",
      "yas_marina_circuit",
      "abu_dhabi",
      "albert_park",
      "melbourne",
      "australia",
      "baku",
      "baku_city_circuit",
      "azerbaijan",
      "vegas",
      "las_vegas",
      "vegas_street_circuit",
      "las_vegas_street_circuit",
    ],
    "High-Speed Circuits": [
      "monza",
      "autodromo_nazionale_monza",
      "italian",
      "italy",
      "monza_circuit",
      "spa",
      "spa_francorchamps",
      "belgium",
      "silverstone",
      "silverstone_circuit",
      "britain",
      "british",
      "great_britain",
      "americas",
      "circuit_of_the_americas",
      "cota",
      "united_states",
      "usa",
    ],
  };

  useEffect(() => {
    console.log("CircuitDebugger mounted, with year:", selectedYear);

    // When mounted, fetch all race results
    if (!isLoadingResults) {
      fetchAllResults();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (allRaceResults && !isLoadingResults) {
      console.log(
        "Circuit Debugger processing races:",
        Object.keys(allRaceResults).length
      );

      // Create a map of circuit IDs to circuit names
      const tempCircuitMap: Record<string, string> = {};

      // Find all unique circuit IDs
      Object.values(allRaceResults).forEach((race) => {
        if (race?.circuit?.circuitId) {
          tempCircuitMap[race.circuit.circuitId] =
            race.circuit.name || "Unknown Circuit";
        }
      });

      setCircuitMap(tempCircuitMap);

      // Now categorize circuits
      const tempCategoryMap: Record<string, string[]> = {};

      // Initialize empty categories
      Object.keys(CIRCUIT_CATEGORIES).forEach((category) => {
        tempCategoryMap[category] = [];
      });

      // Categorize each circuit
      Object.keys(tempCircuitMap).forEach((circuitId) => {
        let categorized = false;

        Object.entries(CIRCUIT_CATEGORIES).forEach(([category, circuits]) => {
          if (circuits.includes(circuitId)) {
            tempCategoryMap[category].push(circuitId);
            categorized = true;
          }
        });

        if (!categorized) {
          if (!tempCategoryMap["Uncategorized"]) {
            tempCategoryMap["Uncategorized"] = [];
          }
          tempCategoryMap["Uncategorized"].push(circuitId);
        }
      });

      setcategoryMap(tempCategoryMap);
    }
  }, [allRaceResults, isLoadingResults]);

  const handleRefresh = () => {
    fetchAllResults();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 my-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-semibold">
          Circuit Data Debugger
        </h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={isLoadingResults}
        >
          {isLoadingResults ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      {resultsError && (
        <div className="bg-red-900 text-white p-3 rounded mb-4">
          Error: {resultsError}
        </div>
      )}

      {isLoadingResults ? (
        <div className="text-yellow-400 flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading circuit data for {selectedYear}...
        </div>
      ) : (
        <>
          <div className="bg-gray-900 p-3 rounded mb-4">
            <h3 className="text-white mb-2">
              Found {Object.keys(circuitMap).length} circuits in {selectedYear}:
            </h3>
            <div className="overflow-auto max-h-40 text-sm">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-2 py-1 text-left">Circuit ID</th>
                    <th className="px-2 py-1 text-left">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(circuitMap).map(([id, name]) => (
                    <tr key={id} className="border-t border-gray-700">
                      <td className="px-2 py-1 font-mono">{id}</td>
                      <td className="px-2 py-1">{name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded">
            <h3 className="text-white mb-2">Circuit Categories:</h3>
            <div className="overflow-auto max-h-60 text-sm">
              {Object.entries(categoryMap).map(([category, circuits]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-blue-400 mb-1">
                    {category} ({circuits.length})
                  </h4>
                  <div className="ml-4 text-gray-400">
                    {circuits.map((id) => (
                      <div key={id} className="flex justify-between mb-1">
                        <span className="font-mono">{id}</span>
                        <span>{circuitMap[id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CircuitDebugger;
