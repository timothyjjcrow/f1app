import React from "react";
import { useSeasonContext } from "../contexts/SeasonContext";

const SeasonSelector: React.FC = () => {
  const { selectedYear, setSelectedYear, years } = useSeasonContext();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  return (
    <div className="mb-4">
      <label htmlFor="year-select" className="f1-select-label">
        Select Season:
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={handleYearChange}
        className="f1-select"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year} Season
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonSelector;
