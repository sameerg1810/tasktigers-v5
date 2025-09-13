import React, { Component } from "react";
import { Box, Typography, Button } from "@mui/material";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

const malfunctionLogo =  `${IMAGE_BASE_URL}/Malfunctioned robot.gif`;
const notFoundImage =  `${IMAGE_BASE_URL}/Not Found.gif`;
const noInternetImage =  `${IMAGE_BASE_URL}/No Internet.gif`; 


class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "";
      const isNotFoundError = errorMessage.includes("404");
      const isInternetDisconnected = errorMessage.includes(
        "ERR_INTERNET_DISCONNECTED",
      );

      let displayImage = malfunctionLogo;
      let displayMessage = "Oops! Something went wrong.";

      if (isNotFoundError) {
        displayImage = notFoundImage;
        displayMessage = "404 - Page Not Found";
      } else if (isInternetDisconnected) {
        displayImage = noInternetImage;
        displayMessage = "No Internet Connection";
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          textAlign="center"
          padding={4}
          bgcolor="background.default"
        >
          <img
            src={displayImage}
            alt={displayMessage}
            style={{ width: "250px", marginBottom: "20px" }}
          />
          <Typography variant="h4" color="textPrimary" gutterBottom>
            {displayMessage}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {isInternetDisconnected
              ? "It seems you are offline. Please check your internet connection."
              : errorMessage || "An unexpected error occurred."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReload}
          >
            {isInternetDisconnected ? "Try Again" : "Reload Page"}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
