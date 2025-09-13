import React from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
const noOrdersGif = `${IMAGE_BASE_URL}/No data.gif`; // Replace with your actual GIF path

const NoOrder = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Full viewport height to center vertically
        textAlign: "center",
        backgroundColor: "#fff7e6", // Light tiger skin color
        padding: 4,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
      }}
    >
      <img
        src={noOrdersGif}
        alt="No Orders"
        style={{ width: "300px", marginBottom: "20px" }}
      />
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#ff8c00"
        sx={{ marginBottom: 2 }}
      >
        No Orders Found!
      </Typography>
      <Typography
        variant="body1"
        color="#555"
        sx={{ marginBottom: 4, lineHeight: 1.5 }}
      >
        It looks like you haven't placed any orders yet. Explore our services
        and start your first order!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#ff8c00", // Tiger orange color
          "&:hover": {
            backgroundColor: "#e57c00", // Slightly darker on hover
          },
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NoOrder;
