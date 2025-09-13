import React, { useState, useRef, useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./header.css";
import { confirmAlert } from "react-confirm-alert";
import { useLocationPrice } from "../../context/LocationPriceContext";
import Cookies from "js-cookie";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useAuth } from "../../context/AuthContext";
import useUserLocation from "../../hooks/useUserLocation";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const loadinggif = `${IMAGE_BASE_URL}/tiger.gif`

let debounceTimeout;

const LocationSearch = () => {
  const navigate = useNavigate()
  const { fetchCityName, updateUserLocation } = useAuth();
  const { fetchGeocodeData } = useLocationPrice();
  const [mapPopup, setMapPopup] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [mapboxResults, setMapboxResults] = useState([]);
  const [servingCity, setServingCity] = useState(
    sessionStorage.getItem("selectedCity") || "Hyderabad"
  );
  const [loading, setLoading] = useState(false);
  const [loadingServingCity, setLoadingServingCity] = useState(false); // Loading state for serving city update
  const containerRef = useRef(null);
  const { location, error } = useUserLocation();

  const handleLocationIconClick = () => {
    confirmAlert({
      title: "Use Current Location",
      message: "Do you want to use your current location?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            if (error) {
              alert("Unable to fetch location. Please try again.");
              return;
            }

            if (location) {
              const { latitude, longitude } = location;
              fetchCityName(latitude, longitude)
                .then((cityName) => {
                  setServingCity(cityName);
                  updateUserLocation(latitude, longitude);
                  fetchGeocodeData(latitude, longitude);

                  const updatedLocation = {
                    latitude,
                    longitude,
                    city: cityName,
                  };
                  Cookies.set("userLocation", JSON.stringify(updatedLocation), {
                    expires: 30,
                  });
                })
                .catch(() => {
                  alert("Error fetching city name.");
                });
            } else {
              alert("Fetching location. Please wait.");
            }
          },
        },
        { label: "No", onClick: () => { } },
      ],
      closeOnClickOutside: false,
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (value.trim().length > 2) {
      setLoading(true);
      debounceTimeout = setTimeout(() => {
        fetchMapboxResults(value);
      }, 300);
    } else {
      setMapboxResults([]);
      setLoading(false);
    }
  };

  const fetchMapboxResults = async (query) => {
    try {
      const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?country=in&limit=5&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      setMapboxResults(response.data.features || []);
    } catch {
      alert("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleServingCity = async (feature) => {
    setLoadingServingCity(true);
    setMapPopup(false);
  
    const isPincode = feature.text.match(/^\d+$/); // Check if the text is a pincode (numeric)
    
    let city;
    if (isPincode) {
      // If it's a pincode, extract city from the context
      const cityContext = feature.context.find((item) => item.id.startsWith("place"));
      city = cityContext ? cityContext.text : "Unknown City";
    } else {
      // If it's a city name, use the `text` field directly
      city = feature.text;
    }
  
    const [longitude, latitude] = feature.geometry.coordinates;
    
    try {
      await updateUserLocation(latitude, longitude);
      await fetchGeocodeData(latitude, longitude);
      setServingCity(city); // Set the city name correctly
      sessionStorage.setItem("selectedCity", city); // Save city to sessionStorage
      navigate('/')
    } catch {
      alert("Error updating location.");
    } finally {
      setLoadingServingCity(false); // Stop loading animation
    }
  
    setSearchInput("");
    setMapboxResults([]);
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSearchInput("");
        setMapboxResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePopup = () => {
    setMapPopup(true);
  };

  return (
    <div className={`location-search ${mapPopup ? "blurred-background" : ""}`}>
      <div className="handlecity-name" onClick={handlePopup}>
        {servingCity}
      </div>
      

      {mapPopup && (
        <>
          <div className="google-main-con" ref={containerRef}>
            <h3>
              Welcome to <span>Task Tigers</span>
            </h3>
            <p>Please provide your service location..</p>
            <div className="close-icon" onClick={() => setMapPopup(false)}>
              <CloseIcon />
            </div>

            <div className="location-con-detect-search">
              <div className="detect-location">
                <h2 onClick={handleLocationIconClick}>Detect my location</h2>
              </div>

              <div className="google-search-con">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleInputChange}
                  placeholder="Search for a city or pincode..."
                  className="google-autocomplete-input"
                />
                {/* {loading && <p className="loading-indicator">Loading...</p>} */}
                {mapboxResults.length > 0 ? (
                  <ul className="results-list">
                    {mapboxResults.map((feature) => (
                      <li
                        key={feature.id}
                        onClick={() => handleServingCity(feature)}
                        className="result-item styled-item"
                      >
                        {feature.place_name}
                      </li>
                    ))}
                  </ul>
                ) : mapboxResults.length === 0 && searchInput.length > 3 ? (
                  <ul className="results-list">
                    <li className="result-item styled-item error-message">
                      No results found , please enter correct location ...
                    </li>
                  </ul>
                ) : null}

              </div>

            </div>
          </div>
        </>
      )}

      {loadingServingCity && (
        <div className="loading-overlay">
          <img className="loading-gif" src={loadinggif} alt="loading" />
        </div>
      )}
    </div>

  );
};

export default LocationSearch;
