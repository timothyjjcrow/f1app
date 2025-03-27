import React from "react";
import { F1Types } from "../services/api";
import TeamColorText from "./TeamColorText";

interface RaceResultsTableProps {
  results: F1Types.RaceResult[] | undefined | null;
  raceName: string;
  season: string | number;
  round: string | number;
}

const RaceResultsTable: React.FC<RaceResultsTableProps> = ({
  results,
  raceName,
  season,
  round,
}) => {
  // Ensure results is an array
  const hasResults = Array.isArray(results) && results.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-400">No results available for this race</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-bold mb-2">
        Race Results: {raceName || "Unknown Race"} - Round {round || "?"} of{" "}
        {season || "Unknown Season"}
      </h3>
      <table className="f1-table">
        <thead className="f1-table-header">
          <tr>
            <th className="f1-table-cell text-left">Pos</th>
            <th className="f1-table-cell text-left">Driver</th>
            <th className="f1-table-cell text-left">Constructor</th>
            <th className="f1-table-cell text-right">Grid</th>
            <th className="f1-table-cell text-right">Laps</th>
            <th className="f1-table-cell text-left">Time/Status</th>
            <th className="f1-table-cell text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {results
            .map((result) => {
              // Skip invalid results
              if (!result || !result.Driver || !result.Constructor) {
                console.warn("Invalid race result found", result);
                return null;
              }

              const hasFastestLap = result?.FastestLap?.rank === "1";
              const gridChange = getGridChange(result.position, result.grid);

              return (
                <tr
                  key={`${result.position}-${result.Driver.driverId}`}
                  className="f1-table-row"
                >
                  <td className="f1-table-cell text-left font-medium">
                    {result.position || "-"}
                  </td>
                  <td className="f1-table-cell text-left">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {result.Driver.givenName || ""}{" "}
                          {result.Driver.familyName || "Unknown Driver"}
                        </span>
                        {hasFastestLap && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-purple-900 text-purple-200 rounded">
                            FL
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-400">
                        {result.Driver.code ||
                          (result.Driver.familyName &&
                            result.Driver.familyName
                              .substring(0, 3)
                              .toUpperCase()) ||
                          "UNK"}
                      </span>
                    </div>
                  </td>
                  <td className="f1-table-cell text-left">
                    <TeamColorText teamName={result.Constructor.name || ""}>
                      {result.Constructor.name || "Unknown Team"}
                    </TeamColorText>
                  </td>
                  <td className="f1-table-cell text-right">
                    <div className="flex items-center justify-end">
                      {formatGridPosition(result.grid)}
                      {gridChange !== null && (
                        <span
                          className={`ml-1 text-xs ${
                            gridChange > 0
                              ? "text-green-400"
                              : gridChange < 0
                              ? "text-red-400"
                              : ""
                          }`}
                        >
                          {gridChange > 0 ? `+${gridChange}` : gridChange}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="f1-table-cell text-right">
                    {result.laps || "-"}
                  </td>
                  <td className="f1-table-cell text-left">
                    {result.Time ? (
                      <span>{result.Time.time}</span>
                    ) : (
                      <span className="text-slate-400">
                        {formatStatus(result.status || "Unknown")}
                      </span>
                    )}
                    {hasFastestLap && result.FastestLap?.Time?.time && (
                      <div className="text-xs text-purple-400 mt-1">
                        Fastest: {result.FastestLap.Time.time}
                      </div>
                    )}
                  </td>
                  <td className="f1-table-cell text-right font-medium">
                    {result.points && parseInt(result.points) > 0
                      ? result.points
                      : "-"}
                  </td>
                </tr>
              );
            })
            .filter(Boolean)}
        </tbody>
      </table>
    </div>
  );
};

// Format grid position
const formatGridPosition = (grid: string | undefined): string => {
  if (!grid) return "-";
  if (grid === "0") return "PIT";
  return grid;
};

// Calculate grid change
const getGridChange = (
  finishPos: string | undefined,
  startPos: string | undefined
): number | null => {
  if (!finishPos || !startPos) return null;
  if (startPos === "0") return null; // Started from pit lane

  const finish = parseInt(finishPos);
  const start = parseInt(startPos);

  if (isNaN(finish) || isNaN(start)) return null;

  return start - finish;
};

// Format status for non-finishers
const formatStatus = (status: string): string => {
  // Common abbreviations for statuses
  if (!status) return "Unknown";
  if (status === "Finished") return "Finished";
  if (status.includes("Accident")) return "Accident";
  if (status.includes("Engine")) return "Engine";
  if (status.includes("Gearbox")) return "Gearbox";
  if (status.includes("Hydraulics")) return "Hydraulics";
  if (status.includes("Brakes")) return "Brakes";
  if (status.includes("Suspension")) return "Suspension";
  if (status.includes("Electrical")) return "Electrical";
  if (status.includes("Power")) return "Power Unit";
  if (status.includes("Collision")) return "Collision";
  if (status.includes("Disqualified")) return "DSQ";
  if (status.includes("Retired")) return "Retired";

  return status;
};

export default RaceResultsTable;
