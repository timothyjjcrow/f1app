import React from "react";
import { CircuitSVGProps } from "./CircuitTypes";
import { useDriverPosition, DriverGlowFilter } from "./TrackVisualization";

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

// ----------------------
// SVG Circuit Components
// ----------------------

export const MonacoCircuitSVG: React.FC<CircuitSVGProps> = ({
  highlightedSector,
  highlightedTurn,
  onSectorClick,
  onTurnClick,
  lapProgress,
  trackPathRef,
  ...props
}) => {
  const trackColor = "#CCCCCC";
  const trackWidth = 10;
  const sectorOpacity = 0.3;
  const highlightOpacity = 0.7;

  const monacoTrackPath =
    "M 120 300 L 120 200 C 120 150, 150 120, 200 120 L 300 120 C 350 120, 380 150, 380 200 " +
    "L 380 250 C 380 280, 360 310, 330 310 L 300 310 C 260 310, 230 340, 230 380 " +
    "L 230 450 C 230 480, 260 510, 290 510 L 350 510 C 390 510, 420 480, 420 440 " +
    "L 420 400 C 420 370, 440 340, 470 340 L 530 340 C 560 340, 580 370, 580 400 " +
    "L 580 450 C 580 490, 550 520, 510 520 L 200 520 C 150 520, 120 490, 120 440 " +
    "L 120 310 Z";

  const sectors = {
    sector1: {
      path: "M 120 300 L 120 200 C 120 150, 150 120, 200 120 L 300 120 C 350 120, 380 150, 380 200 L 380 250",
      color: "rgba(255, 0, 0, ",
    },
    sector2: {
      path: "M 380 250 C 380 280, 360 310, 330 310 L 300 310 C 260 310, 230 340, 230 380 L 230 450 C 230 480, 260 510, 290 510",
      color: "rgba(0, 255, 0, ",
    },
    sector3: {
      path: "M 290 510 L 350 510 C 390 510, 420 480, 420 440 L 420 400 C 420 370, 440 340, 470 340 L 530 340 C 560 340, 580 370, 580 400 L 580 450 C 580 490, 550 520, 510 520 L 200 520 C 150 520, 120 490, 120 440 L 120 310",
      color: "rgba(0, 0, 255, ",
    },
  };

  const turns = {
    turn1: { x: 120, y: 280, r: 12, name: "Sainte Devote" },
    turn4: { x: 350, y: 120, r: 12, name: "Casino Square" },
    turn6: { x: 230, y: 380, r: 12, name: "Grand Hotel Hairpin" },
    turn10: { x: 290, y: 510, r: 12, name: "Nouvelle Chicane" },
    turn12: { x: 470, y: 340, r: 12, name: "Tabac" },
    turn19: { x: 120, y: 400, r: 12, name: "Anthony Noghes" },
  };

  const driverPosition = useDriverPosition(lapProgress, trackPathRef);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 600"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <SVGGrid width={700} height={600} columns={14} rows={12} />
      {Object.entries(sectors).map(([id, sector]) => (
        <path
          key={id}
          d={sector.path}
          fill="none"
          stroke={
            sector.color +
            (highlightedSector === id ? highlightOpacity : sectorOpacity) +
            ")"
          }
          strokeWidth={trackWidth + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={() => onSectorClick && onSectorClick(id)}
          style={{ cursor: "pointer" }}
        />
      ))}
      <path
        ref={trackPathRef}
        d={monacoTrackPath}
        fill="none"
        stroke={trackColor}
        strokeWidth={trackWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="120"
        y1="290"
        x2="120"
        y2="310"
        stroke="#FFDD00"
        strokeWidth="5"
      />
      {Object.entries(turns).map(([id, turn]) => (
        <g
          key={id}
          transform={`translate(${turn.x}, ${turn.y})`}
          style={{ cursor: "pointer" }}
          onClick={() => onTurnClick && onTurnClick(id)}
        >
          <circle
            r={turn.r}
            fill={highlightedTurn === id ? "yellow" : "white"}
            stroke="black"
            strokeWidth="1"
            opacity={highlightedTurn === id ? 1 : 0.7}
          />
          <text
            x={turn.r + 5}
            y="4"
            fontSize="10"
            fill="white"
            opacity="0.9"
            style={{ display: highlightedTurn === id ? "block" : "none" }}
          >
            {turn.name}
          </text>
        </g>
      ))}
      {driverPosition && (
        <circle
          cx={driverPosition.x}
          cy={driverPosition.y}
          r="7"
          fill="red"
          stroke="white"
          strokeWidth="1.5"
          filter="url(#driver-glow-monaco)"
        />
      )}
      <text x="260" y="60" fill="#999" fontSize="14" fontWeight="bold">
        Circuit de Monaco
      </text>
      <DriverGlowFilter id="driver-glow-monaco" />
    </svg>
  );
};

export const SilverstoneCircuitSVG: React.FC<CircuitSVGProps> = ({
  highlightedSector,
  highlightedTurn,
  onSectorClick,
  onTurnClick,
  lapProgress,
  trackPathRef,
  ...props
}) => {
  const trackColor = "#CCCCCC";
  const trackWidth = 8;
  const sectorOpacity = 0.3;
  const highlightOpacity = 0.7;

  const silverstoneTrackPath =
    "M 200,150 L 150,150 C 120,150 100,170 100,200 L 100,230 C 100,260 120,280 150,280 " +
    "L 250,280 C 270,280 290,290 300,310 L 330,360 C 340,380 360,390 380,390 " +
    "L 450,390 C 470,390 490,380 500,360 L 540,300 C 550,280 580,270 600,270 " +
    "L 650,270 C 680,270 700,250 700,220 L 700,180 C 700,150 680,130 650,130 " +
    "L 500,130 C 470,130 450,110 450,80 L 450,50 C 450,20 430,0 400,0 " +
    "L 250,0 C 220,0 200,20 200,50 Z";

  const sectors = {
    sector1: {
      path: "M 200,150 L 150,150 C 120,150 100,170 100,200 L 100,230 C 100,260 120,280 150,280 L 250,280",
      color: "rgba(255, 0, 0, ",
    },
    sector2: {
      path: "M 250,280 C 270,280 290,290 300,310 L 330,360 C 340,380 360,390 380,390 L 450,390",
      color: "rgba(0, 255, 0, ",
    },
    sector3: {
      path: "M 450,390 C 470,390 490,380 500,360 L 540,300 C 550,280 580,270 600,270 L 650,270 C 680,270 700,250 700,220 L 700,180 C 700,150 680,130 650,130 L 500,130 C 470,130 450,110 450,80 L 450,50 C 450,20 430,0 400,0 L 250,0 C 220,0 200,20 200,50 Z",
      color: "rgba(0, 0, 255, ",
    },
  };

  const turns = {
    turn1: { x: 200, y: 150, r: 10, name: "Abbey" },
    turn3: { x: 100, y: 230, r: 10, name: "Village" },
    turn6: { x: 250, y: 280, r: 10, name: "Brooklands" },
    turn9: { x: 380, y: 390, r: 10, name: "Copse" },
    turn13: { x: 650, y: 270, r: 10, name: "Stowe" },
    turn15: { x: 450, y: 50, r: 10, name: "Club" },
  };

  const driverPosition = useDriverPosition(lapProgress, trackPathRef);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <SVGGrid width={800} height={450} columns={16} rows={9} />
      {Object.entries(sectors).map(([id, sector]) => (
        <path
          key={id}
          d={sector.path}
          fill="none"
          stroke={
            sector.color +
            (highlightedSector === id ? highlightOpacity : sectorOpacity) +
            ")"
          }
          strokeWidth={trackWidth + 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={() => onSectorClick && onSectorClick(id)}
          style={{ cursor: "pointer" }}
        />
      ))}
      <path
        ref={trackPathRef}
        d={silverstoneTrackPath}
        fill="none"
        stroke={trackColor}
        strokeWidth={trackWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="190"
        y1="150"
        x2="210"
        y2="150"
        stroke="#FFDD00"
        strokeWidth="5"
        transform="rotate(90 200 150)"
      />
      {Object.entries(turns).map(([id, turn]) => (
        <g
          key={id}
          transform={`translate(${turn.x}, ${turn.y})`}
          style={{ cursor: "pointer" }}
          onClick={() => onTurnClick && onTurnClick(id)}
        >
          <circle
            r={turn.r}
            fill={highlightedTurn === id ? "yellow" : "white"}
            stroke="black"
            strokeWidth="1"
            opacity={highlightedTurn === id ? 1 : 0.7}
          />
          <text
            x={turn.r + 5}
            y="4"
            fontSize="9"
            fill="white"
            opacity="0.9"
            style={{ display: highlightedTurn === id ? "block" : "none" }}
          >
            {turn.name}
          </text>
        </g>
      ))}
      {driverPosition && (
        <circle
          cx={driverPosition.x}
          cy={driverPosition.y}
          r="6"
          fill="blue"
          stroke="white"
          strokeWidth="1.5"
          filter="url(#driver-glow-silverstone)"
        />
      )}
      <text x="350" y="30" fill="#999" fontSize="14" fontWeight="bold">
        Silverstone Circuit
      </text>
      <DriverGlowFilter id="driver-glow-silverstone" />
    </svg>
  );
};

export const SpaCircuitSVG: React.FC<CircuitSVGProps> = ({
  highlightedSector,
  highlightedTurn,
  onSectorClick,
  onTurnClick,
  lapProgress,
  trackPathRef,
  ...props
}) => {
  const trackColor = "#CCCCCC";
  const trackWidth = 8;
  const sectorOpacity = 0.3;
  const highlightOpacity = 0.7;

  const spaTrackPath =
    "M 50,300 L 100,250 C 120,230 150,220 180,220 L 250,220 C 280,220 300,200 300,170 " +
    "L 300,100 C 300,70 320,50 350,50 L 500,50 C 530,50 550,70 550,100 " +
    "L 550,150 C 550,180 570,200 600,200 L 700,200 C 730,200 750,220 750,250 " +
    "L 750,300 C 750,320 730,340 700,340 L 650,340 C 620,340 600,360 600,390 " +
    "L 600,450 C 600,480 580,500 550,500 L 200,500 C 170,500 150,480 150,450 " +
    "L 150,400 C 150,370 130,350 100,350 L 50,350 Z";

  const sectors = {
    sector1: {
      path: "M 50,300 L 100,250 C 120,230 150,220 180,220 L 250,220 C 280,220 300,200 300,170 L 300,100 C 300,70 320,50 350,50",
      color: "rgba(255, 0, 0, ",
    },
    sector2: {
      path: "M 350,50 L 500,50 C 530,50 550,70 550,100 L 550,150 C 550,180 570,200 600,200 L 700,200",
      color: "rgba(0, 255, 0, ",
    },
    sector3: {
      path: "M 700,200 C 730,200 750,220 750,250 L 750,300 C 750,320 730,340 700,340 L 650,340 C 620,340 600,360 600,390 L 600,450 C 600,480 580,500 550,500 L 200,500 C 170,500 150,480 150,450 L 150,400 C 150,370 130,350 100,350 L 50,350 Z",
      color: "rgba(0, 0, 255, ",
    },
  };

  const turns = {
    turn1: { x: 50, y: 300, r: 10, name: "La Source" },
    turn3: { x: 300, y: 170, r: 10, name: "Eau Rouge" },
    turn7: { x: 550, y: 100, r: 10, name: "Les Combes" },
    turn10: { x: 700, y: 200, r: 10, name: "Pouhon" },
    turn15: { x: 600, y: 390, r: 10, name: "Blanchimont" },
    turn19: { x: 150, y: 400, r: 10, name: "Bus Stop" },
  };

  const driverPosition = useDriverPosition(lapProgress, trackPathRef);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 550"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      {Object.entries(sectors).map(([id, sector]) => (
        <path
          key={id}
          d={sector.path}
          fill="none"
          stroke={
            sector.color +
            (highlightedSector === id ? highlightOpacity : sectorOpacity) +
            ")"
          }
          strokeWidth={trackWidth + 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={() => onSectorClick && onSectorClick(id)}
          style={{ cursor: "pointer" }}
        />
      ))}
      <path
        ref={trackPathRef}
        d={spaTrackPath}
        fill="none"
        stroke={trackColor}
        strokeWidth={trackWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="290"
        x2="50"
        y2="310"
        stroke="#FFDD00"
        strokeWidth="5"
      />
      {Object.entries(turns).map(([id, turn]) => (
        <g
          key={id}
          transform={`translate(${turn.x}, ${turn.y})`}
          style={{ cursor: "pointer" }}
          onClick={() => onTurnClick && onTurnClick(id)}
        >
          <circle
            r={turn.r}
            fill={highlightedTurn === id ? "yellow" : "white"}
            stroke="black"
            strokeWidth="1"
            opacity={highlightedTurn === id ? 1 : 0.7}
          />
          <text
            x={turn.r + 5}
            y="4"
            fontSize="9"
            fill="white"
            opacity="0.9"
            style={{ display: highlightedTurn === id ? "block" : "none" }}
          >
            {turn.name}
          </text>
        </g>
      ))}
      {driverPosition && (
        <circle
          cx={driverPosition.x}
          cy={driverPosition.y}
          r="6"
          fill="yellow"
          stroke="black"
          strokeWidth="1.5"
          filter="url(#driver-glow-spa)"
        />
      )}
      <text x="300" y="30" fill="#999" fontSize="14" fontWeight="bold">
        Circuit de Spa-Francorchamps
      </text>
      <DriverGlowFilter id="driver-glow-spa" />
    </svg>
  );
};

export const MonzaCircuitSVG: React.FC<CircuitSVGProps> = ({
  highlightedSector,
  highlightedTurn,
  onSectorClick,
  onTurnClick,
  lapProgress,
  trackPathRef,
  ...props
}) => {
  const trackColor = "#CCCCCC";
  const trackWidth = 8;
  const sectorOpacity = 0.3;
  const highlightOpacity = 0.7;

  const monzaTrackPath =
    "M 150,400 L 150,300 C 150,270 170,250 200,250 L 400,250 C 430,250 450,230 450,200 " +
    "L 450,100 C 450,70 470,50 500,50 L 600,50 C 630,50 650,70 650,100 " +
    "L 650,200 C 650,230 670,250 700,250 L 750,250 C 780,250 800,270 800,300 " +
    "L 800,350 C 800,380 780,400 750,400 L 700,400 C 670,400 650,420 650,450 " +
    "L 650,500 C 650,530 630,550 600,550 L 500,550 C 470,550 450,530 450,500 " +
    "L 450,450 C 450,420 430,400 400,400 L 200,400 C 170,400 150,380 150,350 Z";

  const sectors = {
    sector1: {
      path: "M 150,400 L 150,300 C 150,270 170,250 200,250 L 400,250",
      color: "rgba(255, 0, 0, ",
    },
    sector2: {
      path: "M 400,250 C 430,250 450,230 450,200 L 450,100 C 450,70 470,50 500,50 L 600,50 C 630,50 650,70 650,100 L 650,200 C 650,230 670,250 700,250",
      color: "rgba(0, 255, 0, ",
    },
    sector3: {
      path: "M 700,250 L 750,250 C 780,250 800,270 800,300 L 800,350 C 800,380 780,400 750,400 L 700,400 C 670,400 650,420 650,450 L 650,500 C 650,530 630,550 600,550 L 500,550 C 470,550 450,530 450,500 L 450,450 C 450,420 430,400 400,400 L 200,400 C 170,400 150,380 150,350 Z",
      color: "rgba(0, 0, 255, ",
    },
  };

  const turns = {
    turn1: { x: 150, y: 350, r: 10, name: "Variante del Rettifilo" },
    turn3: { x: 200, y: 250, r: 10, name: "Curva Grande" },
    turn4: { x: 450, y: 200, r: 10, name: "First Lesmo" },
    turn7: { x: 650, y: 100, r: 10, name: "Second Lesmo" },
    turn8: { x: 700, y: 250, r: 10, name: "Variante Ascari" },
    turn11: { x: 650, y: 450, r: 10, name: "Parabolica" },
  };

  const driverPosition = useDriverPosition(lapProgress, trackPathRef);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      {Object.entries(sectors).map(([id, sector]) => (
        <path
          key={id}
          d={sector.path}
          fill="none"
          stroke={
            sector.color +
            (highlightedSector === id ? highlightOpacity : sectorOpacity) +
            ")"
          }
          strokeWidth={trackWidth + 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          onClick={() => onSectorClick && onSectorClick(id)}
          style={{ cursor: "pointer" }}
        />
      ))}
      <path
        ref={trackPathRef}
        d={monzaTrackPath}
        fill="none"
        stroke={trackColor}
        strokeWidth={trackWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="150"
        y1="390"
        x2="150"
        y2="410"
        stroke="#FFDD00"
        strokeWidth="5"
      />
      {Object.entries(turns).map(([id, turn]) => (
        <g
          key={id}
          transform={`translate(${turn.x}, ${turn.y})`}
          style={{ cursor: "pointer" }}
          onClick={() => onTurnClick && onTurnClick(id)}
        >
          <circle
            r={turn.r}
            fill={highlightedTurn === id ? "yellow" : "white"}
            stroke="black"
            strokeWidth="1"
            opacity={highlightedTurn === id ? 1 : 0.7}
          />
          <text
            x={turn.r + 5}
            y="4"
            fontSize="9"
            fill="white"
            opacity="0.9"
            style={{ display: highlightedTurn === id ? "block" : "none" }}
          >
            {turn.name}
          </text>
        </g>
      ))}
      {driverPosition && (
        <circle
          cx={driverPosition.x}
          cy={driverPosition.y}
          r="6"
          fill="green"
          stroke="white"
          strokeWidth="1.5"
          filter="url(#driver-glow-monza)"
        />
      )}
      <text x="350" y="30" fill="#999" fontSize="14" fontWeight="bold">
        Autodromo Nazionale Monza
      </text>
      <DriverGlowFilter id="driver-glow-monza" />
    </svg>
  );
};
