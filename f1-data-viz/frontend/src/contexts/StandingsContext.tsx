import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { F1Data, F1Types } from "../services/api";
import { useSeasonContext } from "./SeasonContext";

interface StandingsContextType {
  standingsData: F1Types.DriverStanding[] | null;
  isLoadingStandings: boolean;
  standingsError: string | null;
  refreshStandings: () => void;
  activeView: "table" | "chart";
  setActiveView: (view: "table" | "chart") => void;
  lastUpdated: Date | null;
  dataIntegrityStatus: "valid" | "invalid" | "unknown";
}

const StandingsContext = createContext<StandingsContextType | undefined>(
  undefined
);

export const useStandingsContext = () => {
  const context = useContext(StandingsContext);
  if (context === undefined) {
    throw new Error(
      "useStandingsContext must be used within a StandingsProvider"
    );
  }
  return context;
};

interface StandingsProviderProps {
  children: ReactNode;
}

export const StandingsProvider: React.FC<StandingsProviderProps> = ({
  children,
}) => {
  const { selectedYear, isFutureSeason } = useSeasonContext();

  const [yearlyDriverData, setYearlyDriverData] =
    useState<F1Types.YearDriverStandingsResponse | null>(null);
  const [isLoadingStandings, setIsLoadingStandings] = useState<boolean>(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"table" | "chart">("table");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataIntegrityStatus, setDataIntegrityStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  // Validate driver standings data
  const validateStandingsData = (data: any, year: number): boolean => {
    // Check if this is a future season using the context value instead of direct check
    const isFuture = isFutureSeason;

    // Check if data exists and is an object
    if (!data || typeof data !== "object") {
      console.error("Driver standings data is not an object:", data);
      return false;
    }

    // Check if season property exists
    if (!data.season) {
      console.error("Driver standings missing season field:", data);
      return false;
    }

    // Check if standings property exists and is an array
    if (!Array.isArray(data.standings)) {
      console.error("Driver standings is not an array:", data);
      return false;
    }

    // For future seasons, empty standings arrays are valid
    if (data.standings.length === 0) {
      if (isFuture) {
        console.log(
          `Empty driver standings is expected for future season ${year}`
        );
        return true; // Consider empty valid for future seasons
      }
      console.warn(
        "Driver standings array is empty (possible but unusual for completed seasons)"
      );
      // We'll allow this but mark it as suspicious by not returning yet
    }

    // If standings exist, check the structure of the first item
    if (data.standings.length > 0) {
      const firstStanding = data.standings[0];
      if (
        !firstStanding.position ||
        !firstStanding.Driver ||
        !Array.isArray(firstStanding.Constructors)
      ) {
        console.error(
          "Driver standing missing required fields:",
          firstStanding
        );
        return false;
      }
    }

    return true;
  };

  // Fetch data for a specific year
  const fetchDataForYear = async (year: number) => {
    setIsLoadingStandings(true);
    setStandingsError(null);
    try {
      console.log(`Fetching driver standings for year ${year}...`);
      const data = await F1Data.fetchDriverStandingsByYear(year);

      // Validate the driver standings data
      if (validateStandingsData(data, year)) {
        console.log(
          `Successfully fetched driver standings for ${year}: ${
            data.standings?.length || 0
          } drivers`
        );
        setYearlyDriverData(data);
        setDataIntegrityStatus("valid");
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
      } else {
        setDataIntegrityStatus("invalid");
        throw new Error(`Invalid driver standings data for year ${year}`);
      }
    } catch (err) {
      console.error(`Error fetching data for year ${year}:`, err);

      // Special handling for future seasons
      if (year > new Date().getFullYear()) {
        setStandingsError(
          `No driver standings available yet for the ${year} season. Check back when the season starts.`
        );
        // Set empty data but mark as valid for future season
        setYearlyDriverData({
          season: year.toString(),
          standings: [],
        });
        setDataIntegrityStatus("valid"); // Consider it valid but empty
      } else {
        setStandingsError(
          `Failed to fetch F1 data for the year ${year}. ${
            err instanceof Error
              ? err.message
              : "Please make sure your backend server is running."
          }`
        );
        setYearlyDriverData(null);
        setDataIntegrityStatus("invalid");

        // Implement retry logic for network failures
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying fetch standings (attempt ${
              retryCount + 1
            } of ${MAX_RETRIES})...`
          );
          setRetryCount((prevCount) => prevCount + 1);
          // Retry after a delay (exponential backoff)
          setTimeout(() => {
            fetchDataForYear(year);
          }, 1000 * Math.pow(2, retryCount));
        }
      }
    } finally {
      setIsLoadingStandings(false);
    }
  };

  // Refresh standings data
  const refreshStandings = () => {
    setRetryCount(0); // Reset retry count on manual refresh
    fetchDataForYear(selectedYear);
  };

  // Fetch data when the selected year changes
  useEffect(() => {
    console.log(
      `Year changed to ${selectedYear}, fetching new driver standings...`
    );
    setRetryCount(0); // Reset retry count when year changes
    fetchDataForYear(selectedYear);
  }, [selectedYear]);

  const value = {
    standingsData: yearlyDriverData?.standings || null,
    isLoadingStandings,
    standingsError,
    refreshStandings,
    activeView,
    setActiveView,
    lastUpdated,
    dataIntegrityStatus,
  };

  return (
    <StandingsContext.Provider value={value}>
      {children}
    </StandingsContext.Provider>
  );
};
