import React from "react";
import ReactDOM from "react-dom/client"; // Or ReactDOMClient for React 18+
import "./index.css";
import App from "./App";
import { reactPlugin } from "./utils/appInsights"; // Import the reactPlugin
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js"; // Import AppInsightsContext

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppInsightsContext.Provider value={reactPlugin}>
      <App />
    </AppInsightsContext.Provider>
  </React.StrictMode>,
);
