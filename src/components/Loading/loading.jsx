import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const logo =  `${IMAGE_BASE_URL}/logo.png`; 
import "./loading.css"; // Make sure the CSS file is properly linked
import { useLocationPrice } from "../../context/LocationPriceContext"; // Import the context

const Loading = ({ message }) => {
  const { initialFetchComplete } = useLocationPrice(); // Access the fetch status
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress increment until `initialFetchComplete` is true
    let progressInterval;
    if (!initialFetchComplete) {
      progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          // Increase progress until 90%, waiting for actual completion
          if (prevProgress < 90) {
            return prevProgress + 5;
          } else {
            return prevProgress;
          }
        });
      }, 300); // Adjust speed as needed
    } else {
      // If fetch is complete, set progress to 100% and clear interval
      setProgress(100);
      clearInterval(progressInterval);
    }

    return () => clearInterval(progressInterval); // Clean up on component unmount
  }, [initialFetchComplete]);

  return (
    <div className="loading-main-con" role="alert" aria-live="assertive">
      <div className="loading-sub-con">
        <img
          src={logo}
          alt="Loading animation"
          className="loading-logo"
          aria-hidden="true" // Hides logo from screen readers
        />
      </div>
      <div className="loadrtl" aria-hidden="true">
        <div
          className="loadrtl-fill"
          style={{ width: `${progress}%` }} // Set progress dynamically
        ></div>
      </div>
    </div>
  );
};

export default Loading;
