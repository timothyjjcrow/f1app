// src/components/CircuitLayoutVisualizer.tsx

import React, { useState, useEffect, useRef } from "react";
import { useSeasonContext } from "../contexts/SeasonContext";
import { useRaceResultsContext } from "../contexts/RaceResultsContext";
import ErrorBoundary from "./ErrorBoundary";

// Import modular components
import TrackVisualization, {
  useDriverPosition,
} from "./circuit/TrackVisualization";
import CircuitControls from "./circuit/CircuitControls";
import DebugPanel from "./circuit/DebugPanel";
import { useCircuitData } from "./circuit/useCircuitData";
import { CIRCUIT_ID_MAPPING, CircuitInfo } from "./circuit/CircuitTypes";

// Import circuit SVG components
import {
  MonacoCircuitSVG,
  SilverstoneCircuitSVG,
  SpaCircuitSVG,
  MonzaCircuitSVG,
} from "./circuit/CircuitSVGs";

// ----------------------
// Available Circuits Data
// ----------------------

// Define the type for the available circuits record
type AvailableCircuits = {
  [key: string]: CircuitInfo;
};

const AVAILABLE_CIRCUITS: AvailableCircuits = {
  monaco: {
    id: "monaco",
    name: "Circuit de Monaco",
    location: "Monte Carlo",
    country: "Monaco",
    firstGrandPrix: 1950,
    laps: 78,
    length: "3.337",
    svgComponent: MonacoCircuitSVG,
    sectors: {
      sector1: {
        name: "Sector 1",
        description: "Start/Finish to Casino Square",
        color: "red",
      },
      sector2: {
        name: "Sector 2",
        description: "Casino to Tunnel Exit",
        color: "green",
      },
      sector3: {
        name: "Sector 3",
        description: "Chicane to Anthony Noghes",
        color: "blue",
      },
    },
    turns: {
      turn1: { number: 1, name: "Sainte Devote" },
      turn4: { number: 4, name: "Casino Square" },
      turn6: { number: 6, name: "Grand Hotel Hairpin" },
      turn10: { number: 10, name: "Nouvelle Chicane" },
      turn12: { number: 12, name: "Tabac" },
      turn19: { number: 19, name: "Anthony Noghes" },
    },
  },
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    location: "Silverstone",
    country: "United Kingdom",
    firstGrandPrix: 1950,
    laps: 52,
    length: "5.891",
    svgComponent: SilverstoneCircuitSVG,
    sectors: {
      sector1: {
        name: "Sector 1",
        description: "Abbey to Chapel",
        color: "red",
      },
      sector2: {
        name: "Sector 2",
        description: "Hangar Straight to Stowe",
        color: "green",
      },
      sector3: {
        name: "Sector 3",
        description: "Vale to Club and Finish",
        color: "blue",
      },
    },
    turns: {
      turn1: { number: 1, name: "Abbey" },
      turn3: { number: 3, name: "Village" },
      turn6: { number: 6, name: "Brooklands" },
      turn9: { number: 9, name: "Copse" },
      turn13: { number: 13, name: "Stowe" },
      turn15: { number: 15, name: "Club" },
    },
  },
  spa: {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    location: "Stavelot",
    country: "Belgium",
    firstGrandPrix: 1950,
    laps: 44,
    length: "7.004",
    svgComponent: SpaCircuitSVG,
    sectors: {
      sector1: {
        name: "Sector 1",
        description: "La Source to Les Combes",
        color: "red",
      },
      sector2: {
        name: "Sector 2",
        description: "Les Combes to Pouhon",
        color: "green",
      },
      sector3: {
        name: "Sector 3",
        description: "Pouhon to Bus Stop",
        color: "blue",
      },
    },
    turns: {
      turn1: { number: 1, name: "La Source" },
      turn3: { number: 3, name: "Eau Rouge" },
      turn7: { number: 7, name: "Les Combes" },
      turn10: { number: 10, name: "Pouhon" },
      turn15: { number: 15, name: "Blanchimont" },
      turn19: { number: 19, name: "Bus Stop" },
    },
  },
  monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    location: "Monza",
    country: "Italy",
    firstGrandPrix: 1950,
    laps: 53,
    length: "5.793",
    svgComponent: MonzaCircuitSVG,
    sectors: {
      sector1: {
        name: "Sector 1",
        description: "Start/Finish to First Lesmo",
        color: "red",
      },
      sector2: {
        name: "Sector 2",
        description: "First Lesmo to Ascari",
        color: "green",
      },
      sector3: {
        name: "Sector 3",
        description: "Ascari to Parabolica",
        color: "blue",
      },
    },
    turns: {
      turn1: { number: 1, name: "Variante del Rettifilo" },
      turn3: { number: 3, name: "Curva Grande" },
      turn4: { number: 4, name: "First Lesmo" },
      turn7: { number: 7, name: "Second Lesmo" },
      turn8: { number: 8, name: "Variante Ascari" },
      turn11: { number: 11, name: "Parabolica" },
    },
  },
};

// ----------------------
// Main Component: CircuitLayoutVisualizer
// ----------------------

const CircuitLayoutVisualizer: React.FC = () => {
  // Context and state
  const { selectedYear, resetToCurrentYear } = useSeasonContext();
  const { allRaceResults, isLoadingResults, resultsError, fetchAllResults } =
    useRaceResultsContext();

  // Component state
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(
    Object.keys(AVAILABLE_CIRCUITS)[0] || ""
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [highlightedSector, setHighlightedSector] = useState<
    string | undefined
  >(undefined);
  const [highlightedTurn, setHighlightedTurn] = useState<string | undefined>(
    undefined
  );
  const [lapProgress, setLapProgress] = useState<number | null>(null);
  const [isLapAnimating, setIsLapAnimating] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Refs
  const animationRef = useRef<number | null>(null);
  const trackPathRef = useRef<SVGPathElement | null>(null);

  // Custom hooks for data processing
  const { availableCircuits, driversInfo } = useCircuitData(
    allRaceResults,
    selectedCircuitId
  );

  // Effect to fetch data when year changes, with API call debouncing
  useEffect(() => {
    console.log(`Selected year changed to: ${selectedYear}`);

    const now = Date.now();
    // Only fetch if 2 seconds have passed since the last fetch
    if (now - lastFetchTime > 2000 && !isLoadingResults) {
      console.log("Fetching data for year:", selectedYear);
      fetchAllResults();
      setLastFetchTime(now);
    } else {
      console.log("Skipping fetch - too soon or already loading");
    }
  }, [selectedYear]);

  // Effect to handle driver selection when available drivers change
  useEffect(() => {
    if (
      driversInfo.size > 0 &&
      (!selectedDriverId || !driversInfo.has(selectedDriverId))
    ) {
      setSelectedDriverId(Array.from(driversInfo.keys())[0]);
    } else if (driversInfo.size === 0 && selectedDriverId) {
      setSelectedDriverId("");
    }
  }, [driversInfo, selectedDriverId]);

  // Effect to handle lap animation
  useEffect(() => {
    const cleanupAnimation = () => {
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };

    if (isLapAnimating && trackPathRef.current) {
      let startTime: number | null = null;
      const duration = 10000;
      const pathElement = trackPathRef.current;
      const totalLength = pathElement.getTotalLength();

      if (totalLength === 0) {
        console.warn("Track path has zero length, cannot animate.");
        setIsLapAnimating(false);
        return;
      }

      const animateLap = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setLapProgress(progress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateLap);
        } else {
          setIsLapAnimating(false);
          setTimeout(() => setLapProgress(null), 500);
        }
      };

      animationRef.current = requestAnimationFrame(animateLap);
    } else {
      cleanupAnimation();
    }

    return cleanupAnimation;
  }, [isLapAnimating]);

  // Reset highlights when circuit or driver changes
  useEffect(() => {
    setHighlightedSector(undefined);
    setHighlightedTurn(undefined);
  }, [selectedCircuitId, selectedDriverId]);

  // ----------------------
  // Event Handlers
  // ----------------------

  const handleCircuitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCircuitId(e.target.value);
    setIsLapAnimating(false);
    setLapProgress(null);
    setHighlightedSector(undefined);
    setHighlightedTurn(undefined);
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const driverId = e.target.value;
    if (driverId && driversInfo.has(driverId)) {
      setSelectedDriverId(driverId);
    } else {
      setSelectedDriverId("");
    }
  };

  const handleSectorClick = (sectorId: string) => {
    setHighlightedSector((prev) => (prev === sectorId ? undefined : sectorId));
  };

  const handleTurnClick = (turnId: string) => {
    setHighlightedTurn((prev) => (prev === turnId ? undefined : turnId));
  };

  const handleAnimateLap = () => {
    if (!isLapAnimating) {
      setIsLapAnimating(true);
      setLapProgress(0);
    }
  };

  const handleForceRefresh = () => {
    if (isLoadingResults) {
      console.log("Already loading, skipping refresh");
      return;
    }
    console.log("Forcing refresh of race data");
    fetchAllResults();
    setLastFetchTime(Date.now());
  };

  // Get the circuit info safely with type checking
  const getCircuitInfo = (id: string): CircuitInfo | undefined => {
    return AVAILABLE_CIRCUITS[id];
  };

  // ----------------------
  // Render Component
  // ----------------------
  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-900 rounded-lg shadow-lg relative text-gray-200">
        {/* Circuit Controls */}
        <CircuitControls
          selectedYear={selectedYear}
          selectedCircuitId={selectedCircuitId}
          selectedDriverId={selectedDriverId}
          availableCircuits={availableCircuits}
          driversInfo={driversInfo}
          availableCircuitDetails={AVAILABLE_CIRCUITS}
          isLoadingResults={isLoadingResults}
          onCircuitChange={handleCircuitChange}
          onDriverChange={handleDriverChange}
          handleForceRefresh={handleForceRefresh}
          toggleDebugInfo={() => setShowDebugInfo(!showDebugInfo)}
          showDebugInfo={showDebugInfo}
        />

        {/* Loading State */}
        {isLoadingResults && (
          <div className="flex items-center justify-center h-96 bg-gray-800 rounded-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
            <div>
              <p className="text-gray-300 font-medium">Loading race data...</p>
              <p className="text-xs text-gray-400 mt-1">
                Fetching results for year {selectedYear}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {resultsError && !isLoadingResults && (
          <div className="my-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
            <h3 className="font-bold mb-2">Error Loading Race Data</h3>
            <p className="text-sm">
              {typeof resultsError === "string"
                ? resultsError
                : "Unknown error"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleForceRefresh}
                className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Retry Loading Data
              </button>
              <button
                onClick={resetToCurrentYear}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Try Current Year
              </button>
            </div>
          </div>
        )}

        {/* Data Status */}
        {!isLoadingResults &&
          !resultsError &&
          Object.keys(allRaceResults).length > 0 && (
            <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-300 mr-1">
                    Data Status:
                  </span>
                  <span className="text-green-400">✓ Race Data Loaded</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-300 mr-1">Races:</span>
                  <span className="text-blue-400">
                    {Object.keys(allRaceResults).length}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-300 mr-1">
                    Circuits:
                  </span>
                  <span
                    className={
                      availableCircuits.length > 0
                        ? "text-green-400"
                        : "text-amber-400"
                    }
                  >
                    {availableCircuits.length}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-300 mr-1">
                    Drivers:
                  </span>
                  <span
                    className={
                      driversInfo.size > 0 ? "text-green-400" : "text-red-400"
                    }
                  >
                    {driversInfo.size}
                  </span>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleForceRefresh}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Future Season Warning */}
        {selectedYear > new Date().getFullYear() &&
          !isLoadingResults &&
          !resultsError && (
            <div className="my-4 p-4 bg-blue-900/30 border border-blue-700 text-blue-200 rounded-lg">
              <h3 className="font-bold mb-2">Future Season</h3>
              <p className="text-sm mb-3">
                The {selectedYear} season hasn't occurred yet. Explore circuit
                layouts; driver data will be available when the season starts.
              </p>
              <button
                onClick={resetToCurrentYear}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Switch to Current Season
              </button>
            </div>
          )}

        {/* No Data Warning */}
        {!isLoadingResults &&
          !resultsError &&
          Object.keys(allRaceResults).length === 0 &&
          selectedYear <= new Date().getFullYear() && (
            <div className="my-4 p-4 bg-amber-900/30 border border-amber-700 text-amber-200 rounded-lg">
              <h3 className="font-bold mb-2">No Race Data Available</h3>
              <p className="text-sm mb-3">
                No race data for the {selectedYear} season. This may be due to
                pending data load or API issues.
              </p>
              <button
                onClick={handleForceRefresh}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm mr-2"
              >
                Retry Loading Data
              </button>
              <button
                onClick={resetToCurrentYear}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm"
              >
                Switch to Current Season
              </button>
            </div>
          )}

        {/* Animate Lap Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAnimateLap}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            disabled={!selectedDriverId}
          >
            Animate Lap
          </button>
        </div>

        {/* Track Visualization */}
        {getCircuitInfo(selectedCircuitId) && (
          <TrackVisualization
            circuitInfo={getCircuitInfo(selectedCircuitId)!}
            highlightedSector={highlightedSector}
            highlightedTurn={highlightedTurn}
            onSectorClick={handleSectorClick}
            onTurnClick={handleTurnClick}
            lapProgress={lapProgress}
            trackPathRef={trackPathRef}
            selectedDriverId={selectedDriverId}
            driversInfo={driversInfo}
          />
        )}

        {/* Debug Panel */}
        <DebugPanel
          showDebugInfo={showDebugInfo}
          selectedCircuitId={selectedCircuitId}
          availableCircuits={availableCircuits}
          driversInfo={driversInfo}
          selectedDriverId={selectedDriverId}
          allRaceResults={allRaceResults}
          selectedYear={selectedYear}
          isLoadingResults={isLoadingResults}
          resultsError={resultsError}
          availableCircuitDetails={AVAILABLE_CIRCUITS}
          onSelectCircuit={setSelectedCircuitId}
        />
      </div>
    </ErrorBoundary>
  );
};

export default CircuitLayoutVisualizer;
