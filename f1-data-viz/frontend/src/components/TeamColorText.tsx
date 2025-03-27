import React from "react";

// Map constructor names to tailwind color names
const constructorToColorMap: Record<string, string> = {
  Mercedes: "team-mercedes",
  "Red Bull": "team-red-bull",
  Ferrari: "team-ferrari",
  McLaren: "team-mclaren",
  Alpine: "team-alpine",
  "Aston Martin": "team-aston-martin",
  AlphaTauri: "team-alphatauri",
  "Alpha Tauri": "team-alphatauri",
  "Alfa Romeo": "team-alfa-romeo",
  Williams: "team-williams",
  "Haas F1 Team": "team-haas",
  Haas: "team-haas",
  // Add historical teams if needed
};

interface TeamColorTextProps {
  teamName: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Component that renders text with the appropriate F1 team color
 */
const TeamColorText: React.FC<TeamColorTextProps> = ({
  teamName,
  children,
  className = "",
}) => {
  const colorClass = constructorToColorMap[teamName] || "";

  return <span className={`text-${colorClass} ${className}`}>{children}</span>;
};

export default TeamColorText;
