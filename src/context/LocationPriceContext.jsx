import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import LZString from "lz-string";

const LocationPriceContext = createContext();

// Custom hook to use the LocationPriceContext
export const useLocationPrice = () => useContext(LocationPriceContext);

// The provider component that wraps your app and provides context values
export const LocationPriceProvider = ({ children }) => {
  const locationRef = useRef({
    adminLevel3: "",
    adminLevel2: "",
    adminLevel1: "",
    locality: "",
    postalCode: "",
  });

  const customPriceDataRef = useRef(null);
  const districtPriceDataRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialFetchComplete, setInitialFetchComplete] = useState(
    sessionStorage.getItem("initialFetchComplete") === "true",
  );

  // Function to compress and store data in session storage
  const compressAndStore = (key, data) => {
    const compressedData = LZString.compress(JSON.stringify(data));
    sessionStorage.setItem(key, compressedData);
  };

  // Function to retrieve and decompress data from session storage
  const retrieveFromStorage = (key) => {
    const compressedData = sessionStorage.getItem(key);
    if (compressedData) {
      return JSON.parse(LZString.decompress(compressedData));
    }
    return null;
  };

  // Function to compress and store pincode in localStorage
  const storePincode = (pincode) => {
    const compressedPincode = LZString.compress(pincode);
    localStorage.setItem("userPincode", compressedPincode);
  };

  // Debug log for custom price data
  useEffect(() => {
    console.log(customPriceDataRef, "custom price data in location context");
  }, []);

  // Function to retrieve pincode from localStorage
  const getStoredPincode = () => {
    const compressedPincode = localStorage.getItem("userPincode");
    if (compressedPincode) {
      return LZString.decompress(compressedPincode);
    }
    return null;
  };

  // Automatically store pincode in localStorage when geocode data is fetched
  useEffect(() => {
    if (locationRef.current.postalCode) {
      storePincode(locationRef.current.postalCode);
      sessionStorage.setItem("storedPincode", locationRef.current.postalCode);
      console.log(`Pincode stored: ${locationRef.current.postalCode}`);
    }
  }, [locationRef.current.postalCode]);

  // Function to clear stored data when new geocode is fetched
  const clearStoredData = () => {
    sessionStorage.removeItem("customPriceData");
    sessionStorage.removeItem("districtPriceData");
    customPriceDataRef.current = null;
    districtPriceDataRef.current = null;
    setError(""); // Reset error when clearing data
  };

  // Function to fetch district-level pricing data
  const fetchDistrictPricing = async (
    adminLevel3,
    adminLevel2,
    adminLevel1,
    locality,
  ) => {
    let districtPriceFetched = false;
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const levels = [
      { level: locality, name: "locality" },
      { level: adminLevel3, name: "adminLevel3" },
      { level: adminLevel2, name: "adminLevel2" },
      { level: adminLevel1, name: "adminLevel1" },
    ];

    console.log("Starting to fetch district pricing...");
    console.log(
      "Levels to check (in order):",
      levels.map((l) => l.level),
    );

    for (const { level, name } of levels) {
      if (level && !districtPriceFetched) {
        try {
          console.log(
            `Attempting to fetch district pricing for ${name}: ${level}`,
          );

          // API Call
          const priceResponse = await axios.get(
            `${AZURE_BASE_URL}/v1.0/core/locations/district/${level}`,
          );

          console.log(
            `Response received for ${name} (${level}):`,
            priceResponse.data,
          );

          if (priceResponse.data && priceResponse.data.length > 0) {
            // Pricing data found, update references
            districtPriceDataRef.current = priceResponse.data;
            districtPriceFetched = true;

            // Compress and store data in sessionStorage
            compressAndStore("districtPriceData", priceResponse.data);
            sessionStorage.setItem("selectedCity", level);

            console.log(
              `District pricing data found and stored for ${name}: ${level}`,
            );
            console.log(`Updated selectedCity in sessionStorage: ${level}`);
            break; // Exit the loop as we found the pricing
          } else {
            console.warn(`No pricing data found for ${name}: ${level}`);
            setError(`No pricing data found for ${name}: ${level}`);
          }
        } catch (err) {
          handlePricingError(err, level, "district");
        }
      } else {
        console.log(`Skipping ${name}: ${level} (already fetched or invalid)`);
      }
    }

    if (!districtPriceFetched) {
      const errorMsg =
        "No district pricing found at any level, including locality.";
      console.warn(errorMsg);
      setError(errorMsg);
    }

    console.log("Finished fetching district pricing.");
  };

  const fetchPriceData = async (
    postalCode,
    adminLevel3,
    adminLevel2,
    adminLevel1,
    locality,
  ) => {
    let customPriceFetched = false;
    let districtPriceFetched = false;

    try {
      setLoading(true);
      console.log("Starting to fetch price data...");

      // Retrieve any stored pricing data
      const storedCustomPricing = retrieveFromStorage("customPriceData");
      const storedDistrictPricing = retrieveFromStorage("districtPriceData");

      if (storedCustomPricing) {
        customPriceDataRef.current = storedCustomPricing;
        customPriceFetched = true;
        console.log(
          "Custom pricing data retrieved from storage:",
          storedCustomPricing,
        );
      } else {
        console.log("No custom pricing data found in storage.");
        setError("No custom pricing data found in storage.");
      }

      if (storedDistrictPricing) {
        districtPriceDataRef.current = storedDistrictPricing;
        districtPriceFetched = true;
        console.log(
          "District pricing data retrieved from storage:",
          storedDistrictPricing,
        );
      } else {
        console.log("No district pricing data found in storage.");
        setError("No district pricing data found in storage.");
      }

      // Fetch custom pricing if not already fetched
      if (!customPriceFetched && postalCode) {
        const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
        try {
          console.log(`Fetching custom pricing for postal code: ${postalCode}`);
          const priceResponse = await axios.get(
            `${AZURE_BASE_URL}/v1.0/core/locations/custom/${postalCode}`,
          );

          console.log(
            `Response received for postal code ${postalCode}:`,
            priceResponse.data,
          );

          if (priceResponse.data && priceResponse.data.length > 0) {
            customPriceDataRef.current = priceResponse.data;
            customPriceFetched = true;
            compressAndStore("customPriceData", priceResponse.data);
            console.log(
              "Custom pricing data found and stored:",
              priceResponse.data,
            );
          } else {
            console.log(
              `No custom pricing data found for postal code: ${postalCode}`,
            );
            setError(
              `No custom pricing data found for postal code: ${postalCode}`,
            );
          }
        } catch (err) {
          handlePricingError(err, postalCode, "custom");
        }
      } else {
        console.log(
          `Custom pricing already fetched or postal code is invalid: ${postalCode}`,
        );
      }

      // Fetch district pricing if not already fetched
      if (!districtPriceFetched) {
        console.log("Fetching district pricing data...");
        await fetchDistrictPricing(
          adminLevel3,
          adminLevel2,
          adminLevel1,
          locality,
        );
      } else {
        console.log("District pricing already fetched.");
      }

      if (!customPriceFetched && !districtPriceFetched) {
        const errorMsg = "No pricing data available for this location.";
        setError(errorMsg);
        console.warn(errorMsg);
      }
    } catch (err) {
      setError("Failed to fetch price data.");
      console.warn("Error fetching price data:", err);
    } finally {
      setLoading(false);
      setInitialFetchComplete(true);
      console.log("Price data fetching process complete.");
    }
  };

  const fetchGeocodeData = async (lat, lng) => {
    clearStoredData();
    setError("");
    setLoading(true);
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

    try {
      const latitude = Number(lat);
      const longitude = Number(lng);
      console.log(
        `Posting to backend API to fetch geocode data for coordinates: lat=${latitude}, lng=${longitude}`,
      );

      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/user-location/geocode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch geocode data: ${response.statusText}`);
      }

      const data = await response.json();
      const { adminLevel3, adminLevel2, adminLevel1, locality, postalCode } =
        data;
      console.log(data,'admin level location 1')
      locationRef.current = {
        adminLevel3: adminLevel3 || "Not found",
        adminLevel2: adminLevel2 || "Not found",
        adminLevel1: adminLevel1 || "Not found",
        locality: locality || "Not found",
        postalCode: postalCode || "Not found",
      };

      console.log("Extracted location data:", locationRef.current);

      if (locationRef.current.postalCode) {
        storePincode(locationRef.current.postalCode);
      }

      sessionStorage.setItem("latitude", latitude);
      sessionStorage.setItem("longitude", longitude);

      await fetchPriceData(
        locationRef.current.postalCode,
        locationRef.current.adminLevel3,
        locationRef.current.adminLevel2,
        locationRef.current.adminLevel1,
        locationRef.current.locality,
      );
    } catch (err) {
      setError("Failed to fetch geocode data.");
      console.warn("Error fetching geocode data:", err);
    } finally {
      setLoading(false);
      setInitialFetchComplete(true);
    }
  };

  const handlePricingError = (err, location, type) => {
    const errorMsg =
      err.response && err.response.status === 404
        ? `No ${type} pricing found for: ${location}`
        : `Error fetching ${type} pricing for: ${location}`;
    setError(errorMsg);
    console.warn(errorMsg, err);
  };

  useEffect(() => {
    const storedLatitude = sessionStorage.getItem("latitude");
    const storedLongitude = sessionStorage.getItem("longitude");

    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchGeocodeData(latitude, longitude);
          },
          (error) => {
            // Set a user-friendly message based on the error type
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setError("Location access was denied by the user.");
                break;
              case error.POSITION_UNAVAILABLE:
                setError("Location information is currently unavailable.");
                break;
              case error.TIMEOUT:
                setError("Location request timed out. Please try again.");
                break;
              default:
                setError(
                  "An unknown error occurred while retrieving location.",
                );
                break;
            }
          },
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    if (!storedLatitude || !storedLongitude) {
      fetchUserLocation();
    } else {
      fetchGeocodeData(storedLatitude, storedLongitude);
    }
  }, []);

  useEffect(() => {
    if (initialFetchComplete) {
      sessionStorage.setItem("initialFetchComplete", "true");
    }
  }, [initialFetchComplete]);

  return (
    <LocationPriceContext.Provider
      value={{
        location: locationRef.current,
        customPriceData: customPriceDataRef.current,
        districtPriceData: districtPriceDataRef.current,
        getStoredPincode,
        loading,
        error,
        initialFetchComplete,
        fetchGeocodeData,
      }}
    >
      {children}
    </LocationPriceContext.Provider>
  );
};
