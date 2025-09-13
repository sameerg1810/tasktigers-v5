// HelpContext.jsx
import React, { createContext, useContext, useState } from "react";

// Create the HelpContext
const HelpContext = createContext();

// Custom hook to use HelpContext
export const useHelp = () => useContext(HelpContext);

// HelpProvider component to provide context values
export const HelpProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState(null);
  const [isChatToggle,setIsChatToggle]=useState(false)
  // Function to update booking details in the context
  const updateBookingDetails = (booking) => {
    setBookingData(booking);
  };

  return (
    <HelpContext.Provider value={{ bookingData, updateBookingDetails,setIsChatToggle,isChatToggle }}>
      {children}
    </HelpContext.Provider>
  );
};
