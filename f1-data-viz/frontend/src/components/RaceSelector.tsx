import React from "react";
import { useSeasonContext } from "../contexts/SeasonContext";
import { useRaceResultsContext } from "../contexts/RaceResultsContext";

const RaceSelector: React.FC = () => {
  const {
    raceSchedule,
    isLoadingSchedule,
    scheduleError,
    dataIntegrityStatus: scheduleIntegrityStatus,
  } = useSeasonContext();

  const {
    selectedRound,
    setSelectedRound,
    isLoadingResults,
    dataIntegrityStatus: resultsIntegrityStatus,
  } = useRaceResultsContext();

  const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRound(e.target.value);
  };

  // Ensure raceSchedule is an array and not undefined
  const hasRaces = Array.isArray(raceSchedule) && raceSchedule.length > 0;
  const isLoading = isLoadingSchedule || isLoadingResults;
  const hasError = !!scheduleError || scheduleIntegrityStatus === "invalid";

  return (
    <div className="mb-4">
      <label htmlFor="round-select" className="f1-select-label">
        Select Race:
      </label>
      <div className="flex gap-2 items-center">
        <select
          id="round-select"
          value={selectedRound}
          onChange={handleRoundChange}
          className={`f1-select ${hasError ? "border-red-500" : ""}`}
          disabled={isLoading || !hasRaces}
        >
          <option value="">Select a race...</option>
          {hasRaces &&
            raceSchedule.map((race) => (
              <option key={race.round} value={race.round}>
                Round {race.round}: {race.raceName} ({race.date})
              </option>
            ))}
        </select>

        {isLoadingSchedule && (
          <span className="text-yellow-400 text-sm animate-pulse">
            Loading races...
          </span>
        )}
      </div>

      {/* Error states */}
      {scheduleError && (
        <div className="text-red-400 text-sm mt-1">Error: {scheduleError}</div>
      )}

      {!isLoadingSchedule && !hasRaces && !scheduleError && (
        <div className="text-yellow-400 text-sm mt-1">
          No races found for this season. Try selecting a different year.
        </div>
      )}

      {/* Data integrity warning */}
      {scheduleIntegrityStatus === "invalid" && (
        <div className="text-red-400 text-sm mt-1">
          Warning: Race schedule data may be incomplete or invalid.
        </div>
      )}
    </div>
  );
};

export default RaceSelector;
