import React, { useState, useEffect } from "react";
import { useSeasonContext } from "../contexts/SeasonContext";
import { useRaceResultsContext } from "../contexts/RaceResultsContext";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import ErrorBoundary from "./ErrorBoundary";
import { F1Types } from "../services/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define interface for driver data once it's processed
interface DriverData {
  name: string;
  positions: (number | null)[];
  points: (number | null)[];
  color: string;
}

// Team color mapping
const TEAM_COLORS: Record<string, string> = {
  Ferrari: "#DC0000",
  "Red Bull": "#0600EF",
  Mercedes: "#00D2BE",
  McLaren: "#FF8700",
  Alpine: "#0090FF",
  AlphaTauri: "#2B4562",
  "Aston Martin": "#006F62",
  Williams: "#005AFF",
  "Alfa Romeo": "#900000",
  "Haas F1 Team": "#FFFFFF",
  // Add more teams as needed, or use fallback colors when team not found
};

// Fallback colors for when team is not in the mapping
const FALLBACK_COLORS = [
  "#3366CC",
  "#DC3912",
  "#FF9900",
  "#109618",
  "#990099",
  "#3B3EAC",
  "#0099C6",
  "#DD4477",
  "#66AA00",
  "#B82E2E",
];

const DriverComparisonCard: React.FC = () => {
  const { selectedYear, isFutureSeason } = useSeasonContext();
  const { allRaceResults, isLoadingResults, resultsError, fetchAllResults } =
    useRaceResultsContext();

  // State for selected drivers
  const [selectedDriver1, setSelectedDriver1] = useState<string | null>(null);
  const [selectedDriver2, setSelectedDriver2] = useState<string | null>(null);

  // State for available drivers in the season
  const [availableDrivers, setAvailableDrivers] = useState<
    { id: string; name: string; team: string }[]
  >([]);

  // State for processed driver data
  const [driver1Data, setDriver1Data] = useState<DriverData | null>(null);
  const [driver2Data, setDriver2Data] = useState<DriverData | null>(null);

  // State for race names (x-axis labels)
  const [raceNames, setRaceNames] = useState<string[]>([]);

  // New state to track loading progress
  const [loadedRaceCount, setLoadedRaceCount] = useState<number>(0);
  const [totalRaceCount, setTotalRaceCount] = useState<number>(0);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAllResults();
  };

  // Trigger fetchAllResults when the component mounts or the year changes
  useEffect(() => {
    if (!isLoadingResults) {
      fetchAllResults();
    }
  }, [selectedYear]);

  // Track loading progress
  useEffect(() => {
    if (allRaceResults) {
      setLoadedRaceCount(Object.keys(allRaceResults).length);
    }
  }, [allRaceResults]);

  // Get a unique list of drivers from all race results for the selected year
  useEffect(() => {
    if (allRaceResults && !isLoadingResults) {
      // Extract unique drivers from all race results
      const driversMap = new Map();

      Object.values(allRaceResults).forEach((raceResult) => {
        if (raceResult && raceResult.results) {
          raceResult.results.forEach((result: F1Types.RaceResult) => {
            const driverId = result.Driver?.driverId;
            if (driverId && !driversMap.has(driverId)) {
              driversMap.set(driverId, {
                id: driverId,
                name: `${result.Driver?.givenName} ${result.Driver?.familyName}`,
                team: result.Constructor?.name || "Unknown",
              });
            }
          });
        }
      });

      // Convert map to array and sort by name
      const drivers = Array.from(driversMap.values());
      drivers.sort((a, b) => a.name.localeCompare(b.name));

      setAvailableDrivers(drivers);

      // Set default selected drivers if available
      if (drivers.length >= 2 && !selectedDriver1 && !selectedDriver2) {
        setSelectedDriver1(drivers[0].id);
        setSelectedDriver2(drivers[1].id);
      }

      // Get race data and ensure it's sorted by round number
      const races = Object.values(allRaceResults)
        .filter((race) => race && race.raceName)
        .sort((a, b) => {
          const roundA = parseInt(a.round);
          const roundB = parseInt(b.round);
          return roundA - roundB;
        });

      // Set race names for x-axis in correct order
      const raceNamesList = races.map((race) => race.raceName || "");
      setRaceNames(raceNamesList);

      // Update total race count for the progress indicator
      setTotalRaceCount(races.length);
    }
  }, [allRaceResults, isLoadingResults, selectedYear]);

  // Process data for the selected drivers
  useEffect(() => {
    if (allRaceResults && selectedDriver1 && selectedDriver2) {
      // Process data for driver 1
      const driver1 = availableDrivers.find((d) => d.id === selectedDriver1);
      const driver2 = availableDrivers.find((d) => d.id === selectedDriver2);

      if (driver1 && driver2) {
        // Get races in correct order by round number
        const races = Object.values(allRaceResults).sort(
          (a, b) => parseInt(a.round) - parseInt(b.round)
        );

        // Process driver 1 data
        const positions1: (number | null)[] = [];
        const points1: (number | null)[] = [];

        // Process driver 2 data
        const positions2: (number | null)[] = [];
        const points2: (number | null)[] = [];

        // Get race data
        races.forEach((race) => {
          if (race && race.results) {
            // Find driver 1 in this race
            const result1 = race.results.find(
              (r: F1Types.RaceResult) => r.Driver?.driverId === selectedDriver1
            );

            // Find driver 2 in this race
            const result2 = race.results.find(
              (r: F1Types.RaceResult) => r.Driver?.driverId === selectedDriver2
            );

            // Add data for driver 1
            if (result1) {
              positions1.push(parseInt(result1.position));
              points1.push(parseFloat(result1.points));
            } else {
              positions1.push(null); // Driver didn't participate
              points1.push(null);
            }

            // Add data for driver 2
            if (result2) {
              positions2.push(parseInt(result2.position));
              points2.push(parseFloat(result2.points));
            } else {
              positions2.push(null); // Driver didn't participate
              points2.push(null);
            }
          }
        });

        // Get team colors
        const color1 = TEAM_COLORS[driver1.team] || FALLBACK_COLORS[0];
        const color2 = TEAM_COLORS[driver2.team] || FALLBACK_COLORS[1];

        // Set processed data
        setDriver1Data({
          name: driver1.name,
          positions: positions1,
          points: points1,
          color: color1,
        });

        setDriver2Data({
          name: driver2.name,
          positions: positions2,
          points: points2,
          color: color2,
        });
      }
    }
  }, [selectedDriver1, selectedDriver2, allRaceResults, availableDrivers]);

  // Chart options
  const positionChartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      y: {
        reverse: true, // Lower position (1st) is better
        min: 1,
        title: {
          display: true,
          text: "Position",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Race Positions Comparison",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const position = context.parsed.y;
            return `${context.dataset.label}: ${position}${getPositionSuffix(
              position
            )}`;
          },
        },
      },
    },
  };

  const pointsChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: "Points",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Points Scored Per Race",
      },
    },
  };

  // Helper to get suffix for position (1st, 2nd, 3rd, etc)
  const getPositionSuffix = (pos: number): string => {
    if (pos === 1) return "st";
    if (pos === 2) return "nd";
    if (pos === 3) return "rd";
    return "th";
  };

  // Prepare chart data with proper typing
  const positionChartData = {
    labels: raceNames,
    datasets: [
      ...(driver1Data
        ? [
            {
              label: driver1Data.name,
              data: driver1Data.positions,
              borderColor: driver1Data.color,
              backgroundColor: `${driver1Data.color}33`,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false,
              tension: 0.1,
            },
          ]
        : []),
      ...(driver2Data
        ? [
            {
              label: driver2Data.name,
              data: driver2Data.positions,
              borderColor: driver2Data.color,
              backgroundColor: `${driver2Data.color}33`,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false,
              tension: 0.1,
            },
          ]
        : []),
    ],
  };

  const pointsChartData = {
    labels: raceNames,
    datasets: [
      ...(driver1Data
        ? [
            {
              label: driver1Data.name,
              data: driver1Data.points,
              backgroundColor: driver1Data.color,
              borderWidth: 1,
              borderColor: "#ffffff",
            },
          ]
        : []),
      ...(driver2Data
        ? [
            {
              label: driver2Data.name,
              data: driver2Data.points,
              backgroundColor: driver2Data.color,
              borderWidth: 1,
              borderColor: "#ffffff",
            },
          ]
        : []),
    ],
  };

  // Calculate head-to-head statistics
  const headToHeadStats = React.useMemo(() => {
    if (!driver1Data || !driver2Data) return null;

    let driver1Wins = 0;
    let driver2Wins = 0;
    let racesBothFinished = 0;

    // Compare positions where both drivers finished
    for (let i = 0; i < driver1Data.positions.length; i++) {
      const pos1 = driver1Data.positions[i];
      const pos2 = driver2Data.positions[i];

      if (pos1 !== null && pos2 !== null) {
        racesBothFinished++;
        if (pos1 < pos2) driver1Wins++;
        else if (pos2 < pos1) driver2Wins++;
      }
    }

    return {
      driver1Wins,
      driver2Wins,
      racesBothFinished,
      driver1WinPercentage:
        racesBothFinished > 0
          ? ((driver1Wins / racesBothFinished) * 100).toFixed(1)
          : "0",
      driver2WinPercentage:
        racesBothFinished > 0
          ? ((driver2Wins / racesBothFinished) * 100).toFixed(1)
          : "0",
    };
  }, [driver1Data, driver2Data]);

  return (
    <div className="f1-card">
      <div className="flex justify-between items-center">
        <h2 className="f1-card-title">Driver Head-to-Head</h2>
        <div className="flex items-center gap-4">
          {loadedRaceCount > 0 && totalRaceCount > 0 && (
            <span className="text-sm text-gray-400">
              {loadedRaceCount} of {totalRaceCount} races loaded
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoadingResults}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-1 ${
                isLoadingResults ? "animate-spin" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoadingResults ? "Loading..." : "Refresh All Races"}
          </button>
        </div>
      </div>

      <p className="f1-card-description">
        Compare two drivers' performances across all {raceNames.length} races of
        the {selectedYear} season.
      </p>

      {/* Future season notification */}
      {isFutureSeason && (
        <div className="text-blue-400 text-sm mb-4 p-2 bg-blue-900/30 rounded border border-blue-800">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              You're viewing the {selectedYear} season which hasn't started yet.
              Driver comparisons will appear when race results become available.
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator with race count */}
      {isLoadingResults && (
        <div className="text-yellow-400 text-sm mb-4 p-2 bg-yellow-900/30 rounded border border-yellow-800">
          <div className="flex items-center">
            <svg
              className="animate-spin h-4 w-4 mr-2 text-yellow-400"
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
            <span>Loading race data for {selectedYear}...</span>
          </div>
        </div>
      )}

      {/* Driver Selection */}
      {availableDrivers.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Driver 1
            </label>
            <select
              value={selectedDriver1 || ""}
              onChange={(e) => setSelectedDriver1(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-2 w-full border border-gray-700"
              disabled={isLoadingResults}
            >
              <option value="">Select Driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.team})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Driver 2
            </label>
            <select
              value={selectedDriver2 || ""}
              onChange={(e) => setSelectedDriver2(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-2 w-full border border-gray-700"
              disabled={isLoadingResults}
            >
              <option value="">Select Driver</option>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.team})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Data Display */}
      <div className="mt-4">
        {isLoadingResults && (
          <div className="f1-loading">
            <div>
              Loading race results data for all {totalRaceCount} races...
            </div>
          </div>
        )}

        {resultsError && (
          <div className="f1-error">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{resultsError}</p>
          </div>
        )}

        {!isLoadingResults &&
          !resultsError &&
          (!driver1Data || !driver2Data) && (
            <div className="f1-empty-state">
              {isFutureSeason ? (
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 mx-auto mb-4 text-blue-500 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-blue-300">
                    The {selectedYear} season hasn't started yet. Driver
                    comparisons will be available once race results are
                    available.
                  </p>
                </div>
              ) : (
                <div>
                  <p>
                    {availableDrivers.length < 2
                      ? "Not enough driver data available for comparison."
                      : "Please select two drivers to compare their performance."}
                  </p>
                </div>
              )}
            </div>
          )}

        {!isLoadingResults && !resultsError && driver1Data && driver2Data && (
          <div className="space-y-8">
            {/* Head-to-head stats */}
            {headToHeadStats && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Head-to-Head Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: `${driver1Data.color}33` }}
                  >
                    <span className="block text-2xl font-bold">
                      {headToHeadStats.driver1Wins}
                    </span>
                    <span className="block text-sm">{driver1Data.name}</span>
                  </div>
                  <div className="p-2 rounded bg-gray-700">
                    <span className="block text-2xl font-bold">
                      {headToHeadStats.racesBothFinished}
                    </span>
                    <span className="block text-sm">Races Compared</span>
                  </div>
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: `${driver2Data.color}33` }}
                  >
                    <span className="block text-2xl font-bold">
                      {headToHeadStats.driver2Wins}
                    </span>
                    <span className="block text-sm">{driver2Data.name}</span>
                  </div>
                </div>
                <div className="mt-3 h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-l-full"
                    style={{
                      width: `${headToHeadStats.driver1WinPercentage}%`,
                      backgroundColor: driver1Data.color,
                      float: "left",
                    }}
                  ></div>
                  <div
                    className="h-full rounded-r-full"
                    style={{
                      width: `${headToHeadStats.driver2WinPercentage}%`,
                      backgroundColor: driver2Data.color,
                      float: "right",
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>{headToHeadStats.driver1WinPercentage}%</span>
                  <span>{headToHeadStats.driver2WinPercentage}%</span>
                </div>
              </div>
            )}

            {/* Position chart */}
            <div className="bg-gray-800 rounded-lg p-4">
              <ErrorBoundary componentName="Position Chart">
                <Line data={positionChartData} options={positionChartOptions} />
              </ErrorBoundary>
            </div>

            {/* Points chart */}
            <div className="bg-gray-800 rounded-lg p-4">
              <ErrorBoundary componentName="Points Chart">
                <Bar data={pointsChartData} options={pointsChartOptions} />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverComparisonCard;
