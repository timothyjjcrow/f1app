import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { F1Data, F1Types } from "../services/api";

interface SeasonContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  resetToCurrentYear: () => void;
  years: number[];
  raceSchedule: F1Types.Race[];
  isLoadingSchedule: boolean;
  scheduleError: string | null;
  refreshData: () => void;
  lastUpdated: Date | null;
  dataIntegrityStatus: "valid" | "invalid" | "unknown";
  isFutureSeason: boolean;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const useSeasonContext = () => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeasonContext must be used within a SeasonProvider");
  }
  return context;
};

interface SeasonProviderProps {
  children: ReactNode;
}

export const SeasonProvider: React.FC<SeasonProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [raceSchedule, setRaceSchedule] = useState<F1Types.Race[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataIntegrityStatus, setDataIntegrityStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // Determine if the selected season is in the future
  const isFutureSeason = selectedYear > currentYear;

  // Generate array of years from current year back to 2000
  const years = Array.from(
    { length: currentYear - 1999 + 1 }, // +1 to include current year
    (_, index) => currentYear - index
  );

  // Function to reset to current year - useful across the app
  const resetToCurrentYear = () => {
    console.log(`Resetting to current year: ${currentYear}`);
    setSelectedYear(currentYear);
  };

  // Check if race schedule data is valid
  const validateRaceSchedule = (data: any, year: number): boolean => {
    // Check if data exists and is an object
    if (!data || typeof data !== "object") {
      console.error("Race schedule data is not an object:", data);
      return false;
    }

    // Special handling for future seasons
    const isFutureSeason = year > new Date().getFullYear();

    // Check if races property exists and is an array
    if (!Array.isArray(data.races)) {
      console.error("Race schedule races is not an array:", data);
      return false;
    }

    // For future seasons, empty race arrays are valid
    if (data.races.length === 0) {
      if (isFutureSeason) {
        console.warn(
          `Empty race schedule is expected for future season ${year}`
        );
        return true; // Consider empty valid for future seasons
      } else {
        console.warn(
          "Race schedule races array is empty (possible but unusual)"
        );
        // We'll allow this but mark it as suspicious by not returning yet
      }
    }

    // If races exist, check the structure of the first race
    if (data.races.length > 0) {
      const firstRace = data.races[0];
      if (!firstRace.season || !firstRace.round || !firstRace.raceName) {
        console.error("Race data missing required fields:", firstRace);
        return false;
      }
    }

    return true;
  };

  // Fetch race schedule for a specific year
  const fetchScheduleForYear = async (year: number) => {
    setIsLoadingSchedule(true);
    setScheduleError(null);
    try {
      console.log(`Fetching race schedule for year ${year}...`);

      // For future seasons, add a more graceful UX
      const isFutureSeason = year > new Date().getFullYear();
      if (isFutureSeason) {
        console.log(`Year ${year} is a future season - expecting empty data`);
      }

      const data = await F1Data.fetchRaceSchedule(year);

      // Validate the race schedule data
      if (validateRaceSchedule(data, year)) {
        console.log(
          `Successfully fetched race schedule for ${year}: ${data.races.length} races`
        );
        setRaceSchedule(data.races);

        // Even if empty for future seasons, consider it valid data
        setDataIntegrityStatus("valid");
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
      } else {
        setDataIntegrityStatus("invalid");
        throw new Error(`Invalid race schedule data for year ${year}`);
      }
    } catch (err) {
      console.error(`Error fetching race schedule for year ${year}:`, err);

      // Special handling for future seasons
      if (year > new Date().getFullYear()) {
        console.log(`Setting empty race schedule for future year ${year}`);
        setScheduleError(
          `No race schedule available yet for the ${year} season. The schedule will be available when it's officially released.`
        );
        setRaceSchedule([]);
        setDataIntegrityStatus("valid"); // Consider it valid but empty
      } else {
        setScheduleError(
          `Failed to fetch race schedule for ${year}. ${
            err instanceof Error ? err.message : ""
          }`
        );
        setRaceSchedule([]);
        setDataIntegrityStatus("invalid");

        // Implement retry logic for network failures
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying fetch schedule (attempt ${
              retryCount + 1
            } of ${MAX_RETRIES})...`
          );
          setRetryCount((prevCount) => prevCount + 1);
          // Retry after a delay (exponential backoff)
          setTimeout(() => {
            fetchScheduleForYear(year);
          }, 1000 * Math.pow(2, retryCount));
        }
      }
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    setRetryCount(0); // Reset retry count on manual refresh
    fetchScheduleForYear(selectedYear);
  };

  // Fetch data when the selected year changes
  useEffect(() => {
    console.log(`Year changed to ${selectedYear}, fetching new data...`);

    // Special handling for future years to prevent excessive API calls
    const currentYear = new Date().getFullYear();

    if (selectedYear > currentYear) {
      console.log(
        `${selectedYear} is a future year - applying special handling`
      );

      // For years beyond the current year, we know there's no race data yet
      // so we can avoid unnecessary API calls
      setRaceSchedule([]);
      setIsLoadingSchedule(false);
      setScheduleError(
        `No race schedule available yet for the ${selectedYear} season.`
      );
      setDataIntegrityStatus("valid"); // Consider it valid but empty
      setLastUpdated(new Date());
      return; // Skip the API call completely for future years
    }

    setRetryCount(0); // Reset retry count when year changes
    fetchScheduleForYear(selectedYear);
  }, [selectedYear]);

  const value = {
    selectedYear,
    setSelectedYear,
    resetToCurrentYear,
    years,
    raceSchedule,
    isLoadingSchedule,
    scheduleError,
    refreshData,
    lastUpdated,
    dataIntegrityStatus,
    isFutureSeason,
  };

  return (
    <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
  );
};
