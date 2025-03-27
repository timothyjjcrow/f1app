import React from "react";
import { useSeasonContext } from "../contexts/SeasonContext";
import { useRaceResultsContext } from "../contexts/RaceResultsContext";
import RaceResultsTable from "./RaceResultsTable";
import RaceSelector from "./RaceSelector";
import ErrorBoundary from "./ErrorBoundary";
import viteLogo from "/vite.svg";

const RaceResultsCard: React.FC = () => {
  const { selectedYear, isFutureSeason } = useSeasonContext();
  const {
    selectedRound,
    raceResults,
    isLoadingResults,
    resultsError,
    lastUpdated,
    dataIntegrityStatus,
    refreshResults,
  } = useRaceResultsContext();

  // Check if race data is valid and complete
  const hasRaceData =
    raceResults &&
    raceResults.raceName &&
    raceResults.circuit &&
    raceResults.results &&
    Array.isArray(raceResults.results);

  // Check if this is likely a future race
  const isFutureRace =
    isFutureSeason ||
    (raceResults && raceResults.results && raceResults.results.length === 0);

  const handleRefresh = () => {
    if (refreshResults) {
      refreshResults();
    }
  };

  return (
    <div className="f1-card">
      <div className="flex justify-between items-center">
        <h2 className="f1-card-title">Race Results</h2>
        {selectedRound && (
          <button
            onClick={handleRefresh}
            disabled={isLoadingResults}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            Refresh
          </button>
        )}
      </div>

      {/* Race Selector */}
      <ErrorBoundary componentName="Race Selector">
        <RaceSelector />
      </ErrorBoundary>

      <p className="f1-card-description">
        {selectedRound
          ? `Viewing results for Round ${selectedRound} of the ${selectedYear} season`
          : `Select a race to view its results for the ${selectedYear} season`}
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
              Race information and results will appear as they become available.
            </span>
          </div>
        </div>
      )}

      {/* Data integrity status */}
      {dataIntegrityStatus === "invalid" && (
        <div className="text-yellow-500 text-sm mb-4 p-2 bg-yellow-900/30 rounded">
          Warning: The data may be incomplete or invalid. Please try refreshing
          or check back later.
        </div>
      )}

      {/* Last updated info */}
      {lastUpdated && (
        <div className="text-gray-500 text-xs mb-4">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Race Results Section */}
      <div className="mt-4">
        {isLoadingResults && (
          <div className="f1-loading">
            <div>Loading race results...</div>
          </div>
        )}

        {resultsError && (
          <div className="f1-error">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{resultsError}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 bg-red-700 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoadingResults && !resultsError && !hasRaceData && (
          <div className="f1-empty-state">
            <img src={viteLogo} className="h-16 w-16 mb-4" alt="Vite logo" />
            <p>
              {selectedRound
                ? "No results available for this race"
                : "Select a race from the dropdown to view results"}
            </p>
          </div>
        )}

        {!isLoadingResults && !resultsError && hasRaceData && (
          <div className="f1-data-container">
            <h3 className="font-bold text-lg mb-3">
              {raceResults?.raceName || "Unknown Race"} -{" "}
              {raceResults?.date || "Unknown Date"}
            </h3>
            {raceResults?.circuit?.location && (
              <p className="text-gray-400 mb-4">
                {raceResults.circuit.name || "Unknown Circuit"},{" "}
                {raceResults.circuit.location.locality || "Unknown Locality"},{" "}
                {raceResults.circuit.location.country || "Unknown Country"}
              </p>
            )}

            {/* Future race message */}
            {isFutureRace &&
              raceResults &&
              raceResults.results &&
              raceResults.results.length === 0 && (
                <div className="bg-blue-900/30 rounded p-4 mb-4 text-blue-300 border border-blue-800">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold mb-1">Future Race</p>
                      <p>
                        This race has not yet taken place. Results will be
                        available after the race is completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Race results table */}
            <ErrorBoundary componentName="Race Results Table">
              <RaceResultsTable
                results={raceResults?.results}
                raceName={raceResults?.raceName || "Unknown Race"}
                season={raceResults?.season || selectedYear}
                round={raceResults?.round || selectedRound}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceResultsCard;
