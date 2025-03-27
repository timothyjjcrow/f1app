import React, { ReactNode } from "react";
import { SeasonProvider } from "./SeasonContext";
import { StandingsProvider } from "./StandingsContext";
import { RaceResultsProvider } from "./RaceResultsContext";
import ErrorBoundary from "../components/ErrorBoundary";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // This error boundary will catch errors in the context providers themselves
  return (
    <ErrorBoundary
      componentName="Data Providers"
      fallback={
        <div className="f1-error p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Data Provider Error</h3>
          <p className="mb-4">
            There was an error initializing the application data. Please try
            refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="f1-button"
          >
            Refresh Application
          </button>
        </div>
      }
    >
      <SeasonProvider>
        <StandingsProvider>
          <RaceResultsProvider>{children}</RaceResultsProvider>
        </StandingsProvider>
      </SeasonProvider>
    </ErrorBoundary>
  );
};
