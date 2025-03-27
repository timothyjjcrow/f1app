import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

// =========================================================
// TYPES & INTERFACES
// =========================================================

/**
 * Common F1 data types shared across the application
 */
export namespace F1Types {
  // Base entity types
  export interface Driver {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
  }

  export interface Constructor {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  }

  export interface Circuit {
    circuitId: string;
    name: string;
    location: {
      country: string;
      locality: string;
    };
  }

  // Racing data types
  export interface DriverStanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: Driver;
    Constructors: Constructor[];
  }

  export interface Race {
    season: string;
    round: string;
    raceName: string;
    date: string;
    time?: string;
    circuitId: string;
    circuitName: string;
    country: string;
    locality: string;
  }

  export interface RaceResult {
    number: string;
    position: string;
    positionText: string;
    points: string;
    Driver: Driver;
    Constructor: Constructor;
    grid: string;
    laps: string;
    status: string;
    Time?: {
      millis: string;
      time: string;
    };
    FastestLap?: {
      rank: string;
      lap: string;
      Time: {
        time: string;
      };
      AverageSpeed: {
        units: string;
        speed: string;
      };
    };
  }

  // Raw Ergast API response types
  export interface StandingsList {
    season: string;
    round: string;
    DriverStandings: DriverStanding[];
  }

  export interface StandingsTable {
    season: string;
    StandingsLists: StandingsList[];
  }

  export interface ErgastResponse {
    MRData: {
      xmlns: string;
      series: string;
      url: string;
      limit: string;
      offset: string;
      total: string;
      StandingsTable?: StandingsTable;
      RaceTable?: any; // We could expand this further if needed
    };
  }

  // Our backend API response types
  export interface YearDriverStandingsResponse {
    success?: boolean;
    error?: boolean;
    season: string | number;
    standings: DriverStanding[];
  }

  export interface RaceScheduleResponse {
    success?: boolean;
    error?: boolean;
    season: string | number;
    races: Race[];
  }

  export interface RaceResultsResponse {
    success?: boolean;
    error?: boolean;
    season: string;
    round: string;
    raceName: string;
    date: string;
    time?: string;
    circuit: Circuit;
    results: RaceResult[];
  }
}

// =========================================================
// API ERROR HANDLING
// =========================================================

/**
 * Custom API error class to standardize error handling
 */
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /**
   * Create an ApiError from an AxiosError
   */
  static fromAxiosError(error: AxiosError<any>): ApiError {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error || error.message || "Unknown API error";
    const data = error.response?.data || null;

    return new ApiError(message, status, data);
  }
}

// Debug flag - change to false in production
const DEBUG_API = true;

// =========================================================
// API CLIENT CONFIGURATION
// =========================================================

/**
 * Base API configuration and instance
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "http://localhost:5001/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for debugging
    this.instance.interceptors.request.use(
      (config) => {
        if (DEBUG_API) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            config
          );
        }
        return config;
      },
      (error) => {
        if (DEBUG_API) {
          console.error("❌ Request Error:", error);
        }
        return Promise.reject(error);
      }
    );

    // Add response interceptor for consistent error handling
    this.instance.interceptors.response.use(
      (response) => {
        if (DEBUG_API) {
          console.log(
            `✅ API Response: ${response.status} ${response.config.url}`,
            response.data
          );
        }
        return response;
      },
      (error: unknown) => {
        if (DEBUG_API) {
          console.error("❌ Response Error:", error);

          if (axios.isAxiosError(error)) {
            console.error("Response:", error.response?.data);
            console.error("Request:", error.request);
          }
        }

        if (axios.isAxiosError(error)) {
          throw ApiError.fromAxiosError(error);
        }
        throw new ApiError(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    );
  }

  /**
   * Generic GET request with type safety
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, {
        params,
      });
      return response.data;
    } catch (error) {
      // Error is already handled by interceptor and transformed to ApiError
      throw error;
    }
  }

  /**
   * Test if an endpoint is reachable
   */
  async testEndpoint(url: string): Promise<boolean> {
    try {
      await this.instance.get(url);
      return true;
    } catch (error) {
      if (DEBUG_API) {
        console.error(`Endpoint test failed for ${url}:`, error);
      }
      return false;
    }
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

// =========================================================
// API SERVICE FUNCTIONS
// =========================================================

/**
 * F1Data namespace containing all data fetching functions
 */
export namespace F1Data {
  // Helper function to check if a year is in the future
  const isFutureYear = (year: number | string): boolean => {
    const currentYear = new Date().getFullYear();
    return Number(year) > currentYear;
  };

  /**
   * Fetches the current F1 driver standings from the Ergast API via our backend
   * @returns Promise with the driver standings data
   */
  export const fetchDriverStandings =
    async (): Promise<F1Types.ErgastResponse> => {
      try {
        return await apiClient.get<F1Types.ErgastResponse>("/test-ergast");
      } catch (error) {
        console.error("Error fetching driver standings:", error);
        throw error;
      }
    };

  /**
   * Fetches F1 driver standings for a specific year from the backend
   * @param year The season year to fetch standings for
   * @returns Promise with the driver standings data for the specified year
   */
  export const fetchDriverStandingsByYear = async (
    year: number | string
  ): Promise<F1Types.YearDriverStandingsResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: F1Types.YearDriverStandingsResponse;
      }>(`/standings/${year}`);

      // Check if this is a future season
      const isFuture = isFutureYear(year);

      // Validate the top-level response
      if (!response || !response.success || !response.data) {
        console.error(
          `Invalid driver standings response for year ${year}:`,
          response
        );
        throw new ApiError(
          `Invalid driver standings response for year ${year}`
        );
      }

      const data = response.data;

      // For future seasons, empty arrays are valid
      if (!Array.isArray(data.standings)) {
        console.error(
          `Invalid driver standings data structure for year ${year}:`,
          data
        );
        throw new ApiError(
          `Invalid driver standings data structure for year ${year}`
        );
      }

      // If it's a future season and the array is empty, that's expected and valid
      if (isFuture && data.standings.length === 0) {
        console.log(
          `Empty standings array is expected for future season ${year}`
        );
      }

      return data;
    } catch (error) {
      console.error(`Error fetching driver standings for year ${year}:`, error);
      throw error;
    }
  };

  /**
   * Fetches F1 race schedule for a specific year from the backend
   * @param year The season year to fetch schedule for
   * @returns Promise with the race schedule data for the specified year
   */
  export const fetchRaceSchedule = async (
    year: number | string
  ): Promise<F1Types.RaceScheduleResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: F1Types.RaceScheduleResponse;
      }>(`/schedule/${year}`);

      // Check if this is a future season
      const isFuture = isFutureYear(year);

      // Validate the top-level response
      if (!response || !response.success || !response.data) {
        console.error(
          `Invalid race schedule response for year ${year}:`,
          response
        );
        throw new ApiError(`Invalid race schedule response for year ${year}`);
      }

      const data = response.data;

      // For future seasons, empty arrays are valid
      if (!Array.isArray(data.races)) {
        console.error(
          `Invalid race schedule data structure for year ${year}:`,
          data
        );
        throw new ApiError(
          `Invalid race schedule data structure for year ${year}`
        );
      }

      // If it's a future season and the array is empty, that's expected and valid
      if (isFuture && data.races.length === 0) {
        console.log(`Empty races array is expected for future season ${year}`);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching race schedule for year ${year}:`, error);
      throw error;
    }
  };

  /**
   * Fetches F1 race results for a specific year and round from the backend
   * @param year The season year
   * @param round The round number
   * @returns Promise with the race results for the specified year and round
   */
  export const fetchRaceResults = async (
    year: number | string,
    round: number | string
  ): Promise<F1Types.RaceResultsResponse> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: F1Types.RaceResultsResponse;
      }>(`/results/${year}/${round}`);

      // Check if this is a future season
      const isFuture = isFutureYear(year);

      // Validate the top-level response
      if (!response || !response.success || !response.data) {
        console.error(
          `Invalid race results response for year ${year}, round ${round}:`,
          response
        );
        throw new ApiError(
          `Invalid race results response for year ${year}, round ${round}`
        );
      }

      const data = response.data;

      // For future seasons, empty arrays are valid
      if (!Array.isArray(data.results)) {
        console.error(
          `Invalid race results data structure for year ${year}, round ${round}:`,
          data
        );
        throw new ApiError(
          `Invalid race results data structure for year ${year}, round ${round}`
        );
      }

      // If it's a future season and the array is empty, that's expected and valid
      if (isFuture && data.results.length === 0) {
        console.log(
          `Empty results array is expected for future race in season ${year}, round ${round}`
        );
      }

      return data;
    } catch (error) {
      console.error(
        `Error fetching race results for year ${year}, round ${round}:`,
        error
      );
      throw error;
    }
  };

  /**
   * Fetches F1 season data for a specific year from the backend
   * @param year The season year
   * @returns Promise with the full season data for the specified year
   */
  export const fetchSeason = async (
    year: number | string
  ): Promise<F1Types.RaceScheduleResponse> => {
    try {
      // We're using the race schedule endpoint to get the full season data
      return await fetchRaceSchedule(year);
    } catch (error) {
      console.error(`Error fetching season data for year ${year}:`, error);
      throw error;
    }
  };

  /**
   * Tests all API endpoints to ensure they're reachable
   * @returns Object with test results for each endpoint
   */
  export const testApiEndpoints = async (): Promise<{
    [key: string]: boolean;
  }> => {
    const currentYear = new Date().getFullYear();

    const results = {
      "API Root": await apiClient.testEndpoint(""),
      "Test Ergast": await apiClient.testEndpoint("/test-ergast"),
      "Current Year Standings": await apiClient.testEndpoint(
        `/standings/${currentYear}`
      ),
      "Current Year Schedule": await apiClient.testEndpoint(
        `/schedule/${currentYear}`
      ),
    };

    console.table(results);
    return results;
  };
}

// Default export for backwards compatibility
export default apiClient;
