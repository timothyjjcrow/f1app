import React, { useEffect, useState } from "react";
import { useSeasonContext } from "../contexts/SeasonContext";
import { useStandingsContext } from "../contexts/StandingsContext";
import DriverStandingsTable from "./DriverStandingsTable";
import DriverStandingsChart from "./DriverStandingsChart";
import SeasonSelector from "./SeasonSelector";
import ViewToggle from "./ViewToggle";
import ErrorBoundary from "./ErrorBoundary";
import { F1Types } from "../services/api";

const DriverStandingsCard: React.FC = () => {
  const { selectedYear, refreshData, isFutureSeason, setSelectedYear } =
    useSeasonContext();
  const {
    standingsData,
    isLoadingStandings,
    standingsError,
    activeView,
    dataIntegrityStatus,
    lastUpdated,
    refreshStandings,
  } = useStandingsContext();

  // Track if user has selected a year
  const [yearSelected, setYearSelected] = useState(false);

  // Simple counter for refresh button
  const [count, setCount] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Animation state for content
  const [animateContent, setAnimateContent] = React.useState(false);

  // Available years for selection (current year down to 1950)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 1950 + 1 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    // Trigger animation when component mounts or data changes
    setAnimateContent(true);

    // Reset animation state if needed for future animations
    return () => setAnimateContent(false);
  }, [standingsData]);

  // Check if user has actually selected a year (not just the default)
  useEffect(() => {
    if (selectedYear && selectedYear !== currentYear) {
      setYearSelected(true);
    }
  }, [selectedYear, currentYear]);

  const handleRefresh = () => {
    setCount((prevCount) => prevCount + 1);
    setIsRefreshing(true);

    if (refreshStandings) {
      refreshStandings();
    } else {
      refreshData();
    }

    // Reset refreshing state after animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setYearSelected(true);
  };

  // Type-safe access to standings
  const driverStandings =
    standingsData && Array.isArray(standingsData)
      ? standingsData
      : standingsData &&
        "standings" in standingsData &&
        Array.isArray((standingsData as any).standings)
      ? ((standingsData as any).standings as F1Types.DriverStanding[])
      : [];

  // Check if standings data is valid
  const hasValidData =
    standingsData &&
    (Array.isArray(standingsData) ||
      ("standings" in standingsData &&
        Array.isArray((standingsData as any).standings))) &&
    (driverStandings.length > 0 || isFutureSeason); // Consider empty arrays valid for future seasons

  // Determine if we should show table/chart or empty state for future season
  const shouldShowTableOrChart =
    hasValidData && (!isFutureSeason || driverStandings.length > 0);

  // Year selection screen
  if (!yearSelected) {
    return (
      <div className="w-full animate-scale-in p-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-red-500 bg-clip-text text-transparent mb-6">
            F1 Driver Standings
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Select a season to view the Formula 1 Driver Championship standings
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-10 shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-8 text-center">
            Select Season
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className="py-5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xl font-medium transition-colors shadow-md hover:shadow-lg hover:scale-105 transform duration-200"
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main component view (after year selection)
  return (
    <div className="w-full animate-scale-in p-6">
      <div className="f1-card shadow-f1-card hover:shadow-f1-glow transition-shadow duration-300 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="f1-card-title text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Driver Standings {selectedYear}
          </h2>
          <div className="flex gap-4">
            <div className="w-48">
              <ErrorBoundary componentName="Season Selector">
                <SeasonSelector />
              </ErrorBoundary>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoadingStandings}
              className={`text-blue-400 hover:text-blue-300 flex items-center bg-slate-700/70 px-3 py-2 rounded-lg transition-all hover:bg-slate-700 shadow-sm ${
                isRefreshing ? "animate-pulse" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
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
          </div>
        </div>

        <p className="f1-card-description text-lg">
          Visualize F1 driver standings for the{" "}
          <span className="text-blue-400 font-semibold">{selectedYear}</span>{" "}
          season fetched from the Ergast API.
        </p>

        {/* Future season notification */}
        {isFutureSeason && (
          <div className="text-blue-400 mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800 shadow-md backdrop-blur-xs animate-slide-in">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 text-blue-300"
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
              <span className="text-lg">
                You're viewing the {selectedYear} season which hasn't started
                yet. Driver standings will appear when the season begins.
              </span>
            </div>
          </div>
        )}

        {/* Data integrity status */}
        {dataIntegrityStatus === "invalid" && (
          <div className="text-yellow-500 mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-800 shadow-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3"
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
              <span>
                Warning: The data may be incomplete or invalid. Please try
                refreshing or check back later.
              </span>
            </div>
          </div>
        )}

        {/* Last updated info */}
        {lastUpdated && (
          <div className="text-slate-400 mb-6 text-sm flex items-center">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* View Toggle Tabs */}
        <ErrorBoundary componentName="View Toggle">
          <ViewToggle />
        </ErrorBoundary>

        {/* Data Display Section */}
        <div className={`mt-6 ${animateContent ? "animate-scale-in" : ""}`}>
          {isLoadingStandings && (
            <div className="f1-loading">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-10 w-10 mb-4 text-blue-500"
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
                Loading F1 driver standings...
              </div>
            </div>
          )}

          {standingsError && (
            <div className="f1-error animate-pulse-glow">
              <h3 className="font-bold text-xl mb-4">Error</h3>
              <p>{standingsError}</p>
              <button
                onClick={handleRefresh}
                className="mt-5 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoadingStandings && !standingsError && !hasValidData && (
            <div className="f1-empty-state">
              {isFutureSeason ? (
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 mx-auto mb-6 text-blue-500 opacity-50"
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
                  <p className="text-blue-300 text-xl">
                    The {selectedYear} season hasn't started yet. Driver
                    standings will be available once racing begins.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl mb-4">
                    No standings data available for the {selectedYear} season.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
                  >
                    Reload Data
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLoadingStandings && !standingsError && hasValidData && (
            <>
              {/* For future seasons with empty data, show the empty state message */}
              {isFutureSeason && driverStandings.length === 0 ? (
                <div className="f1-empty-state">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 mx-auto mb-6 text-blue-500 opacity-50"
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
                  <p className="text-blue-300 text-xl">
                    The {selectedYear} season hasn't started yet. Driver
                    standings will be available once racing begins.
                  </p>
                </div>
              ) : (
                <>
                  {activeView === "table" && (
                    <ErrorBoundary componentName="Driver Standings Table">
                      <DriverStandingsTable
                        standings={driverStandings}
                        season={selectedYear}
                      />
                    </ErrorBoundary>
                  )}

                  {activeView === "chart" && (
                    <ErrorBoundary componentName="Driver Standings Chart">
                      <DriverStandingsChart
                        standings={driverStandings}
                        season={selectedYear}
                      />
                    </ErrorBoundary>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverStandingsCard;
