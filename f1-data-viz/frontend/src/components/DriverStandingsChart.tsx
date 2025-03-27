import React from "react";
import { DriverStanding } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DriverStandingsChartProps {
  standings: DriverStanding[];
  season: string | number;
}

interface FormattedDriverData {
  name: string;
  code: string;
  points: number;
  position: number;
  constructor: string;
  nationality: string;
  fullName: string;
}

const DriverStandingsChart: React.FC<DriverStandingsChartProps> = ({
  standings,
  season,
}) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">
          No driver standings data available for the {season} season.
        </p>
      </div>
    );
  }

  // Format data for the chart
  const chartData: FormattedDriverData[] = standings
    .map((standing) => ({
      name: standing.Driver.familyName,
      code:
        standing.Driver.code ||
        standing.Driver.familyName.substring(0, 3).toUpperCase(),
      points: parseFloat(standing.points),
      position: parseInt(standing.position),
      constructor: standing.Constructors[0]?.name || "Unknown",
      nationality: standing.Driver.nationality,
      fullName: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
    }))
    .sort((a, b) => a.position - b.position) // Ensure sorted by position
    .slice(0, 10); // Show only top 10 drivers for better visibility

  // Generate colors based on constructors
  const constructorColors: { [key: string]: string } = {
    "Red Bull": "#3671C6",
    Mercedes: "#27F4D2",
    Ferrari: "#FE0000",
    McLaren: "#FF8700",
    Aston: "#00594F",
    "Aston Martin": "#00594F",
    Alpine: "#FF87BC",
    Williams: "#64C4FF",
    AlphaTauri: "#4E7C9B",
    "Alpha Tauri": "#4E7C9B",
    RB: "#6592FF",
    "Alfa Romeo": "#C92D4B",
    Haas: "#B6BABD",
    Sauber: "#52E252",
    // Add more constructors and their colors as needed
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 shadow-lg rounded-md">
          <p className="font-bold text-white">{data.fullName}</p>
          <p className="text-sm text-gray-300">
            <span
              className="inline-block w-4 h-4 mr-2"
              style={{ backgroundColor: getDriverColor(data) }}
            ></span>
            {data.constructor}
          </p>
          <p className="text-sm text-gray-300">Position: {data.position}</p>
          <p className="text-sm text-white font-bold">Points: {data.points}</p>
          <p className="text-sm text-gray-300">
            Nationality: {data.nationality}
          </p>
        </div>
      );
    }
    return null;
  };

  // Function to get color based on constructor
  const getDriverColor = (driver: FormattedDriverData) => {
    return constructorColors[driver.constructor] || "#777777";
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Driver Points - {season} Season
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis
              dataKey="code"
              tick={{ fill: "#fff" }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fill: "#fff" }}
              label={{
                value: "Points",
                angle: -90,
                position: "insideLeft",
                fill: "#fff",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#fff", paddingTop: "10px" }}
              formatter={(value) => <span className="text-white">{value}</span>}
            />
            <Bar dataKey="points" name="Points">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getDriverColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DriverStandingsChart;
