import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { F1Data, F1Types } from "../services/api";
import { useSeasonContext } from "./SeasonContext";

interface RaceResultsContextType {
  selectedRound: string;
  setSelectedRound: (round: string) => void;
  raceResults: F1Types.RaceResultsResponse | null;
  allRaceResults: Record<string, F1Types.RaceResultsResponse>;
  isLoadingResults: boolean;
  resultsError: string | null;
  lastUpdated: Date | null;
  dataIntegrityStatus: "valid" | "invalid" | "unknown";
  refreshResults: () => void;
  fetchAllResults: () => Promise<void>;
}

const RaceResultsContext = createContext<RaceResultsContextType | undefined>(
  undefined
);

export const useRaceResultsContext = () => {
  const context = useContext(RaceResultsContext);
  if (context === undefined) {
    throw new Error(
      "useRaceResultsContext must be used within a RaceResultsProvider"
    );
  }
  return context;
};

interface RaceResultsProviderProps {
  children: ReactNode;
}

export const RaceResultsProvider: React.FC<RaceResultsProviderProps> = ({
  children,
}) => {
  const { selectedYear, isFutureSeason } = useSeasonContext();

  const [selectedRound, setSelectedRound] = useState<string>("");
  const [raceResults, setRaceResults] =
    useState<F1Types.RaceResultsResponse | null>(null);
  const [allRaceResults, setAllRaceResults] = useState<
    Record<string, F1Types.RaceResultsResponse>
  >({});
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataIntegrityStatus, setDataIntegrityStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // Reset selected round when year changes
  useEffect(() => {
    console.log(`Year changed to ${selectedYear}, resetting selected round`);
    setSelectedRound("");
    setRaceResults(null);
    setAllRaceResults({});
    setResultsError(null);
    setDataIntegrityStatus("unknown");

    // Fetch all results for the new year
    fetchAllResults();
  }, [selectedYear]);

  // Validate race results data
  const validateRaceResults = (
    data: any,
    year: number,
    round: string
  ): boolean => {
    // Check if this is a future race by comparing to current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const isFutureYear = year > currentYear;

    // We can't determine if it's a future race within the current year without race date
    // So we'll be more lenient if it's at least the current year

    // Check if data exists and is an object
    if (!data || typeof data !== "object") {
      console.error("Race results data is not an object:", data);
      return false;
    }

    // Check basic required fields
    if (!data.season || !data.round || !data.raceName) {
      console.error("Race results missing required metadata fields:", data);
      return false;
    }

    // Check if results property exists and is an array
    if (!Array.isArray(data.results)) {
      console.error("Race results is not an array:", data);
      return false;
    }

    // For future races/seasons, empty results arrays are acceptable
    if (data.results.length === 0) {
      if (isFutureYear) {
        console.log(
          `Empty race results is expected for future race in season ${year}, round ${round}`
        );
        return true; // Consider empty valid for future races
      }
      console.warn("Race results array is empty (possible but unusual)");
      // We'll allow this but mark it as suspicious by not returning yet
    }

    // If results exist, check the structure of the first result
    if (data.results.length > 0) {
      const firstResult = data.results[0];
      if (
        !firstResult.position ||
        !firstResult.Driver ||
        !firstResult.Constructor
      ) {
        console.error("Race result missing required fields:", firstResult);
        return false;
      }
    }

    return true;
  };

  // Fetch race results for a specific year and round
  const fetchResultsForRace = async (year: number, round: string) => {
    if (!round) return;

    setIsLoadingResults(true);
    setResultsError(null);
    try {
      console.log(`Fetching race results for year ${year}, round ${round}...`);
      const data = await F1Data.fetchRaceResults(year, round);

      // Check if this is likely a future race
      const isFutureYear = year > new Date().getFullYear();

      // Validate the race results data
      if (validateRaceResults(data, year, round)) {
        console.log(
          `Successfully fetched race results for ${year}, round ${round}: ${data.results.length} results`
        );
        setRaceResults(data);

        // Also add to allRaceResults
        setAllRaceResults((prev) => ({
          ...prev,
          [round]: data,
        }));

        setDataIntegrityStatus("valid");
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
      } else {
        setDataIntegrityStatus("invalid");
        throw new Error(
          `Invalid race results data for year ${year}, round ${round}`
        );
      }
    } catch (err) {
      console.error(
        `Error fetching race results for ${year}, round ${round}:`,
        err
      );

      // Special handling for future races/seasons
      if (year > new Date().getFullYear()) {
        setResultsError(
          `This race hasn't taken place yet. Results will be available after the ${year} season, round ${round} race is completed.`
        );
        // Create minimal race data to avoid null errors
        setRaceResults({
          season: year.toString(),
          round: round,
          raceName: `Round ${round}`,
          date: "TBD",
          circuit: {
            circuitId: `future_circuit_${round}`,
            name: "TBD",
            location: {
              locality: "",
              country: "",
            },
          },
          results: [],
        });
        setDataIntegrityStatus("valid"); // Consider it valid but empty
      } else {
        setResultsError(
          `Failed to fetch race results for ${year}, round ${round}. ${
            err instanceof Error ? err.message : ""
          }`
        );
        setRaceResults(null);
        setDataIntegrityStatus("invalid");

        // Implement retry logic for network failures
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying fetch results (attempt ${
              retryCount + 1
            } of ${MAX_RETRIES})...`
          );
          setRetryCount((prevCount) => prevCount + 1);
          // Retry after a delay (exponential backoff)
          setTimeout(() => {
            fetchResultsForRace(year, round);
          }, 1000 * Math.pow(2, retryCount));
        }
      }
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Fetch all race results for the selected year
  const fetchAllResults = async () => {
    setIsLoadingResults(true);
    try {
      console.log(`Fetching season data for ${selectedYear}...`);

      // First, check if this is a future year and we've already tried fetching
      const currentYear = new Date().getFullYear();
      if (selectedYear > currentYear) {
        console.log(
          `${selectedYear} is a future year - handling gracefully with minimal API calls`
        );
        // For future years, just set empty results and exit early to avoid unnecessary API calls
        setAllRaceResults({});
        setIsLoadingResults(false);
        return;
      }

      const seasonData = await F1Data.fetchSeason(selectedYear);

      if (
        !seasonData ||
        !seasonData.races ||
        !Array.isArray(seasonData.races)
      ) {
        console.error("Invalid season data structure:", seasonData);
        return;
      }

      console.log(`Found ${seasonData.races.length} races for ${selectedYear}`);

      // For future seasons with no races yet, return early
      if (isFutureSeason && seasonData.races.length === 0) {
        console.log(
          `No races found for future season ${selectedYear} - setting empty results`
        );
        setAllRaceResults({});
        setIsLoadingResults(false);
        return;
      }

      // Create temporary storage for results
      const results: Record<string, F1Types.RaceResultsResponse> = {};

      // Fetch results for each race, but not if we're in a future season
      // as we'll only get empty results which is a waste of API calls
      if (!isFutureSeason) {
        // Fetch ALL races instead of just the first 6
        const racesToFetch = seasonData.races;
        const totalRaces = racesToFetch.length;

        console.log(
          `Fetching results for all ${totalRaces} races in ${selectedYear}...`
        );

        // Add a small delay between requests to prevent overwhelming the API
        for (let i = 0; i < racesToFetch.length; i++) {
          const race = racesToFetch[i];
          try {
            const round = race.round;
            console.log(
              `Fetching results for race ${round} (${i + 1}/${totalRaces})...`
            );
            const data = await F1Data.fetchRaceResults(selectedYear, round);

            if (validateRaceResults(data, selectedYear, round)) {
              results[round] = data;
            }

            // Add a small delay between requests to be nice to the API
            if (i < racesToFetch.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (err) {
            console.error(
              `Error fetching results for race ${race.round}:`,
              err
            );
            // Continue with other races even if one fails
          }
        }

        console.log(
          `Completed fetching ${
            Object.keys(results).length
          }/${totalRaces} race results for ${selectedYear}`
        );
      }

      setAllRaceResults(results);
    } catch (err) {
      console.error(`Error fetching all results:`, err);
      setResultsError(
        `Failed to fetch season data. ${
          err instanceof Error ? err.message : ""
        }`
      );
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Manual refresh function
  const refreshResults = () => {
    if (selectedRound) {
      setRetryCount(0); // Reset retry count on manual refresh
      fetchResultsForRace(selectedYear, selectedRound);
    } else {
      console.warn("Cannot refresh results: No round selected");
    }
  };

  // Fetch results when the selected round changes
  useEffect(() => {
    if (selectedRound) {
      console.log(`Round changed to ${selectedRound}, fetching new results...`);
      setRetryCount(0); // Reset retry count when round changes
      fetchResultsForRace(selectedYear, selectedRound);
    } else {
      // Reset data when no round is selected
      setRaceResults(null);
    }
  }, [selectedRound, selectedYear]);

  const value = {
    selectedRound,
    setSelectedRound,
    raceResults,
    allRaceResults,
    isLoadingResults,
    resultsError,
    lastUpdated,
    dataIntegrityStatus,
    refreshResults,
    fetchAllResults,
  };

  return (
    <RaceResultsContext.Provider value={value}>
      {children}
    </RaceResultsContext.Provider>
  );
};
