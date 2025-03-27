import React from "react";
import { CircuitInfo } from "./CircuitTypes";

interface DebugPanelProps {
  showDebugInfo: boolean;
  selectedCircuitId: string;
  availableCircuits: string[];
  driversInfo: Map<string, any>;
  selectedDriverId: string;
  allRaceResults: Record<string, any>;
  selectedYear: number;
  isLoadingResults: boolean;
  resultsError: string | null;
  availableCircuitDetails: Record<string, CircuitInfo>;
  onSelectCircuit: (circuitId: string) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  showDebugInfo,
  selectedCircuitId,
  availableCircuits,
  driversInfo,
  selectedDriverId,
  allRaceResults,
  selectedYear,
  isLoadingResults,
  resultsError,
  availableCircuitDetails,
  onSelectCircuit,
}) => {
  if (!showDebugInfo) return null;

  return (
    <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700 text-purple-200 rounded-lg">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Circuit Data</h4>
          <pre className="text-xs bg-purple-900/50 p-2 rounded overflow-auto max-h-40">
            {`Selected Circuit: ${selectedCircuitId}
Available Circuits: ${Object.keys(availableCircuitDetails).join(", ")}
Circuits with Data: ${availableCircuits.join(", ")}
Total Drivers: ${driversInfo.size}
Selected Driver: ${selectedDriverId || "none"}`}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">API Response Data</h4>
          <pre className="text-xs bg-purple-900/50 p-2 rounded overflow-auto max-h-40">
            {`Race Results Count: ${Object.keys(allRaceResults).length}
Year: ${selectedYear}
Loading: ${isLoadingResults ? "true" : "false"}
Error: ${resultsError ? resultsError : "none"}`}
          </pre>

          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => console.log("Race Results:", allRaceResults)}
                className="bg-purple-700 text-white text-xs px-2 py-1 rounded"
              >
                Log Race Data
              </button>

              <button
                onClick={() => console.log("Drivers:", driversInfo)}
                className="bg-purple-700 text-white text-xs px-2 py-1 rounded"
              >
                Log Driver Data
              </button>

              {Object.keys(availableCircuitDetails).map((circuitId) => (
                <button
                  key={circuitId}
                  onClick={() => onSelectCircuit(circuitId)}
                  className={`${
                    selectedCircuitId === circuitId
                      ? "bg-purple-800 text-purple-200"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  } px-2 py-1 rounded text-xs`}
                >
                  Try {availableCircuitDetails[circuitId].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
