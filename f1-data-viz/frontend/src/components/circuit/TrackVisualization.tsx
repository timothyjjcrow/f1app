import React, { useEffect, useState } from "react";
import { CircuitInfo, CircuitSVGProps, DriverInfo } from "./CircuitTypes";

interface TrackProps {
  circuitInfo: CircuitInfo;
  highlightedSector?: string;
  highlightedTurn?: string;
  onSectorClick: (sectorId: string) => void;
  onTurnClick: (turnId: string) => void;
  lapProgress: number | null;
  trackPathRef: React.RefObject<SVGPathElement | null>;
  selectedDriverId: string;
  driversInfo: Map<string, DriverInfo>;
}

// Hook to animate driver position along the track
export function useDriverPosition(
  lapProgress: number | undefined | null,
  trackPathRef: React.RefObject<SVGPathElement | null>
) {
  const [driverPosition, setDriverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (
      trackPathRef.current &&
      typeof lapProgress === "number" &&
      lapProgress >= 0 &&
      lapProgress <= 1
    ) {
      const pathElement = trackPathRef.current;
      const totalLength = pathElement.getTotalLength();
      if (totalLength > 0) {
        const point = pathElement.getPointAtLength(lapProgress * totalLength);
        setDriverPosition({ x: point.x, y: point.y });
      } else {
        setDriverPosition(null);
      }
    } else {
      setDriverPosition(null);
    }
  }, [lapProgress, trackPathRef]);

  return driverPosition;
}

// Component to display driver's fastest lap information
const DriverLapInfo: React.FC<{
  driverInfo: DriverInfo;
  circuitInfo: CircuitInfo;
  highlightedSector?: string;
  onSectorClick: (sectorId: string) => void;
}> = ({ driverInfo, circuitInfo, highlightedSector, onSectorClick }) => {
  if (!driverInfo.lapTime) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded p-4">
        <p className="text-gray-400 text-sm">
          No lap time data available for this driver.
        </p>
      </div>
    );
  }

  // Format milliseconds to a readable string (e.g., "1.234 s")
  const formatMs = (ms: number) => {
    return `${(ms / 1000).toFixed(3)} s`;
  };

  const sectors = driverInfo.sectors || [];
  const sectorColors = circuitInfo.sectors
    ? Object.values(circuitInfo.sectors).map((s) => s.color)
    : ["red", "green", "blue"];

  // Calculate total time (should match lapTime but we'll calculate from sectors as a double-check)
  const totalMs = sectors.reduce((sum, time) => sum + time, 0);

  // Function to get sector ID from index
  const getSectorId = (idx: number) => `sector${idx + 1}`;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-white">{driverInfo.name}</h3>
        <span className="text-gray-400 text-sm">{driverInfo.team}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Fastest Lap</span>
          <span className="text-xl font-mono text-white">
            {driverInfo.lapTime}
          </span>
        </div>
        <div className="h-1 bg-gray-700 mt-1 rounded overflow-hidden">
          <div className="h-full bg-green-500 w-full"></div>
        </div>
      </div>

      <h4 className="text-gray-300 mb-2">Sector Times</h4>
      <div className="space-y-2">
        {sectors.map((sectorTime, idx) => {
          const sectorId = getSectorId(idx);
          const isHighlighted = highlightedSector === sectorId;

          return (
            <div
              key={idx}
              className={`sector-data p-2 rounded transition-colors cursor-pointer ${
                isHighlighted ? "bg-gray-700" : "hover:bg-gray-700/50"
              }`}
              onClick={() => onSectorClick(sectorId)}
            >
              <div className="flex justify-between mb-1">
                <span
                  className={`${
                    isHighlighted ? "text-white font-medium" : "text-gray-400"
                  }`}
                >
                  Sector {idx + 1}
                </span>
                <span className="font-mono text-white">
                  {formatMs(sectorTime)}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isHighlighted ? "opacity-100" : "opacity-80"
                  }`}
                  style={{
                    width: `${(sectorTime / totalMs) * 100}%`,
                    backgroundColor: sectorColors[idx] || "#ccc",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-300">Total Time</span>
          <span className="font-mono text-white">{formatMs(totalMs)}</span>
        </div>
      </div>
    </div>
  );
};

// Reusable SVG Grid component
const SVGGrid: React.FC<{
  width: number;
  height: number;
  columns: number;
  rows: number;
}> = ({ width, height, columns, rows }) => (
  <g opacity="0.1">
    {Array.from({ length: columns }).map((_, i) => (
      <line
        key={`vgrid-${i}`}
        x1={(i + 1) * (width / columns)}
        y1="0"
        x2={(i + 1) * (width / columns)}
        y2={height}
        stroke="#666"
        strokeWidth="1"
      />
    ))}
    {Array.from({ length: rows }).map((_, i) => (
      <line
        key={`hgrid-${i}`}
        x1="0"
        y1={(i + 1) * (height / rows)}
        x2={width}
        y2={(i + 1) * (height / rows)}
        stroke="#666"
        strokeWidth="1"
      />
    ))}
  </g>
);

// Reusable SVG Filter definition for driver glow
export const DriverGlowFilter: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const TrackVisualization: React.FC<TrackProps> = ({
  circuitInfo,
  highlightedSector,
  highlightedTurn,
  onSectorClick,
  onTurnClick,
  lapProgress,
  trackPathRef,
  selectedDriverId,
  driversInfo,
}) => {
  const CircuitSVGComponent = circuitInfo.svgComponent;
  const selectedDriver = selectedDriverId
    ? driversInfo.get(selectedDriverId)
    : undefined;

  return (
    <div className="mt-4">
      {/* Main content area with responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Track Visualization - Takes 2/3 of the space on larger screens */}
        <div className="lg:col-span-2 border border-gray-700 rounded p-4 bg-gray-800">
          {CircuitSVGComponent && (
            <CircuitSVGComponent
              lapProgress={lapProgress || 0}
              highlightedSector={highlightedSector}
              highlightedTurn={highlightedTurn}
              onSectorClick={onSectorClick}
              onTurnClick={onTurnClick}
              trackPathRef={trackPathRef}
              className="w-full h-auto"
            />
          )}

          {/* Caption with information about interactivity */}
          <div className="flex mt-2 justify-center text-xs text-gray-400">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Sector 1</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Sector 2</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Sector 3</span>
            </div>
          </div>
        </div>

        {/* Driver's Fastest Lap Information - Takes 1/3 of the space on larger screens */}
        <div className="lg:col-span-1">
          {selectedDriverId && selectedDriver && (
            <DriverLapInfo
              driverInfo={selectedDriver}
              circuitInfo={circuitInfo}
              highlightedSector={highlightedSector}
              onSectorClick={onSectorClick}
            />
          )}

          {selectedDriverId && !selectedDriver && (
            <div className="bg-gray-800 border border-gray-700 rounded p-4 text-center h-full flex items-center justify-center">
              <p className="text-amber-400">
                No lap data available for the selected driver.
              </p>
            </div>
          )}

          {!selectedDriverId && (
            <div className="bg-gray-800 border border-gray-700 rounded p-4 text-center h-full flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Select a driver to view fastest lap information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackVisualization;
