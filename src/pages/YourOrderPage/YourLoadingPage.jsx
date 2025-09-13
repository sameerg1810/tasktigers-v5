import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./YourLoadingPage.css";
const SearchGif = `${IMAGE_BASE_URL}/Search.gif`;
const ErrorGif = `${IMAGE_BASE_URL}/Malfunctioned robot.gif`;

const YourLoadingPage = ({ onRetry, onCancelBooking }) => {
  const [isError, setIsError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Matching with the best provider for your order",
  );
  const navigate = useNavigate();

  useEffect(() => {
    const errorTimeout = setTimeout(() => {
      // Simulate error if the loading takes too long
      setIsError(true);
      setLoadingMessage("Unable to match with a provider at the moment.");
    }, 15000); // Show error after 15 seconds

    return () => clearTimeout(errorTimeout); // Cleanup timeout
  }, []);

  const handleBackToBookings = () => {
    navigate("/bookings");
  };

  return (
    <div className="your-loading-page">
      <div className="your-sticky-header tiger-theme">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToBookings}
          className="your-action-button your-back-button"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<ReplayIcon />}
          onClick={onRetry}
          disabled={!isError}
          className="action-button retry-button"
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          sx={{
            color: "orange",
            borderColor: "red",
            "&:hover": {
              borderColor: "darkred",
            },
          }}
          onClick={onCancelBooking}
          className="your-action-button cancel-button"
        >
          Cancel Booking
        </Button>
      </div>
      {isError ? (
        <div className="error-content">
          <img src={ErrorGif} alt="Error occurred" />
          <h2>{loadingMessage}</h2>
        </div>
      ) : (
        <div className="loading-content">
          <img src={SearchGif} alt="Searching for provider" />
          <h2>
            {loadingMessage}
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </h2>
        </div>
      )}
    </div>
  );
};

export default YourLoadingPage;
