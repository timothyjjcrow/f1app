const axios = require("axios");
const cacheManager = require("./cacheManager");

const BASE_URL = "http://ergast.com/api/f1";

// Configure cache duration (10 minutes in milliseconds)
const CACHE_DURATION = 10 * 60 * 1000;

/**
 * Validates a year parameter
 * @param {string|number} year - The year to validate
 * @returns {object} - Object containing isValid boolean and error message if invalid
 */
const validateYear = (year) => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
    return {
      isValid: false,
      message: `Year must be a number between 1950 and ${currentYear}`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a round parameter
 * @param {string|number} round - The round to validate
 * @returns {object} - Object containing isValid boolean and error message if invalid
 */
const validateRound = (round) => {
  const roundNum = parseInt(round);

  if (isNaN(roundNum) || roundNum < 1 || roundNum > 30) {
    return {
      isValid: false,
      message: "Round must be a number between 1 and 30",
    };
  }

  return { isValid: true };
};

/**
 * Generate a cache key from an endpoint
 * @param {string} endpoint - API endpoint
 * @returns {string} - Cache key
 */
const generateCacheKey = (endpoint) => {
  return `ergast_api_${endpoint.replace(/[^a-zA-Z0-9]/g, "_")}`;
};

/**
 * Periodically clean expired cache entries
 */
setInterval(() => {
  cacheManager.cleanExpired();
}, 15 * 60 * 1000); // Run every 15 minutes

/**
 * Generic function to fetch data from Ergast API
 * @param {string} endpoint - The API endpoint to fetch from
 * @returns {Promise<object>} - Promise resolving to the API response data
 */
const fetchFromErgast = async (endpoint) => {
  try {
    const cacheKey = generateCacheKey(endpoint);

    // Check if the data is already in cache
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        cached: true,
      };
    }

    // If not in cache, fetch from API
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Fetching data from: ${url}`);

    const response = await axios.get(url);

    // Store in cache
    cacheManager.set(cacheKey, response.data, CACHE_DURATION);

    return {
      success: true,
      data: response.data,
      cached: false,
    };
  } catch (error) {
    console.error(
      `Error fetching from Ergast API (${endpoint}):`,
      error.message
    );
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status || 500,
      },
    };
  }
};

/**
 * Fetches driver standings for a specific year
 * @param {string|number} year - The year to fetch standings for
 * @returns {Promise<object>} - Promise resolving to formatted driver standings data
 */
const getDriverStandings = async (year) => {
  const validation = validateYear(year);
  if (!validation.isValid) {
    return {
      success: false,
      error: {
        message: validation.message,
        status: 400,
      },
    };
  }

  const result = await fetchFromErgast(`/${year}/driverStandings.json`);
  if (!result.success) return result;

  try {
    // Extract the DriverStandings array from the response
    const driverStandings =
      result.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ||
      [];

    return {
      success: true,
      data: {
        season: year,
        standings: driverStandings,
        cached: result.cached || false,
      },
    };
  } catch (error) {
    console.error(
      `Error processing driver standings for year ${year}:`,
      error.message
    );
    return {
      success: false,
      error: {
        message: "Error processing API response data",
        status: 500,
      },
    };
  }
};

/**
 * Fetches race schedule for a specific year
 * @param {string|number} year - The year to fetch schedule for
 * @returns {Promise<object>} - Promise resolving to formatted race schedule data
 */
const getRaceSchedule = async (year) => {
  const validation = validateYear(year);
  if (!validation.isValid) {
    return {
      success: false,
      error: {
        message: validation.message,
        status: 400,
      },
    };
  }

  const result = await fetchFromErgast(`/${year}.json`);
  if (!result.success) return result;

  try {
    // Extract the Races array from the response
    const races = result.data.MRData.RaceTable.Races || [];

    // Transform the data to a simpler format
    const schedule = races.map((race) => ({
      season: race.season,
      round: race.round,
      raceName: race.raceName,
      date: race.date,
      time: race.time,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      country: race.Circuit.Location.country,
      locality: race.Circuit.Location.locality,
    }));

    return {
      success: true,
      data: {
        season: year,
        races: schedule,
        cached: result.cached || false,
      },
    };
  } catch (error) {
    console.error(
      `Error processing race schedule for year ${year}:`,
      error.message
    );
    return {
      success: false,
      error: {
        message: "Error processing API response data",
        status: 500,
      },
    };
  }
};

/**
 * Fetches race results for a specific year and round
 * @param {string|number} year - The year to fetch results for
 * @param {string|number} round - The round to fetch results for
 * @returns {Promise<object>} - Promise resolving to formatted race results data
 */
const getRaceResults = async (year, round) => {
  const yearValidation = validateYear(year);
  if (!yearValidation.isValid) {
    return {
      success: false,
      error: {
        message: yearValidation.message,
        status: 400,
      },
    };
  }

  const roundValidation = validateRound(round);
  if (!roundValidation.isValid) {
    return {
      success: false,
      error: {
        message: roundValidation.message,
        status: 400,
      },
    };
  }

  const result = await fetchFromErgast(`/${year}/${round}/results.json`);
  if (!result.success) return result;

  try {
    // Extract race data and results array from the response
    const raceData = result.data.MRData.RaceTable.Races[0] || {};
    const results = raceData.Results || [];

    return {
      success: true,
      data: {
        season: year,
        round: round,
        raceName: raceData.raceName || null,
        date: raceData.date || null,
        circuit: raceData.Circuit
          ? {
              name: raceData.Circuit.circuitName,
              location: raceData.Circuit.Location
                ? {
                    locality: raceData.Circuit.Location.locality,
                    country: raceData.Circuit.Location.country,
                  }
                : null,
            }
          : null,
        results: results,
        cached: result.cached || false,
      },
    };
  } catch (error) {
    console.error(
      `Error processing race results for year ${year}, round ${round}:`,
      error.message
    );
    return {
      success: false,
      error: {
        message: "Error processing API response data",
        status: 500,
      },
    };
  }
};

/**
 * Clears the cache for Ergast API calls
 */
const clearCache = () => {
  cacheManager.clear();
};

/**
 * Gets statistics about the cache
 * @returns {object} - Cache statistics
 */
const getCacheStats = () => {
  return cacheManager.getStats();
};

module.exports = {
  validateYear,
  validateRound,
  fetchFromErgast,
  getDriverStandings,
  getRaceSchedule,
  getRaceResults,
  clearCache,
  getCacheStats,
};
