import { SVGProps } from "react";

// Type for circuit information
export interface CircuitInfo {
  id: string;
  name: string;
  location: string;
  country: string;
  firstGrandPrix: number;
  laps: number;
  length: string; // in km
  svgComponent: React.FC<CircuitSVGProps>;
  sectors?: {
    [key: string]: {
      name: string;
      description: string;
      color: string;
    };
  };
  turns?: {
    [key: string]: {
      number: number;
      name?: string;
      description?: string;
    };
  };
}

// Props for circuit SVG components
export interface CircuitSVGProps extends SVGProps<SVGElement> {
  highlightedSector?: string;
  highlightedTurn?: string;
  onSectorClick?: (sectorId: string) => void;
  onTurnClick?: (turnId: string) => void;
  lapProgress?: number; // 0-1 for animation
  trackPathRef: React.RefObject<SVGPathElement | null>;
}

// Type for driver fastest lap data
export interface DriverFastestLap {
  driverId: string;
  driverName: string;
  teamName: string;
  lapTime: string;
  lapNumber: string;
  raceName: string;
  sectors?: {
    [key: string]: {
      time: string;
    };
  };
}

// Type for processed driver info
export interface DriverInfo {
  name: string;
  team: string;
  lapTime?: string;
  sectors?: number[];
}

// Type for processed lap data
export interface ProcessedLapData {
  time: string;
  timeInMs: number;
  sectors: number[];
  position: string;
}

// Map of circuit IDs from API to our circuit SVGs
export const CIRCUIT_ID_MAPPING: Record<string, string> = {
  // Direct mappings for circuits we have SVGs for
  monaco: "monaco",
  monza: "monza",
  spa: "spa",
  silverstone: "silverstone",

  // Map all other circuits to one of our available circuits
  albert_park: "silverstone", // Australia
  americas: "monza", // USA
  bahrain: "monza", // Bahrain
  baku: "monaco", // Azerbaijan
  catalunya: "silverstone", // Spain
  hungaroring: "monaco", // Hungary
  imola: "monza", // Italy
  interlagos: "silverstone", // Brazil
  jeddah: "monza", // Saudi Arabia
  marina_bay: "monaco", // Singapore
  red_bull_ring: "silverstone", // Austria
  rodriguez: "monza", // Mexico
  suzuka: "spa", // Japan
  yas_marina: "silverstone", // Abu Dhabi
  zandvoort: "spa", // Netherlands
  ricard: "monza", // France
  miami: "silverstone", // USA Miami
  vegas: "monza", // USA Las Vegas
  losail: "silverstone", // Qatar

  // Additional mappings to improve coverage
  villeneuve: "monza", // Canada
  sakhir: "monza", // Alternative name for Bahrain
  portimao: "silverstone", // Portugal
  mugello: "monza", // Italy
  nurburgring: "spa", // Germany
  istanbul: "silverstone", // Turkey
  cota: "monza", // Circuit of the Americas
  shanghai: "silverstone", // China
  sochi: "monza", // Russia
  hockenheimring: "spa", // Germany
  sepang: "spa", // Malaysia

  // Fallback for any other circuit IDs not explicitly mapped
  default: "silverstone",
};
