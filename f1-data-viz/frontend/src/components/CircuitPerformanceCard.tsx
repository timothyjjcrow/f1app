// src/components/CircuitPerformanceCard.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useSeasonContext } from "../contexts/SeasonContext"; // Assuming path
import { useRaceResultsContext } from "../contexts/RaceResultsContext"; // Assuming path
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Needed for Bar charts
  ScatterController,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line, Scatter, Bar } from "react-chartjs-2"; // Added Bar
import ErrorBoundary from "./ErrorBoundary"; // Assuming path
import { F1Types } from "../services/api"; // Assuming path

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Register Bar element
  ScatterController,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set global chart defaults (optional)
ChartJS.defaults.color = "rgba(255, 255, 255, 0.8)";
ChartJS.defaults.font.family = "'Inter', 'Helvetica', 'Arial', sans-serif";
ChartJS.defaults.scale.grid.color = "rgba(255, 255, 255, 0.1)";

// --- Constants ---

const TEAM_COLORS: Record<string, string> = {
  Ferrari: "#DC0000",
  "Red Bull": "#3671C6",
  Mercedes: "#27F4D2",
  McLaren: "#FF8000",
  Alpine: "#FF87BC",
  "RB F1 Team": "#6692FF",
  "Aston Martin": "#229971",
  Williams: "#64C4FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
};

const FALLBACK_COLORS = [
  "#3366CC",
  "#DC3912",
  "#FF9900",
  "#109618",
  "#990099",
  "#3B3EAC",
  "#0099C6",
  "#DD4477",
  "#66AA00",
  "#B82E2E",
];

// --- Interfaces ---

interface DriverInfo {
  id: string;
  name: string;
  team: string;
  teamColor: string;
}

interface ProcessedSeasonData {
  drivers: DriverInfo[];
  races: { round: number; raceName: string }[];
  pointsProgression: Record<string, number[]>;
  consistencyStats: Record<
    string,
    { avgPosition: number; stdDevPosition: number; raceCount: number }
  >;
  positionChangeStats: Record<
    string,
    { totalChange: number; raceCount: number; avgChange: number }
  >;
  fastestLapCounts: Record<string, number>;
}

// Type alias for the different visualization views
type VisualizationView = "points" | "consistency" | "posChange" | "fastestLap";

// --- Helper Functions ---

const calculateStdDev = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const variance =
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

// --- Component ---

const CircuitPerformanceCard: React.FC = () => {
  // --- Contexts ---
  const { selectedYear } = useSeasonContext();
  const { allRaceResults, isLoadingResults, resultsError, fetchAllResults } =
    useRaceResultsContext();

  // --- State ---
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [processedData, setProcessedData] =
    useState<ProcessedSeasonData | null>(null);
  const [driverSearchFilter, setDriverSearchFilter] = useState<string>("");
  const [showMaxDriversWarning, setShowMaxDriversWarning] =
    useState<boolean>(false);
  const [loadedRaceCount, setLoadedRaceCount] = useState<number>(0);
  const [totalRaceCount, setTotalRaceCount] = useState<number>(0);
  const [currentView, setCurrentView] = useState<VisualizationView>("points"); // State for active view using the type alias

  // --- Effects ---

  // Fetch results when component mounts or year changes
  useEffect(() => {
    if (!isLoadingResults) {
      console.log(`Workspaceing results for year: ${selectedYear}`);
      fetchAllResults();
      setSelectedDriverIds([]);
      setProcessedData(null);
      setDriverSearchFilter("");
      setCurrentView("points"); // Reset view on year change
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Update loading progress count
  useEffect(() => {
    if (allRaceResults) {
      const raceCount = Object.keys(allRaceResults).length;
      setLoadedRaceCount(raceCount);
      setTotalRaceCount(raceCount); // Assuming all races for the year are fetched
    } else {
      setLoadedRaceCount(0);
      setTotalRaceCount(0);
    }
  }, [allRaceResults]);

  // Process allRaceResults into structured data for visualizations
  useEffect(() => {
    if (isLoadingResults || !allRaceResults) {
      setProcessedData(null);
      return;
    }

    console.log(
      `Processing ${
        Object.keys(allRaceResults).length
      } race results for ${selectedYear}...`
    );

    const driversMap = new Map<string, DriverInfo>();
    const pointsProgressionMap: Record<string, number[]> = {};
    const positionHistoryMap: Record<string, number[]> = {};
    const positionChangeMap: Record<
      string,
      { totalChange: number; raceCount: number }
    > = {};
    const fastestLapCountMap: Record<string, number> = {};

    const sortedRaces = Object.values(allRaceResults)
      .filter(
        (race): race is F1Types.RaceResultsResponse =>
          !!(race && race.round && race.results)
      )
      .sort((a, b) => parseInt(a.round, 10) - parseInt(b.round, 10));

    const raceLabels = sortedRaces.map((race) => ({
      round: parseInt(race.round, 10),
      raceName: race.raceName,
    }));

    // Initialize driver data structures
    sortedRaces.forEach((race) => {
      race.results.forEach((result) => {
        const driverId = result.Driver?.driverId;
        if (!driverId) return;

        const teamName = result.Constructor?.name || "Unknown";
        if (!driversMap.has(driverId)) {
          driversMap.set(driverId, {
            id: driverId,
            name: `${result.Driver.givenName} ${result.Driver.familyName}`,
            team: teamName,
            teamColor: TEAM_COLORS[teamName] || FALLBACK_COLORS[0],
          });
          // Initialize arrays/objects only when driver is first seen
          if (!pointsProgressionMap[driverId])
            pointsProgressionMap[driverId] = Array(sortedRaces.length).fill(0);
          if (!positionHistoryMap[driverId]) positionHistoryMap[driverId] = [];
          if (!positionChangeMap[driverId])
            positionChangeMap[driverId] = { totalChange: 0, raceCount: 0 };
          if (!fastestLapCountMap[driverId]) fastestLapCountMap[driverId] = 0;
        } else {
          // Update team if it changed mid-season (take latest)
          driversMap.get(driverId)!.team = teamName;
          // Re-assign color based on potentially new team
          driversMap.get(driverId)!.teamColor =
            TEAM_COLORS[teamName] ||
            driversMap.get(driverId)!.teamColor ||
            FALLBACK_COLORS[0];
        }
      });
    });

    // Assign fallback colors systematically if needed
    let fallbackColorIndex = 0;
    driversMap.forEach((driver) => {
      if (!TEAM_COLORS[driver.team]) {
        // Only assign fallback if no color is set yet or if team didn't match
        if (!driver.teamColor || driver.teamColor === FALLBACK_COLORS[0]) {
          driver.teamColor =
            FALLBACK_COLORS[fallbackColorIndex++ % FALLBACK_COLORS.length];
        }
      } else {
        driver.teamColor = TEAM_COLORS[driver.team]; // Ensure correct team color is assigned
      }
    });

    // Calculate cumulative points, positions, changes, and fastest laps
    let currentPoints: Record<string, number> = {};
    driversMap.forEach((driver) => (currentPoints[driver.id] = 0));

    sortedRaces.forEach((race, raceIndex) => {
      race.results.forEach((result) => {
        const driverId = result.Driver?.driverId;
        if (!driverId || !driversMap.has(driverId)) return;

        // Points Progression
        const points = parseFloat(result.points);
        if (!isNaN(points)) {
          currentPoints[driverId] = (currentPoints[driverId] || 0) + points;
        }
        if (!pointsProgressionMap[driverId])
          pointsProgressionMap[driverId] = Array(sortedRaces.length).fill(0);
        pointsProgressionMap[driverId][raceIndex] = currentPoints[driverId];

        // Position History & Change
        const position = parseInt(result.position, 10);
        const gridPos = parseInt(result.grid, 10);
        if (!isNaN(position) && position > 0) {
          if (!positionHistoryMap[driverId]) positionHistoryMap[driverId] = [];
          positionHistoryMap[driverId].push(position);

          if (!isNaN(gridPos) && gridPos > 0) {
            if (!positionChangeMap[driverId])
              positionChangeMap[driverId] = { totalChange: 0, raceCount: 0 };
            positionChangeMap[driverId].totalChange += gridPos - position;
            positionChangeMap[driverId].raceCount++;
          }
        }

        // Fastest Laps
        if (result.FastestLap?.rank === "1") {
          if (!fastestLapCountMap[driverId]) fastestLapCountMap[driverId] = 0;
          fastestLapCountMap[driverId]++;
        }
      });
      driversMap.forEach((driver) => {
        if (pointsProgressionMap[driver.id]?.[raceIndex] === undefined) {
          pointsProgressionMap[driver.id][raceIndex] =
            raceIndex > 0 ? pointsProgressionMap[driver.id][raceIndex - 1] : 0;
        }
      });
    });

    // Calculate final consistency and average position change stats
    const consistencyStats: ProcessedSeasonData["consistencyStats"] = {};
    const positionChangeStats: ProcessedSeasonData["positionChangeStats"] = {};
    driversMap.forEach((driver) => {
      const positions = positionHistoryMap[driver.id];
      if (positions && positions.length > 0) {
        const avgPosition =
          positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
        const stdDevPosition = calculateStdDev(positions);
        consistencyStats[driver.id] = {
          avgPosition: parseFloat(avgPosition.toFixed(2)),
          stdDevPosition: parseFloat(stdDevPosition.toFixed(2)),
          raceCount: positions.length,
        };
      } else {
        consistencyStats[driver.id] = {
          avgPosition: NaN,
          stdDevPosition: NaN,
          raceCount: 0,
        };
      }

      const changeData = positionChangeMap[driver.id];
      if (changeData && changeData.raceCount > 0) {
        positionChangeStats[driver.id] = {
          ...changeData,
          avgChange: parseFloat(
            (changeData.totalChange / changeData.raceCount).toFixed(2)
          ),
        };
      } else {
        positionChangeStats[driver.id] = {
          totalChange: 0,
          raceCount: 0,
          avgChange: 0,
        };
      }
    });

    const finalDrivers = Array.from(driversMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setProcessedData({
      drivers: finalDrivers,
      races: raceLabels,
      pointsProgression: pointsProgressionMap,
      consistencyStats: consistencyStats,
      positionChangeStats: positionChangeStats,
      fastestLapCounts: fastestLapCountMap,
    });

    if (finalDrivers.length > 0 && selectedDriverIds.length === 0) {
      const driversWithFinalPoints = finalDrivers
        .map((d) => ({
          id: d.id,
          points: pointsProgressionMap[d.id]?.[raceLabels.length - 1] || 0,
        }))
        .sort((a, b) => b.points - a.points);
      const defaultSelection = driversWithFinalPoints
        .slice(0, Math.min(5, finalDrivers.length))
        .map((d) => d.id);
      setSelectedDriverIds(defaultSelection);
    } else if (finalDrivers.length === 0) {
      setSelectedDriverIds([]);
    }

    console.log("Data processing complete.");
  }, [allRaceResults, isLoadingResults, selectedYear]);

  // --- Chart Data & Options ---

  const filteredDrivers = useMemo(() => {
    return (
      processedData?.drivers.filter((driver) =>
        selectedDriverIds.includes(driver.id)
      ) || []
    );
  }, [processedData, selectedDriverIds]);

  const chartData = useMemo(() => {
    if (!processedData || filteredDrivers.length === 0) {
      return {
        points: null,
        consistency: null,
        posChange: null,
        fastestLap: null,
      };
    }

    const points: ChartData<"line"> = {
      labels: processedData.races.map((r) => r.raceName),
      datasets: filteredDrivers.map((driver) => ({
        label: driver.name,
        data: processedData.pointsProgression[driver.id] || [],
        borderColor: driver.teamColor,
        backgroundColor: `${driver.teamColor}40`,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      })),
    };

    const consistency: ChartData<"scatter"> = {
      datasets: filteredDrivers
        .map((driver) => {
          const stats = processedData.consistencyStats[driver.id];
          const dataPoint =
            stats && !isNaN(stats.avgPosition) && !isNaN(stats.stdDevPosition)
              ? [{ x: stats.stdDevPosition, y: stats.avgPosition }]
              : [];
          return {
            label: driver.name,
            data: dataPoint,
            backgroundColor: driver.teamColor,
            borderColor: `${driver.teamColor}CC`,
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 1,
          };
        })
        .filter((dataset) => dataset.data.length > 0),
    };

    const posChange: ChartData<"bar"> = {
      labels: filteredDrivers.map((d) => d.name),
      datasets: [
        {
          label: "Average Position Change (vs Grid)",
          data: filteredDrivers.map(
            (d) => processedData.positionChangeStats[d.id]?.avgChange || 0
          ),
          backgroundColor: filteredDrivers.map((d) => d.teamColor),
          borderColor: filteredDrivers.map((d) => `${d.teamColor}FF`),
          borderWidth: 1,
        },
      ],
    };

    const fastestLap: ChartData<"bar"> = {
      labels: filteredDrivers.map((d) => d.name),
      datasets: [
        {
          label: "Fastest Laps Count",
          data: filteredDrivers.map(
            (d) => processedData.fastestLapCounts[d.id] || 0
          ),
          backgroundColor: filteredDrivers.map((d) => d.teamColor),
          borderColor: filteredDrivers.map((d) => `${d.teamColor}FF`),
          borderWidth: 1,
        },
      ],
    };

    return { points, consistency, posChange, fastestLap };
  }, [processedData, filteredDrivers]);

  const chartOptions = useMemo(() => {
    const commonBarOptions: ChartOptions<"bar"> = {
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: "rgba(255,255,255,0.8)" },
          title: { color: "rgba(255,255,255,0.8)", display: true },
        },
        y: { ticks: { color: "rgba(255, 255, 255, 0.8)" } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.x}`,
          },
        },
      },
    };

    return {
      points: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Cumulative Points",
              color: "rgba(255, 255, 255, 0.8)",
            },
            ticks: { color: "rgba(255, 255, 255, 0.8)" },
          },
          x: {
            title: {
              display: true,
              text: "Race",
              color: "rgba(255, 255, 255, 0.8)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.8)",
              maxRotation: 90,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 15,
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgba(255, 255, 255, 0.8)",
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: { mode: "index", intersect: false },
        },
      } as ChartOptions<"line">,
      consistency: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: "Average Finishing Position",
              color: "rgba(255, 255, 255, 0.8)",
            },
            ticks: { color: "rgba(255, 255, 255, 0.8)" },
            reverse: true,
            min: 1,
          },
          x: {
            title: {
              display: true,
              text: "Std. Deviation of Position",
              color: "rgba(255, 255, 255, 0.8)",
            },
            ticks: { color: "rgba(255, 255, 255, 0.8)" },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgba(255, 255, 255, 0.8)",
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const label = ctx.dataset.label || "";
                const avgPos = ctx.parsed.y;
                const stdDev = ctx.parsed.x;
                const driverId = processedData?.drivers.find(
                  (d) => d.name === label
                )?.id;
                const raceCount = driverId
                  ? processedData?.consistencyStats[driverId]?.raceCount
                  : 0;
                return `${label}: Avg Pos ${avgPos.toFixed(
                  2
                )}, Std Dev ${stdDev.toFixed(2)} (${raceCount} races finished)`;
              },
            },
          },
        },
      } as ChartOptions<"scatter">,
      posChange: {
        ...commonBarOptions,
        scales: {
          ...commonBarOptions.scales,
          x: {
            ...commonBarOptions.scales?.x,
            title: {
              ...commonBarOptions.scales?.x?.title,
              text: "Average Position Change",
            },
          },
        },
        plugins: {
          ...commonBarOptions.plugins,
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `Avg. Change: ${
                  ctx.parsed.x > 0 ? "+" : ""
                }${ctx.parsed.x.toFixed(2)} positions`,
            },
          },
        },
      } as ChartOptions<"bar">,
      fastestLap: {
        ...commonBarOptions,
        scales: {
          ...commonBarOptions.scales,
          x: {
            ...commonBarOptions.scales?.x,
            title: {
              ...commonBarOptions.scales?.x?.title,
              text: "Number of Fastest Laps",
            },
            ticks: { ...commonBarOptions.scales?.x?.ticks, stepSize: 1 },
          },
        },
        plugins: {
          ...commonBarOptions.plugins,
          tooltip: {
            callbacks: {
              label: (ctx) => `Fastest Laps: ${ctx.parsed.x}`,
            },
          },
        },
      } as ChartOptions<"bar">,
    };
  }, [processedData]);

  // --- Event Handlers ---
  const handleDriverSelectionChange = (driverId: string) => {
    setSelectedDriverIds((prevSelected) => {
      if (prevSelected.includes(driverId)) {
        return prevSelected.filter((id) => id !== driverId);
      } else {
        return [...prevSelected, driverId];
      }
    });
  };

  const handleSelectAllDrivers = () => {
    if (processedData?.drivers) {
      setSelectedDriverIds(processedData.drivers.map((d) => d.id));
    }
  };

  const handleClearAllDrivers = () => {
    setSelectedDriverIds([]);
  };

  // --- Filtering for Driver Selection List ---
  const filteredAvailableDrivers = useMemo(() => {
    return (
      processedData?.drivers.filter((driver) => {
        if (!driverSearchFilter) return true;
        const searchTerm = driverSearchFilter.toLowerCase();
        return (
          driver.name.toLowerCase().includes(searchTerm) ||
          driver.team.toLowerCase().includes(searchTerm)
        );
      }) || []
    );
  }, [processedData, driverSearchFilter]);

  // --- Render Logic ---
  const renderVisualization = () => {
    if (
      !processedData ||
      selectedDriverIds.length === 0 ||
      !chartData ||
      !chartOptions
    ) {
      return null;
    }

    switch (currentView) {
      case "points":
        return (
          chartData.points && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Points Progression ({selectedYear})
              </h3>
              <div className="h-80 md:h-[450px] relative">
                <ErrorBoundary componentName="Points Progression Chart">
                  <Line data={chartData.points} options={chartOptions.points} />
                </ErrorBoundary>
              </div>
            </div>
          )
        );
      case "consistency":
        return (
          chartData.consistency && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Driver Consistency ({selectedYear})
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Lower Average Position (top) and Lower Standard Deviation (left)
                are better. Based on finished races only.
              </p>
              <div className="h-80 md:h-[450px] relative">
                <ErrorBoundary componentName="Consistency Scatter Plot">
                  <Scatter
                    data={chartData.consistency}
                    options={chartOptions.consistency}
                  />
                </ErrorBoundary>
              </div>
            </div>
          )
        );
      case "posChange":
        return (
          chartData.posChange && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Average Position Change ({selectedYear})
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Average places gained (+) or lost (-) from grid position per
                race finished.
              </p>
              <div className="h-80 md:h-[450px] relative">
                <ErrorBoundary componentName="Position Change Chart">
                  <Bar
                    data={chartData.posChange}
                    options={chartOptions.posChange}
                  />
                </ErrorBoundary>
              </div>
            </div>
          )
        );
      case "fastestLap":
        return (
          chartData.fastestLap && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Fastest Lap Counts ({selectedYear})
              </h3>
              <div className="h-80 md:h-[450px] relative">
                <ErrorBoundary componentName="Fastest Laps Chart">
                  <Bar
                    data={chartData.fastestLap}
                    options={chartOptions.fastestLap}
                  />
                </ErrorBoundary>
              </div>
            </div>
          )
        );
      default:
        return null;
    }
  };

  // --- JSX Render ---
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg relative text-gray-200 min-h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Driver Performance Analysis ({selectedYear})
        </h2>
      </div>

      {/* Loading indicator */}
      {isLoadingResults && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-40 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-300">
            Loading race data for {selectedYear}...{" "}
            {loadedRaceCount > 0 &&
              totalRaceCount > 0 &&
              ` (${loadedRaceCount}/${totalRaceCount})`}
          </p>
        </div>
      )}

      {/* Driver Selection Controls */}
      <div className="mb-6 p-4 bg-gray-800 rounded-md border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Select Drivers to Compare
          </label>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAllDrivers}
              disabled={isLoadingResults || !processedData?.drivers?.length}
              className="text-xs px-2 py-1 bg-blue-800 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Select all drivers"
            >
              Select All
            </button>
            <button
              onClick={handleClearAllDrivers}
              disabled={isLoadingResults || selectedDriverIds.length === 0}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="mb-2 relative">
          <input
            type="text"
            placeholder="Search drivers by name or team..."
            value={driverSearchFilter}
            onChange={(e) => setDriverSearchFilter(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-1.5 text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoadingResults || !processedData?.drivers?.length}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {driverSearchFilter && (
            <button
              onClick={() => setDriverSearchFilter("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="max-h-40 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {processedData?.drivers && filteredAvailableDrivers.length > 0 ? (
            filteredAvailableDrivers.map((driver) => (
              <label
                key={driver.id}
                className={`flex items-center p-2 rounded-md cursor-pointer border text-sm ${
                  selectedDriverIds.includes(driver.id)
                    ? "bg-blue-900 border-blue-700"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDriverIds.includes(driver.id)}
                  onChange={() => handleDriverSelectionChange(driver.id)}
                  className="hidden"
                />
                <div
                  className="w-3 h-3 rounded-sm mr-2 flex-shrink-0 border border-gray-400"
                  style={{
                    backgroundColor: selectedDriverIds.includes(driver.id)
                      ? driver.teamColor
                      : "transparent",
                  }}
                ></div>
                <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                  <span
                    className="font-medium"
                    style={{
                      color: selectedDriverIds.includes(driver.id)
                        ? "#FFF"
                        : driver.teamColor,
                    }}
                  >
                    {driver.name.split(" ").pop()}
                  </span>
                  <span className="text-gray-400 text-xs block truncate">
                    {driver.team}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic col-span-full">
              {isLoadingResults
                ? "Loading drivers..."
                : driverSearchFilter
                ? "No drivers match search."
                : `No drivers found for ${selectedYear}.`}
            </p>
          )}
        </div>
      </div>

      {/* Visualization Selection Tabs/Buttons */}
      {!isLoadingResults && processedData && (
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-700 pb-2">
          {/* Use the renamed constant object here */}
          {(
            Object.keys(VisualizationViewValues) as Array<
              keyof typeof VisualizationViewValues
            >
          ).map((key) => {
            const viewValue = VisualizationViewValues[key]; // Use the constant's value
            const viewLabels = {
              points: "Points Progression",
              consistency: "Consistency",
              posChange: "Position Change",
              fastestLap: "Fastest Laps",
            };
            // Ensure viewValue is a valid key for viewLabels
            const label =
              viewLabels[viewValue as keyof typeof viewLabels] ||
              "Unknown View";

            return (
              <button
                key={viewValue}
                onClick={() => setCurrentView(viewValue)} // Use the value ('points', 'consistency', etc.)
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  currentView === viewValue
                    ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-750"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* --- Data Visualizations Area --- */}
      {!isLoadingResults && !resultsError && (
        <div className="mt-6">
          {processedData && selectedDriverIds.length > 0 ? (
            renderVisualization()
          ) : (
            <div className="text-center py-10 px-4 bg-gray-800 rounded-lg mt-6 border border-gray-700 min-h-[300px] flex flex-col justify-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-300">
                {processedData ? "Select Drivers" : "No Data Available"}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {processedData
                  ? "Choose one or more drivers above to visualize their performance."
                  : `Could not process race data for ${selectedYear}.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {resultsError && (
        <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          <h3 className="font-bold mb-2">Error Loading Data</h3>
          <p className="text-sm">
            {typeof resultsError === "string"
              ? resultsError
              : "An unknown error occurred while fetching race results."}
          </p>
        </div>
      )}
    </div>
  );
};

// Renamed constant object to avoid conflict with the type alias
const VisualizationViewValues = {
  points: "points",
  consistency: "consistency",
  posChange: "posChange",
  fastestLap: "fastestLap",
} as const;

export default CircuitPerformanceCard;
