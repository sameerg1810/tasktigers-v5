import "./App.css";
import { LocationPriceProvider } from "./context/LocationPriceContext";
import { ErrorBoundaryProvider } from "./context/ErrorBoundaryContext";
import Routing from "./Routing";

function App() {
  return (
    <>
      <LocationPriceProvider>
        <ErrorBoundaryProvider>
          <Routing />
        </ErrorBoundaryProvider>
      </LocationPriceProvider>
    </>
  );
}

export default App;
