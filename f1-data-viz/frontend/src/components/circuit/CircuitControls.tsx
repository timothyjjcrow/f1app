import React from "react";
import { CircuitInfo, DriverInfo } from "./CircuitTypes";

interface CircuitControlsProps {
  selectedYear: number;
  selectedCircuitId: string;
  selectedDriverId: string;
  availableCircuits: string[];
  driversInfo: Map<string, DriverInfo>;
  availableCircuitDetails: Record<string, CircuitInfo>;
  isLoadingResults: boolean;
  onCircuitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDriverChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleForceRefresh: () => void;
  toggleDebugInfo: () => void;
  showDebugInfo: boolean;
}

const CircuitControls: React.FC<CircuitControlsProps> = ({
  selectedYear,
  selectedCircuitId,
  selectedDriverId,
  availableCircuits,
  driversInfo,
  availableCircuitDetails,
  isLoadingResults,
  onCircuitChange,
  onDriverChange,
  handleForceRefresh,
  toggleDebugInfo,
  showDebugInfo,
}) => {
  const selectedCircuitInfo = availableCircuitDetails[selectedCircuitId];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <h2 className="text-xl font-bold text-white">
        Circuit Layout & Analysis ({selectedYear})
      </h2>

      <div className="flex items-center gap-2">
        <button
          onClick={handleForceRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
          disabled={isLoadingResults}
        >
          {isLoadingResults ? "Loading..." : "Force Refresh Data"}
        </button>

        <button
          onClick={toggleDebugInfo}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded"
        >
          {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="circuitSelectViz"
              className="block text-sm font-medium text-gray-300"
            >
              Circuit{" "}
              {availableCircuits.length > 0 &&
                `(${availableCircuits.length} available)`}
            </label>
            <span className="text-xs text-blue-400">{selectedYear} Season</span>
          </div>
          <div className="relative">
            <select
              id="circuitSelectViz"
              value={selectedCircuitId}
              onChange={onCircuitChange}
              className={`w-full bg-gray-800 text-white rounded px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${
                availableCircuits.length === 0
                  ? "border-gray-700"
                  : availableCircuits.includes(selectedCircuitId)
                  ? "border-green-600"
                  : "border-amber-600"
              }`}
              disabled={isLoadingResults}
            >
              {isLoadingResults ? (
                <option value="">Loading circuits...</option>
              ) : availableCircuits.length > 0 ? (
                availableCircuits.map((circuitId) => {
                  const circuit = availableCircuitDetails[circuitId];
                  return (
                    <option key={circuitId} value={circuitId}>
                      {circuit?.name || circuitId} (
                      {circuit?.country || "Unknown"})
                    </option>
                  );
                })
              ) : (
                Object.values(availableCircuitDetails).map((circuit) => (
                  <option key={circuit.id} value={circuit.id}>
                    {circuit.name} ({circuit.country})
                  </option>
                ))
              )}
            </select>
          </div>
          {selectedCircuitInfo && (
            <p className="text-xs text-blue-400 mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {selectedCircuitInfo.name}, {selectedCircuitInfo.country}
            </p>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="driverSelectViz"
              className="block text-sm font-medium text-gray-300"
            >
              Driver {driversInfo.size > 0 && `(${driversInfo.size} available)`}
            </label>
            <button
              onClick={handleForceRefresh}
              disabled={isLoadingResults}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded disabled:opacity-50"
              title="Reload driver data"
            >
              {isLoadingResults ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></span>
                  Loading...
                </>
              ) : (
                <>Refresh</>
              )}
            </button>
          </div>
          <div className="relative">
            <select
              id="driverSelectViz"
              value={selectedDriverId}
              onChange={onDriverChange}
              className={`w-full bg-gray-800 text-white rounded px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${
                driversInfo.size === 0
                  ? "border-amber-600"
                  : selectedDriverId
                  ? "border-green-600"
                  : "border-gray-700"
              }`}
              disabled={isLoadingResults || driversInfo.size === 0}
            >
              {driversInfo.size === 0 ? (
                <option value="">-- No Drivers Available --</option>
              ) : (
                <>
                  <option value="">-- Select Driver --</option>
                  {Array.from(driversInfo.entries()).map(([id, driver]) => (
                    <option key={id} value={id}>
                      {driver.name} ({driver.team})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          {driversInfo.size === 0 && !isLoadingResults && (
            <p className="text-xs text-amber-400 mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              No drivers found for this circuit.
            </p>
          )}
          {selectedDriverId && (
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Driver selected: {driversInfo.get(selectedDriverId)?.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitControls;
