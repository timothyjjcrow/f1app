import React, { useState, useEffect } from "react";
import { F1Data, F1Types } from "../services/api";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
  dataPreview?: any;
}

const DataLoadTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();

  const runTests = async () => {
    setIsRunning(true);
    setResults([
      { name: "API Connectivity", status: "pending" },
      { name: "Current Year Standings", status: "pending" },
      { name: "Current Year Schedule", status: "pending" },
      { name: "Last Race Results", status: "pending" },
    ]);

    // Test 1: API connectivity
    try {
      const response = await fetch("http://localhost:5001/api");
      if (response.ok) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === "API Connectivity"
              ? { ...r, status: "success", message: "API is reachable" }
              : r
          )
        );
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      setResults((prev) =>
        prev.map((r) =>
          r.name === "API Connectivity"
            ? { ...r, status: "error", message: `API not reachable: ${error}` }
            : r
        )
      );
      setIsRunning(false);
      return; // Stop tests if API is not reachable
    }

    // Test 2: Current year standings
    try {
      const standingsData = await F1Data.fetchDriverStandingsByYear(
        currentYear
      );
      const hasStandings =
        standingsData &&
        "standings" in standingsData &&
        Array.isArray(standingsData.standings) &&
        standingsData.standings.length > 0;

      if (hasStandings) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === "Current Year Standings"
              ? {
                  ...r,
                  status: "success",
                  message: `${standingsData.standings.length} drivers found`,
                  dataPreview: {
                    first: standingsData.standings[0],
                    count: standingsData.standings.length,
                  },
                }
              : r
          )
        );
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.name === "Current Year Standings"
              ? { ...r, status: "error", message: "No standings data found" }
              : r
          )
        );
      }
    } catch (error) {
      setResults((prev) =>
        prev.map((r) =>
          r.name === "Current Year Standings"
            ? {
                ...r,
                status: "error",
                message: `Error loading standings: ${error}`,
              }
            : r
        )
      );
    }

    // Test 3: Current year schedule
    try {
      const scheduleData = await F1Data.fetchRaceSchedule(currentYear);
      const hasRaces =
        scheduleData &&
        "races" in scheduleData &&
        Array.isArray(scheduleData.races) &&
        scheduleData.races.length > 0;

      if (hasRaces) {
        setResults((prev) =>
          prev.map((r) =>
            r.name === "Current Year Schedule"
              ? {
                  ...r,
                  status: "success",
                  message: `${scheduleData.races.length} races found`,
                  dataPreview: {
                    first: scheduleData.races[0],
                    count: scheduleData.races.length,
                  },
                }
              : r
          )
        );

        // If schedule loaded successfully, attempt to load last race results
        try {
          // Find the latest completed race
          const now = new Date();
          const pastRaces = scheduleData.races.filter((race) => {
            const raceDate = new Date(
              `${race.date}T${race.time || "00:00:00Z"}`
            );
            return raceDate < now;
          });

          if (pastRaces.length > 0) {
            const lastRace = pastRaces[pastRaces.length - 1];
            const resultsData = await F1Data.fetchRaceResults(
              currentYear,
              lastRace.round
            );

            const hasResults =
              resultsData &&
              "results" in resultsData &&
              Array.isArray(resultsData.results) &&
              resultsData.results.length > 0;

            if (hasResults) {
              setResults((prev) =>
                prev.map((r) =>
                  r.name === "Last Race Results"
                    ? {
                        ...r,
                        status: "success",
                        message: `${resultsData.results.length} results for ${lastRace.raceName}`,
                        dataPreview: {
                          race: lastRace.raceName,
                          round: lastRace.round,
                          winner: resultsData.results[0],
                          count: resultsData.results.length,
                        },
                      }
                    : r
                )
              );
            } else {
              setResults((prev) =>
                prev.map((r) =>
                  r.name === "Last Race Results"
                    ? {
                        ...r,
                        status: "error",
                        message: "No results found for the last race",
                      }
                    : r
                )
              );
            }
          } else {
            setResults((prev) =>
              prev.map((r) =>
                r.name === "Last Race Results"
                  ? {
                      ...r,
                      status: "error",
                      message: "No past races found in schedule",
                    }
                  : r
              )
            );
          }
        } catch (error) {
          setResults((prev) =>
            prev.map((r) =>
              r.name === "Last Race Results"
                ? {
                    ...r,
                    status: "error",
                    message: `Error loading race results: ${error}`,
                  }
                : r
            )
          );
        }
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.name === "Current Year Schedule"
              ? { ...r, status: "error", message: "No race schedule found" }
              : r
          )
        );
        // Mark last race results as error since we can't test without schedule
        setResults((prev) =>
          prev.map((r) =>
            r.name === "Last Race Results"
              ? {
                  ...r,
                  status: "error",
                  message: "Cannot test: No race schedule available",
                }
              : r
          )
        );
      }
    } catch (error) {
      setResults((prev) =>
        prev.map((r) =>
          r.name === "Current Year Schedule"
            ? {
                ...r,
                status: "error",
                message: `Error loading schedule: ${error}`,
              }
            : r
        )
      );
      // Mark last race results as error since we can't test without schedule
      setResults((prev) =>
        prev.map((r) =>
          r.name === "Last Race Results"
            ? {
                ...r,
                status: "error",
                message: "Cannot test: Schedule load failed",
              }
            : r
        )
      );
    }

    setIsRunning(false);
  };

  // Run tests on component mount
  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="mt-4 p-4 bg-slate-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Data Load Diagnostics</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run Diagnostic"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-md ${
              result.status === "success"
                ? "bg-green-900/30 border border-green-800"
                : result.status === "error"
                ? "bg-red-900/30 border border-red-800"
                : "bg-gray-800 border border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {result.status === "pending" && (
                  <span className="mr-2 h-4 w-4 rounded-full bg-gray-500 animate-pulse"></span>
                )}
                {result.status === "success" && (
                  <span className="mr-2 text-green-500">✓</span>
                )}
                {result.status === "error" && (
                  <span className="mr-2 text-red-500">✗</span>
                )}
                <span className="font-medium">{result.name}</span>
              </div>
              <span
                className={`text-sm ${
                  result.status === "success"
                    ? "text-green-400"
                    : result.status === "error"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {result.message || "Testing..."}
              </span>
            </div>

            {isExpanded && result.dataPreview && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="text-xs font-mono bg-black/30 p-2 rounded overflow-x-auto">
                  <pre>{JSON.stringify(result.dataPreview, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        <p>
          If diagnostic tests fail but API endpoints are successful, there may
          be an issue with how components consume the data.
        </p>
      </div>
    </div>
  );
};

export default DataLoadTest;
