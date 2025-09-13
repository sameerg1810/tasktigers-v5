import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING, // Use Vite's `import.meta.env` for env variables
    enableAutoRouteTracking: true, // Automatically track route changes
    extensions: [reactPlugin],
    enableCorsCorrelation: true,
    distributedTracingMode: 1, // AI_AND_W3C mode for distributed tracing
  },
});

appInsights.loadAppInsights();

export { reactPlugin, appInsights };
