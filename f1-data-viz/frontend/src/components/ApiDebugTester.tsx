import React, { useState, useEffect } from "react";
import { F1Data } from "../services/api";

interface ApiTestResult {
  endpoint: string;
  status: "success" | "failed" | "pending";
  data?: any;
  error?: string;
}

const ApiDebugTester: React.FC = () => {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRound, setSelectedRound] = useState("1");
  const [raceSchedule, setRaceSchedule] = useState<any[]>([]);

  const runEndpointTests = async () => {
    setIsLoading(true);
    setTestResults([
      { endpoint: "API Root", status: "pending" },
      { endpoint: "Test Ergast", status: "pending" },
      { endpoint: `Standings ${selectedYear}`, status: "pending" },
      { endpoint: `Schedule ${selectedYear}`, status: "pending" },
      {
        endpoint: `Results ${selectedYear}/${selectedRound}`,
        status: "pending",
      },
    ]);

    try {
      // Test API root
      try {
        await fetch("http://localhost:5001/api");
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === "API Root" ? { ...r, status: "success" } : r
          )
        );
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === "API Root"
              ? { ...r, status: "failed", error: String(error) }
              : r
          )
        );
      }

      // Test Ergast endpoint
      try {
        const ergastData = await F1Data.fetchDriverStandings();
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === "Test Ergast"
              ? { ...r, status: "success", data: ergastData }
              : r
          )
        );
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === "Test Ergast"
              ? { ...r, status: "failed", error: String(error) }
              : r
          )
        );
      }

      // Test Standings endpoint
      try {
        const standingsData = await F1Data.fetchDriverStandingsByYear(
          selectedYear
        );
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Standings ${selectedYear}`
              ? { ...r, status: "success", data: standingsData }
              : r
          )
        );
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Standings ${selectedYear}`
              ? { ...r, status: "failed", error: String(error) }
              : r
          )
        );
      }

      // Test Schedule endpoint
      try {
        const scheduleData = await F1Data.fetchRaceSchedule(selectedYear);
        // Store race schedule for round selection
        if (scheduleData && scheduleData.races) {
          setRaceSchedule(scheduleData.races);
        }
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Schedule ${selectedYear}`
              ? { ...r, status: "success", data: scheduleData }
              : r
          )
        );
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Schedule ${selectedYear}`
              ? { ...r, status: "failed", error: String(error) }
              : r
          )
        );
      }

      // Test Race Results endpoint
      try {
        const resultsData = await F1Data.fetchRaceResults(
          selectedYear,
          selectedRound
        );
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Results ${selectedYear}/${selectedRound}`
              ? { ...r, status: "success", data: resultsData }
              : r
          )
        );
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.endpoint === `Results ${selectedYear}/${selectedRound}`
              ? { ...r, status: "failed", error: String(error) }
              : r
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load race schedule separately for round selection
  const loadRaceSchedule = async (year: number) => {
    try {
      const data = await F1Data.fetchRaceSchedule(year);
      if (data && data.races) {
        setRaceSchedule(data.races);
      } else {
        setRaceSchedule([]);
      }
    } catch (error) {
      console.error("Failed to load race schedule:", error);
      setRaceSchedule([]);
    }
  };

  // Run tests on initial render
  useEffect(() => {
    runEndpointTests();
  }, []);

  // Load race schedule when year changes
  useEffect(() => {
    loadRaceSchedule(selectedYear);
  }, [selectedYear]);

  return (
    <div className="f1-card">
      <h2 className="f1-card-title">API Debug Tools</h2>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="year-select" className="whitespace-nowrap">
          Test Year:
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="f1-select"
          disabled={isLoading}
        >
          {Array.from(
            { length: 10 },
            (_, i) => new Date().getFullYear() - i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <label htmlFor="round-select" className="whitespace-nowrap ml-4">
          Round:
        </label>
        <select
          id="round-select"
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="f1-select"
          disabled={isLoading || raceSchedule.length === 0}
        >
          {raceSchedule.length > 0 ? (
            raceSchedule.map((race) => (
              <option key={race.round} value={race.round}>
                {race.round}: {race.raceName}
              </option>
            ))
          ) : (
            <option value="1">Round 1</option>
          )}
        </select>

        <button
          onClick={runEndpointTests}
          disabled={isLoading}
          className="f1-button ml-2"
        >
          {isLoading ? "Testing..." : "Run Tests"}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-2 text-blue-400 underline"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      <div className="f1-data-container">
        <h3 className="font-bold mb-2">Endpoint Test Results</h3>
        <div className="overflow-x-auto">
          <table className="f1-table w-full">
            <thead className="f1-table-header">
              <tr>
                <th className="f1-table-cell text-left">Endpoint</th>
                <th className="f1-table-cell text-left">Status</th>
                <th className="f1-table-cell text-left">Result</th>
                <th className="f1-table-cell text-left">Data Points</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} className="f1-table-row">
                  <td className="f1-table-cell">{result.endpoint}</td>
                  <td className="f1-table-cell">
                    {result.status === "success" && (
                      <span className="text-green-500">✅ Success</span>
                    )}
                    {result.status === "failed" && (
                      <span className="text-red-500">❌ Failed</span>
                    )}
                    {result.status === "pending" && (
                      <span className="text-yellow-500">⏳ Pending</span>
                    )}
                  </td>
                  <td className="f1-table-cell">
                    {result.status === "failed" && (
                      <div className="text-red-400">{result.error}</div>
                    )}
                    {result.status === "success" && (
                      <div className="text-green-400">OK</div>
                    )}
                  </td>
                  <td className="f1-table-cell">
                    {result.status === "success" && result.data && (
                      <div>
                        {result.endpoint.includes("Standings") &&
                          result.data.standings && (
                            <span>{result.data.standings.length} drivers</span>
                          )}
                        {result.endpoint.includes("Schedule") &&
                          result.data.races && (
                            <span>{result.data.races.length} races</span>
                          )}
                        {result.endpoint.includes("Results") &&
                          result.data.results && (
                            <span>{result.data.results.length} results</span>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Response Details</h3>
            {testResults
              .filter((r) => r.status === "success" && r.data)
              .map((result, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold mb-1">{result.endpoint}</h4>
                  <div className="bg-slate-900 p-2 rounded font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                </div>
              ))}

            {testResults
              .filter((r) => r.status === "failed" && r.error)
              .map((result, index) => (
                <div key={index} className="mb-4">
                  <h4 className="font-semibold mb-1 text-red-400">
                    {result.endpoint} Error
                  </h4>
                  <div className="bg-red-900/50 p-2 rounded font-mono text-xs text-red-200 overflow-x-auto">
                    <pre>{result.error}</pre>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-slate-800 rounded-md">
          <h3 className="font-bold mb-2">Data Flow Diagnosis</h3>
          <p className="mb-2">
            API Connection Status:{" "}
            {testResults.some((r) => r.status === "success") ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
          </p>
          <p className="mb-2">
            API Data Integrity:{" "}
            {testResults.every((r) => r.status === "success") ? (
              <span className="text-green-400">Healthy</span>
            ) : (
              <span className="text-yellow-400">Partial Issues</span>
            )}
          </p>
          <p className="text-sm text-slate-400 mt-4">
            * This tool helps diagnose API connectivity issues by testing direct
            calls to backend endpoints. If these tests pass but the app isn't
            displaying data, check the component implementation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugTester;
