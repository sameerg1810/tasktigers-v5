import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
const  happyTigerGif = `${IMAGE_BASE_URL}/happytiger.gif`; 

const CompleteGreeting = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5); // Timer state for 5 seconds

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/"); // Navigate to home page after the countdown
    }
  }, [seconds, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh", // Half viewport height
        textAlign: "center",
        backgroundColor: "#fff7e6", // Light tiger skin background color
        borderRadius: "12px",
        padding: 4,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        animation: "fade-in 1.5s ease-in-out",
        margin: "0 auto", // Center horizontally within its parent
      }}
    >
      <img
        src={happyTigerGif}
        alt="Happy Tiger"
        style={{ width: "200px", marginBottom: "20px" }}
      />
      <Typography
        variant="h4"
        fontWeight="bold"
        color="#ff8c00"
        sx={{ marginBottom: 2 }}
      >
        "You Roared, We Delivered!"
      </Typography>
      <Typography
        variant="h6"
        color="textSecondary"
        sx={{ marginBottom: 2, lineHeight: 1.5 }}
      >
        Thank you for using <b>Task Tigers</b>! Your service has been
        successfully completed.
      </Typography>
      <Typography variant="body1" color="#555" sx={{ marginBottom: 4 }}>
        We hope to see you again soon for more of our exciting services!
      </Typography>

      {/* Timer Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} thickness={4} color="inherit" />
        <Typography variant="body2" color="textSecondary">
          Redirecting in {seconds} seconds...
        </Typography>
      </Box>
    </Box>
  );
};

export default CompleteGreeting;
