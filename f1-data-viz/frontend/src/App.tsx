import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import { AppProvider } from "./contexts/AppProvider";
import DriverStandingsCard from "./components/DriverStandingsCard";
import RaceResultsCard from "./components/RaceResultsCard";
import DriverComparisonCard from "./components/DriverComparisonCard";
import ApiDebugTester from "./components/ApiDebugTester";
import DataLoadTest from "./components/DataLoadTest";
import ErrorBoundary from "./components/ErrorBoundary";
import SeasonSelector from "./components/SeasonSelector";
import CircuitPerformanceCard from "./components/CircuitPerformanceCard";
import CircuitDebugger from "./components/CircuitDebugger";
import TabNavigation from "./components/TabNavigation";
import CircuitLayoutVisualizer from "./components/CircuitLayoutVisualizer";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("drivers");
  const [showDebugTools, setShowDebugTools] = useState(false);

  // Handle global errors that might be caught by error boundaries
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a production app, you might want to send this to a logging service
    console.error("Global error caught by Error Boundary:", error, errorInfo);
  };

  // Tab configuration
  const tabs = [
    {
      id: "drivers",
      label: "Driver Standings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "races",
      label: "Race Results",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
          />
        </svg>
      ),
    },
    {
      id: "comparison",
      label: "Driver Comparison",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "circuits",
      label: "Circuit Performance",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      id: "circuit-layout",
      label: "Circuit Layouts",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6l4 2"
          />
        </svg>
      ),
    },
    {
      id: "debug",
      label: "Debug Tools",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <ErrorBoundary
      componentName="Application"
      onError={handleError}
      fallback={
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="bg-red-900/50 border border-red-800 p-8 rounded-lg max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Application Error</h1>
            <p className="mb-6">
              We're sorry, but the application encountered a critical error.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Refresh Application
            </button>
          </div>
        </div>
      }
    >
      <AppProvider>
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
          {/* Header with logo */}
          <header className="bg-slate-800 shadow-md py-4">
            <div className="max-w-[95%] w-full mx-auto flex items-center">
              <div className="flex items-center gap-3">
                <img
                  src={reactLogo}
                  className="h-12 w-12 animate-spin-slow"
                  alt="React logo"
                />
                <h1 className="text-3xl font-bold text-red-500">
                  F1 Data Visualizer
                </h1>
              </div>
            </div>
          </header>

          {/* Tab Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main Content - Tab Content */}
          <main className="flex-grow bg-slate-900">
            {activeTab === "drivers" && (
              <ErrorBoundary componentName="Driver Standings">
                <DriverStandingsCard />
              </ErrorBoundary>
            )}

            {activeTab === "races" && (
              <ErrorBoundary componentName="Race Results">
                <RaceResultsCard />
              </ErrorBoundary>
            )}

            {activeTab === "comparison" && (
              <ErrorBoundary componentName="Driver Comparison">
                <DriverComparisonCard />
              </ErrorBoundary>
            )}

            {activeTab === "circuits" && (
              <ErrorBoundary componentName="Circuit Performance">
                <CircuitPerformanceCard />
              </ErrorBoundary>
            )}

            {activeTab === "circuit-layout" && (
              <ErrorBoundary componentName="Circuit Layout Visualizer">
                <CircuitLayoutVisualizer />
              </ErrorBoundary>
            )}

            {activeTab === "debug" && (
              <div className="w-full p-6">
                <div className="max-w-7xl mx-auto space-y-10">
                  <ErrorBoundary componentName="API Debugger">
                    <ApiDebugTester />
                  </ErrorBoundary>
                  <ErrorBoundary componentName="Data Load Diagnostics">
                    <DataLoadTest />
                  </ErrorBoundary>
                  <ErrorBoundary componentName="Circuit Debugger">
                    <CircuitDebugger />
                  </ErrorBoundary>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-slate-800 shadow-inner py-6">
            <div className="max-w-[95%] w-full mx-auto px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-slate-400 text-lg">
                  F1 Data Visualizer &copy; {new Date().getFullYear()}
                </p>
                <div className="flex gap-6 mt-3 md:mt-0">
                  <a
                    href="#"
                    className="text-lg text-slate-400 hover:text-red-400 transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="text-lg text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="text-lg text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
