// ErrorBoundaryContext.js
import React, { createContext } from "react";
import ErrorBoundary from "../components/ErrorBoundary";

const ErrorBoundaryContext = createContext();

export const ErrorBoundaryProvider = ({ children }) => {
  return (
    <ErrorBoundaryContext.Provider value={{}}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
};

export default ErrorBoundaryContext;
