import React, { useState, useEffect, useCallback, useRef } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useNavigate } from "react-router-dom";
import { FaCrosshairs, FaArrowLeft } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import axios from "axios";
import debounce from "lodash.debounce";
import LZString from "lz-string";
import { useAuth } from "../../context/AuthContext";
import { useLocationPrice } from "../../context/LocationPriceContext";
import "./MyLocation.css";
const taskTigersLogo = `${IMAGE_BASE_URL}/logo.png`;

const backendApiUrl = import.meta.env.VITE_AZURE_BASE_URL;
export const fetchAddress = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${backendApiUrl}/v1.0/users/google-places/geocode?lat=${latitude}&lng=${longitude}`,
    );
    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      console.log("Fetched address:", result.formatted_address);

      const cityComponent = result.address_components.find(
        (component) =>
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_2"),
      );
      const cityName = cityComponent ? cityComponent.long_name : "Unknown City";

      return {
        formattedAddress: result.formatted_address,
        cityName,
      };
    }
    return { formattedAddress: "Unknown location", cityName: "Unknown City" };
  } catch (error) {
    console.error("Failed to fetch address:", error);
    return {
      formattedAddress: "Error fetching address",
      cityName: "Unknown City",
    };
  }
};
const MyLocation = ({ onLocationSelect }) => {
  const { userCity, userLocation } = useAuth();
  const { fetchGeocodeData } = useLocationPrice();
  const navigate = useNavigate();
  const addressRef = useRef("");

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileFullAddress, setMobileFullAddress] = useState("");

  ///consoling the user city and user location
  useEffect(() => {
    console.log(`MyLocation: Current city is ${userCity}`);
    console.log(`MyLocation: Current location is`, userLocation);
  }, [userCity, userLocation]);

  useEffect(() => {
    const storedAddress = LZString.decompress(
      sessionStorage.getItem("CurrentAddress"),
    );

    if (storedAddress) {
      addressRef.current = storedAddress;
      setMobileFullAddress(storedAddress);
    } else {
      const storedLatitude = sessionStorage.getItem("latitude");
      const storedLongitude = sessionStorage.getItem("longitude");

      if (storedLatitude && storedLongitude) {
        const latitude = parseFloat(storedLatitude);
        const longitude = parseFloat(storedLongitude);

        setLoading(true);
        fetchAddress(latitude, longitude).then(
          async ({ formattedAddress, cityName }) => {
            const fullAddress = formattedAddress.replace(cityName, "").trim();

            addressRef.current = formattedAddress;
            sessionStorage.setItem("selectedCity", cityName);
            sessionStorage.setItem(
              "CurrentAddress",
              LZString.compress(fullAddress),
            );

            setMobileFullAddress(fullAddress);
            setLoading(false);
          },
        );
      }
    }
  }, []);

  const fetchPlacesFromBackend = async (query) => {
    console.log("Fetching places for query:", query);
    try {
      const response = await axios.get(
        `${backendApiUrl}/v1.0/users/google-places/places?query=${query}`,
      );
      console.log("Fetched places:", response.data.results);
      setSuggestions(response.data.results);
    } catch (error) {
      console.error("Failed to fetch places from backend:", error);
      setSuggestions([]);
    }
  };

  const debouncedFetchPlaces = useCallback(
    debounce((query) => {
      if (query.length > 0) {
        fetchPlacesFromBackend(query);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setSuggestions([]);
    } else {
      debouncedFetchPlaces(inputValue);
    }
  }, [inputValue, debouncedFetchPlaces]);

  const handlePlaceSelection = (place) => {
    console.log("Place selected:", place);
    const latitude = place.geometry.location.lat;
    const longitude = place.geometry.location.lng;
    setInputValue(place.name);
    setSuggestions([]);

    setLoading(true);

    fetchAddress(latitude, longitude).then(
      async ({ formattedAddress, cityName }) => {
        const geocodeData = await fetchGeocodeData(latitude, longitude);
        const fullAddress = formattedAddress.replace(cityName, "").trim();

        console.log("Geocode data:", geocodeData);
        console.log("City name:", cityName);
        console.log("Full address:", fullAddress);

        addressRef.current = formattedAddress;
        sessionStorage.setItem("selectedCity", cityName);
        sessionStorage.setItem(
          "CurrentAddress",
          LZString.compress(fullAddress),
        );

        setMobileFullAddress(fullAddress);

        onLocationSelect({
          address: cityName,
          mobileFullAddress: fullAddress,
          latitude,
          longitude,
        });
        setLoading(false);
        navigate("/");
      },
    );
  };

  return (
    <div>
      <div className="mob-loc-location-container">
        {loading && (
          <div className="mob-loc-loading-overlay">
            <TailSpin
              height="80"
              width="80"
              color="#0988cf"
              ariaLabel="tail-spin-loading"
              radius="1"
              visible={true}
            />
          </div>
        )}

        <div className="mob-loc-search-container">
          <button
            className="mob-loc-clear-button"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft />
          </button>
          <input
            id="location-search-input"
            className="mob-loc-search-box"
            type="text"
            placeholder="Search for your location/society/apartment"
            value={inputValue}
            onChange={(e) => {
              console.log("Input value changed:", e.target.value);
              setInputValue(e.target.value);
            }}
          />
          <button
            className="mob-loc-current-location-button"
            onClick={() => {
              if (userLocation) {
                console.log("Using current user location:", userLocation);
                const { latitude, longitude } = userLocation;

                setLoading(true);
                fetchAddress(latitude, longitude).then(
                  async ({ formattedAddress, cityName }) => {
                    const geocodeData = await fetchGeocodeData(
                      latitude,
                      longitude,
                    );
                    const fullAddress = formattedAddress
                      .replace(cityName, "")
                      .trim();

                    console.log("Geocode data:", geocodeData);
                    console.log("City name:", cityName);
                    console.log("Full address:", fullAddress);

                    addressRef.current = formattedAddress;
                    sessionStorage.setItem("selectedCity", cityName);
                    sessionStorage.setItem(
                      "CurrentAddress",
                      LZString.compress(fullAddress),
                    );

                    setMobileFullAddress(fullAddress);

                    onLocationSelect({
                      address: cityName,
                      mobileFullAddress: fullAddress,
                      latitude,
                      longitude,
                    });
                    setLoading(false);
                    navigate("/");
                  },
                );
              }
            }}
            title="Use current location"
          >
            <FaCrosshairs />
          </button>
        </div>

        {suggestions.length > 0 && inputValue.trim().length > 0 ? (
          <ul className="mob-loc-suggestions-list">
            {suggestions.map((place, index) => (
              <li key={index} onClick={() => handlePlaceSelection(place)}>
                {place.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mob-loc-current-address-section">
            <p className="mob-loc-current-address-display">
              <strong>Current Address:</strong> {mobileFullAddress}
            </p>
          </div>
        )}
      </div>
      <div className="mob-loc-powered-by">
        <p>powered by</p>
        <img
          src={taskTigersLogo}
          alt="TaskTigers Logo"
          className="mob-loc-task-tigers-logo"
        />
      </div>
    </div>
  );
};

export default MyLocation;
