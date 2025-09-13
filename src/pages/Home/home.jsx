import React, { useContext, useEffect, useState } from "react";
import Maincategory from "../Home/maincategory";
import Howitworks from "../Home/howitworks";
import ApplianceRepair from "./Appliance-Services/ApplianceRepair";
import "./home.css";
import WomenSloon from "./Women-saloon/womenSloon";
// import Mensaloon from "./Men-saloon/mensaloon";
import SpaWomen from "./Spa-women/spaWomen";
import { useLocationPrice } from "../../context/LocationPriceContext"; // Import the useLocationPrice hook
import Loading from "../../components/Loading/loading"; // Import the Loading component
import { CategoryContext } from "../../context/CategoryContext";
import Homeblogs from "./Home-blogs/homeblogs";
import Getexperts from "./Getexperts/getexperts";

const Home = () => {
  const { initialFetchComplete } = useLocationPrice(); // Get fetch completion status
  const { servingLocations, setServingLocations } = useContext(CategoryContext); // Context for location

  const [loadingVisible, setLoadingVisible] = useState(() => {
    // Initialize loading state based on session storage
    const hasLoaded = sessionStorage.getItem("hasHomeLoaded") === "true";
    return !hasLoaded;
  });

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("hasHomeLoaded") === "true";

    if (!hasLoaded && initialFetchComplete) {
      // Set session storage to mark the page as loaded
      sessionStorage.setItem("hasHomeLoaded", "true");

      // Delay the transition from loading to content
      const timeoutId = setTimeout(() => {
        setLoadingVisible(false);
      }, 500); // Adjust delay time as needed (500ms)

      // Cleanup the timeout if the component unmounts early
      return () => clearTimeout(timeoutId);
    } else if (hasLoaded) {
      // Immediately hide loading if already marked as loaded in session
      setLoadingVisible(false);
    }
  }, [initialFetchComplete]);



  return (
    <div className="home-main">
      {/* Conditionally render the Loading component */}
      {loadingVisible && <Loading message="Loading, please wait..." />}

      {/* Main content */}
      {!loadingVisible && (
        <>
          <div >
            <Maincategory />
            <Getexperts/>
            <WomenSloon />
            <SpaWomen />
            <Howitworks />
            <ApplianceRepair />
            {/* <OurPopularServices /> */}
            {/* <Mensaloon /> */}
            {/* <Homeblogs/> */}
          </div>
        </>
      )}

      
    </div>
  );
};

export default Home;
