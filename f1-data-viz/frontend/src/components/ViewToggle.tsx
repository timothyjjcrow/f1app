import React from "react";
import { useStandingsContext } from "../contexts/StandingsContext";

const ViewToggle: React.FC = () => {
  const { activeView, setActiveView } = useStandingsContext();

  return (
    <div className="f1-tabs">
      <button
        className={activeView === "table" ? "f1-tab-active" : "f1-tab"}
        onClick={() => setActiveView("table")}
      >
        Table View
      </button>
      <button
        className={activeView === "chart" ? "f1-tab-active" : "f1-tab"}
        onClick={() => setActiveView("chart")}
      >
        Chart View
      </button>
    </div>
  );
};

export default ViewToggle;
