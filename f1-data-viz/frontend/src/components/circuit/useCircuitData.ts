import { useMemo, useState, useEffect } from "react";
import {
  CIRCUIT_ID_MAPPING,
  DriverInfo,
  ProcessedLapData,
} from "./CircuitTypes";

// Helper to create synthetic sector times (3 sectors)
export function createSyntheticSectorTimes(totalTimeMs: number): number[] {
  const variance = 0.1;
  const baseSectorTime = totalTimeMs / 3;
  const sector1Time =
    baseSectorTime * (1 - variance / 2 + Math.random() * variance);
  const sector2Time =
    baseSectorTime * (1 - variance / 2 + Math.random() * variance);
  const sector3Time = totalTimeMs - sector1Time - sector2Time;
  return [sector1Time, sector2Time, sector3Time];
}

// Convert lap time string (e.g., "1:30.456") to milliseconds
export function timeStringToMs(timeStr: string): number {
  let minutes = 0,
    seconds = 0,
    ms = 0;
  if (timeStr.includes(":")) {
    const [minPart, secPart] = timeStr.split(":");
    minutes = parseInt(minPart, 10);
    if (secPart.includes(".")) {
      const [sec, msec] = secPart.split(".");
      seconds = parseInt(sec, 10);
      ms = parseInt(msec, 10) * (msec.length === 3 ? 1 : 10);
    } else {
      seconds = parseInt(secPart, 10);
    }
  } else if (timeStr.includes(".")) {
    const [sec, msec] = timeStr.split(".");
    seconds = parseInt(sec, 10);
    ms = parseInt(msec, 10) * (msec.length === 3 ? 1 : 10);
  } else {
    seconds = parseInt(timeStr, 10);
  }
  return minutes * 60000 + seconds * 1000 + ms;
}

// Helper to infer circuit ID from race name when circuit ID is missing
function inferCircuitIdFromRaceName(raceName: string): string | null {
  const nameToCircuitMap: Record<string, string> = {
    "Japanese Grand Prix": "suzuka",
    "Chinese Grand Prix": "shanghai",
    "Miami Grand Prix": "miami",
    "Australian Grand Prix": "albert_park",
    "Monaco Grand Prix": "monaco",
    "Belgian Grand Prix": "spa",
    "Italian Grand Prix": "monza",
    "British Grand Prix": "silverstone",
    "Spanish Grand Prix": "catalunya",
    "Hungarian Grand Prix": "hungaroring",
    "Austrian Grand Prix": "red_bull_ring",
    "Canadian Grand Prix": "villeneuve",
    "Singapore Grand Prix": "marina_bay",
    "United States Grand Prix": "americas", // or "cota"
    "Mexican Grand Prix": "rodriguez",
    "Brazilian Grand Prix": "interlagos",
    "Abu Dhabi Grand Prix": "yas_marina",
    "Dutch Grand Prix": "zandvoort",
    "Azerbaijan Grand Prix": "baku",
    "Saudi Arabian Grand Prix": "jeddah",
    "Bahrain Grand Prix": "bahrain",
    "Qatar Grand Prix": "losail",
    "Las Vegas Grand Prix": "vegas",
    "French Grand Prix": "ricard",
    "Emilia Romagna Grand Prix": "imola",
    "Portuguese Grand Prix": "portimao",
    "Tuscan Grand Prix": "mugello",
    "Eifel Grand Prix": "nurburgring",
    "Turkish Grand Prix": "istanbul",
    "Russian Grand Prix": "sochi",
    "German Grand Prix": "hockenheimring",
    "Malaysian Grand Prix": "sepang",
  };

  // Try to match exactly
  if (raceName in nameToCircuitMap) {
    return nameToCircuitMap[raceName];
  }

  // Try to match partially (if a race name contains a key part)
  for (const [key, value] of Object.entries(nameToCircuitMap)) {
    const keyPart = key.replace(" Grand Prix", "");
    if (raceName.includes(keyPart)) {
      return value;
    }
  }

  // Log unmatched race name and return default
  console.warn(`Could not infer circuit ID for race name: ${raceName}`);
  return null;
}

export function useCircuitData(
  allRaceResults: Record<string, any>,
  selectedCircuitId: string
) {
  // State for processed data
  const [availableCircuits, setAvailableCircuits] = useState<string[]>([]);
  const [driversInfo, setDriversInfo] = useState<Map<string, DriverInfo>>(
    new Map()
  );
  const [dataLoaded, setDataLoaded] = useState(false);

  // Process race results to extract fastest laps and driver information
  const processedFastestLaps = useMemo(() => {
    console.log("Processing race results for fastest laps", {
      raceCount: Object.keys(allRaceResults).length,
      selectedCircuitId,
    });

    const driverLaps = new Map<string, ProcessedLapData>();
    const driversFound = new Map<string, DriverInfo>();
    const circuitsInYear = new Set<string>();

    if (Object.keys(allRaceResults).length === 0) {
      console.log("No race results to process");
      return { driverLaps, driversFound, circuitsInYear };
    }

    // Track all available circuit IDs from the API
    const allApiCircuitIds = new Set<string>();

    // Process each race result
    Object.values(allRaceResults).forEach((race: any) => {
      // Get circuit ID - either from API response or infer from race name
      let apiCircuitId: string;

      if (race?.circuit?.circuitId) {
        apiCircuitId = race.circuit.circuitId;
      } else {
        // Try to infer circuit ID from race name
        const raceName = race?.raceName || "Unknown Race";
        const inferredId = inferCircuitIdFromRaceName(raceName);

        if (inferredId) {
          apiCircuitId = inferredId;
          console.log(
            `Inferred circuit ID '${inferredId}' for race: ${raceName}`
          );
        } else {
          console.warn(
            `Could not process race - missing circuit ID: ${raceName}`
          );
          return; // Skip this race
        }
      }

      // Track all unique circuit IDs from the API
      allApiCircuitIds.add(apiCircuitId);

      // Get the mapped circuit ID (or default)
      const mappedCircuitId =
        CIRCUIT_ID_MAPPING[apiCircuitId] || CIRCUIT_ID_MAPPING.default;

      // Add this circuit ID to our set of available circuits for this year
      circuitsInYear.add(mappedCircuitId);

      // Skip further processing if this race isn't for the selected circuit
      if (mappedCircuitId !== selectedCircuitId) return;

      console.log(
        `Processing race for selected circuit: ${race.raceName} (${apiCircuitId} -> ${mappedCircuitId})`
      );

      // Process driver lap data from results
      const fastestLaps = race?.results?.filter(
        (result: any) =>
          result?.FastestLap?.rank === "1" || result?.FastestLap?.Time?.time
      );

      if (!fastestLaps || fastestLaps.length === 0) {
        console.warn(`No fastest laps found for race: ${race.raceName}`);
        return;
      }

      // Process each driver's fastest lap
      fastestLaps.forEach((result: any) => {
        if (!result?.Driver?.driverId) {
          console.warn("Result missing driver ID");
          return;
        }

        const driverId = result.Driver.driverId;
        const driverName = `${result.Driver.givenName} ${result.Driver.familyName}`;

        // Store driver info
        driversFound.set(driverId, {
          name: driverName,
          team: result.Constructor?.name || "Unknown Team",
        });

        // Process lap time
        const lapTime = result?.FastestLap?.Time?.time;
        if (!lapTime) {
          console.warn(`Missing lap time for driver: ${driverName}`);
          return;
        }

        // Convert lap time to milliseconds for comparison
        const timeInMs = timeStringToMs(lapTime);

        // Only update if this is a new driver or the lap is faster
        if (
          !driverLaps.has(driverId) ||
          timeInMs < driverLaps.get(driverId)!.timeInMs
        ) {
          // Create synthetic sector times
          const sectorTimes = createSyntheticSectorTimes(timeInMs);

          driverLaps.set(driverId, {
            time: lapTime,
            timeInMs,
            sectors: sectorTimes,
            position: result.position || "0",
          });

          console.log(
            `Added/Updated fastest lap for ${driverName}: ${lapTime}`
          );
        }
      });
    });

    // After processing all races, log detailed debug info
    console.log("Available API Circuit IDs:", Array.from(allApiCircuitIds));
    console.log("Mapped to available circuits:", Array.from(circuitsInYear));
    console.log("Drivers found:", driversFound.size);

    return { driverLaps, driversFound, circuitsInYear };
  }, [allRaceResults, selectedCircuitId]);

  // Update available circuits based on processed data
  useEffect(() => {
    if (!dataLoaded && Object.keys(allRaceResults).length > 0) {
      setDataLoaded(true);
    }

    const circuitsWithData = Array.from(processedFastestLaps.circuitsInYear);
    setAvailableCircuits(circuitsWithData);
  }, [allRaceResults, processedFastestLaps.circuitsInYear, dataLoaded]);

  // Update driver info when processed laps change
  useEffect(() => {
    const newDriversInfo = new Map<string, DriverInfo>();

    processedFastestLaps.driversFound.forEach((driver, driverId) => {
      const driverLapData = processedFastestLaps.driverLaps.get(driverId);

      newDriversInfo.set(driverId, {
        ...driver,
        lapTime: driverLapData?.time || "",
        sectors: driverLapData?.sectors || [0, 0, 0],
      });
    });

    setDriversInfo(newDriversInfo);
  }, [processedFastestLaps.driversFound, processedFastestLaps.driverLaps]);

  return {
    availableCircuits,
    driversInfo,
    dataLoaded,
    processedFastestLaps,
  };
}
