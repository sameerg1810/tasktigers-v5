import React, { useState, useEffect, useRef, useCallback } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "./LocationModal.css";
import { useAuth } from "../../context/AuthContext";
const markerImage = `${IMAGE_BASE_URL}/user-marker.gif`;
import { FaRegCheckCircle, FaCrosshairs } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import axios from "axios";
import debounce from "lodash.debounce"; // Install lodash.debounce for input debouncing

const backendApiUrl = import.meta.env.VITE_AZURE_BASE_URL;

const LocationModal = ({ onLocationSelect, onClose }) => {
  const { userLocation } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempLocation, setTempLocation] = useState({
    latitude:
      parseFloat(sessionStorage.getItem("markedLat")) ||
      userLocation?.latitude ||
      0,
    longitude:
      parseFloat(sessionStorage.getItem("markedLng")) ||
      userLocation?.longitude ||
      0,
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`;
    script.async = true;
    script.onload = () => initializeMap();
    script.onerror = () => console.error("Failed to load Google Maps script.");
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    const initialLocation = {
      lat: tempLocation.latitude || userLocation?.latitude || 0,
      lng: tempLocation.longitude || userLocation?.longitude || 0,
    };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: initialLocation,
      zoom: 12,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    const newMarker = new window.google.maps.Marker({
      position: initialLocation,
      map: map,
      draggable: true,
      icon: {
        url: markerImage,
        scaledSize: new window.google.maps.Size(65, 65),
      },
    });

    setMarker(newMarker);

    fetchAddress(initialLocation.lat, initialLocation.lng).then(setAddress);

    newMarker.addListener("dragend", async () => {
      const position = newMarker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      setTempLocation({ latitude: lat, longitude: lng });
      const fetchedAddress = await fetchAddress(lat, lng);
      setAddress(fetchedAddress);
    });

    map.addListener("click", async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      newMarker.setPosition(e.latLng);
      setTempLocation({ latitude: lat, longitude: lng });
      const fetchedAddress = await fetchAddress(lat, lng);
      setAddress(fetchedAddress);
    });
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `${backendApiUrl}/v1.0/users/google-places/geocode?lat=${latitude}&lng=${longitude}`,
      );
      if (response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
      return "Unknown location";
    } catch (error) {
      console.error("Failed to fetch address:", error);
      return "Error fetching address";
    }
  };

  const fetchPlacesFromBackend = async (query) => {
    try {
      const response = await axios.get(
        `${backendApiUrl}/v1.0/users/google-places/places?query=${query}`,
      );
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
    // Clear suggestions if input is empty or fetch new suggestions when there's input
    if (inputValue.trim().length === 0) {
      setSuggestions([]); // Clear suggestions immediately when input is empty
    } else {
      debouncedFetchPlaces(inputValue);
    }
  }, [inputValue, debouncedFetchPlaces]);

  const handleConfirmLocation = async () => {
    setLoading(true);
    let finalLat = tempLocation.latitude;
    let finalLng = tempLocation.longitude;

    if (finalLat === 0 && finalLng === 0 && userLocation) {
      finalLat = userLocation.latitude;
      finalLng = userLocation.longitude;
    }

    const fetchedAddress = await fetchAddress(finalLat, finalLng);
    onLocationSelect({
      address: fetchedAddress,
      latitude: finalLat,
      longitude: finalLng,
    });
    setLoading(false);
  };

  const handlePlaceSelection = (place) => {
    const latitude = place.geometry.location.lat;
    const longitude = place.geometry.location.lng;
    setInputValue(place.name); // Update input field with the selected place
    setSuggestions([]); // Clear suggestions after selection
    mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
    marker.setPosition({ lat: latitude, lng: longitude });
    setTempLocation({ latitude, longitude });
    fetchAddress(latitude, longitude).then(setAddress);
  };

  return (
    <div className="location-container">
      {loading && (
        <div className="loading-overlay">
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
      <div className="location-info">
        <p>
          <strong>Address:</strong> {address}
        </p>
      </div>
      <div className="search-container" ref={searchContainerRef}>
        <input
          id="location-search-input"
          className="search-box"
          type="text"
          placeholder="Search for a location (e.g., address, POI, neighborhood)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {/* Only show suggestions when available and input is not empty */}
        {suggestions.length > 0 && inputValue.trim().length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((place, index) => (
              <li key={index} onClick={() => handlePlaceSelection(place)}>
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div id="map" className="map-container" ref={mapContainerRef}></div>

      <button
        className="gps-button"
        onClick={() => {
          if (mapInstanceRef.current && userLocation) {
            const { latitude, longitude } = userLocation;
            mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
            if (marker) marker.setPosition({ lat: latitude, lng: longitude });
            setTempLocation({ latitude, longitude });
            fetchAddress(latitude, longitude).then(setAddress);
          }
        }}
        title="Recenter to current location"
      >
        <FaCrosshairs />
      </button>

      <div className="instructions">
        <p className="location-description">
          <strong>Welcome!</strong> You can use this map to set your location.
          Drag the marker to your desired location or click on the map to place
          the marker.
        </p>
        <div className="location-buttons">
          <button
            onClick={handleConfirmLocation}
            className="use-location-button"
            disabled={loading}
          >
            CONFIRM LOCATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
