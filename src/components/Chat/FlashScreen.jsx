import React, { useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

const   flashscreen = `${IMAGE_BASE_URL}/Flashscreen-bot.svg`; // Import the SVG

const FlashScreen = ({ onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000); // Flash screen will be visible for 3 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="flash-screen">
      <img
        src={flashscreen}
        alt="Flash Screen Background"
        className="flash-screen-background"
      />
    </div>
  );
};

export default FlashScreen;
