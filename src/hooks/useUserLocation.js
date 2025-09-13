import { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Ensure js-cookie is installed

const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Retrieve location from cookies if available
    const storedLocation = Cookies.get("userLocation");
    console.log(storedLocation , 'Fetched new locaion ')
    if (storedLocation) {
      setLocation(JSON.parse(storedLocation));
      console.log("Using stored location:", JSON.parse(storedLocation));
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      console.error("Geolocation not supported by browser.");
      return;
    }

    // Success callback
    const success = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const newLocation = { latitude, longitude };

      console.log("Fetched new location:", newLocation);

      // Update state and store in cookies
      setLocation(newLocation);
      Cookies.set("userLocation", JSON.stringify(newLocation), { expires: 30 });
      clearTimeout(timeoutId); // Clear timeout if location is fetched successfully
    };

    // Error callback
    const handleError = (error) => {
      console.error("Geolocation error:", error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          setError("The request to get user location timed out.");
          break;
        default:
          setError("An unknown error occurred.");
          break;
      }
      clearTimeout(timeoutId);
    };

    // Set timeout to use fallback location
    const timeoutId = setTimeout(() => {
      const fallbackLocation = { latitude: 17.385, longitude: 78.4867 }; // Hyderabad coordinates
      console.warn(
        "Location fetch timed out. Using fallback location:",
        fallbackLocation
      );
      setLocation(fallbackLocation);
      Cookies.set("userLocation", JSON.stringify(fallbackLocation), {
        expires: 30,
      });
    }, 10000); // Increased timeout to 10 seconds

    // Request user's location
    navigator.geolocation.getCurrentPosition(success, handleError, {
      enableHighAccuracy: true, // Request high accuracy for better results
      timeout: 15000, // 15-second timeout for geolocation
      maximumAge: 0, // Prevent cached location usage
    });

    // Cleanup on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  return { location, error };
};

export default useUserLocation;
