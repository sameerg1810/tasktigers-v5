import React, { useEffect, useState, useContext } from "react";
import { OrdersContext } from "../../context/OrdersContext";
import { fetchOtp } from "./api/fetchOtp";
import { Box, TextField, Button, Typography, Fade } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

const OTP = () => {
  const { jobCompleteOtp, setOtpFilled } = useContext(OrdersContext); // Context for Job Completion OTP
  const [jobStartOtp, setJobStartOtp] = useState(""); // Independent Job Start OTP
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(false); // Error state
  const [copiedOtp, setCopiedOtp] = useState(null); // Keeps track of which OTP was copied
  const [message, setMessage] = useState("Fetching OTP..."); // Message state

  console.log("Initial State in OTP Component:");
  console.log("Job Completion OTP:", jobCompleteOtp);
  console.log("Job Start OTP (before fetch):", jobStartOtp);

  /**
   * Fetch Job Start OTP on Component Mount.
   * Always ensure Job Start OTP is loaded from API or persisted cookies.
   */
  useEffect(() => {
    const getJobStartOtp = async () => {
      try {
        let otpValue = Cookies.get("jobStartOtp"); // Check if OTP is stored in cookies

        if (!otpValue) {
          console.log("Fetching Job Start OTP from API...");
          otpValue = await fetchOtp(); // Fetch OTP from API if not in cookies
          if (otpValue) {
            Cookies.set("jobStartOtp", otpValue, { expires: 1 }); // Persist OTP in cookies for 1 day
          }
        } else {
          console.log("Job Start OTP loaded from cookies:", otpValue);
        }

        if (otpValue) {
          setJobStartOtp(String(otpValue)); // Ensure OTP is treated as a string
          setMessage("Share this OTP with the provider to start the job.");
          setOtpFilled(true); // Mark Job Start OTP as filled
        }
      } catch (error) {
        setError(true);
        console.error("Error fetching Job Start OTP:", error);
        setMessage("Failed to fetch Job Start OTP. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (!jobCompleteOtp) {
      console.log("No Job Completion OTP detected. Fetching Job Start OTP...");
      getJobStartOtp();
    } else {
      console.log("Job Completion OTP detected. Skipping Job Start OTP fetch.");
    }
  }, [setOtpFilled, jobCompleteOtp]);

  /**
   * Logs the Job Completion OTP when it changes.
   */
  useEffect(() => {
    if (jobCompleteOtp) {
      console.log("Updated Job Completion OTP received:", jobCompleteOtp);
    }
  }, [jobCompleteOtp]);

  /**
   * Copies the provided OTP to the clipboard.
   */
  const copyOtpToClipboard = (otp, type) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(type); // Set which OTP was copied
    toast.success(`${type} copied to clipboard!`);
    console.log(`${type} copied to clipboard: ${otp}`);
  };

  // Show loading state if OTP is still being fetched
  if (loading) {
    console.log("Loading state active: Fetching OTP...");
    return <Typography>Loading OTP, please wait...</Typography>;
  }

  // Show error message if OTP fetch fails
  if (error) {
    console.error("Error state active: Failed to fetch OTP.");
    return (
      <Typography color="error">
        Failed to fetch OTP. Please try again later.
      </Typography>
    );
  }

  return (
    <Fade in>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          padding: 2,
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {/* Conditional Rendering: Only Show One OTP Section at a Time */}
        {!jobCompleteOtp ? (
          // Job Start OTP Section
          <Box
            sx={{
              width: "100%",
              padding: 2,
              border: "1px solid #1976d2",
              borderRadius: "8px",
              backgroundColor: "#e3f2fd",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              Job Start OTP
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {message}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
              {String(jobStartOtp) // Convert to string to avoid errors
                .split("")
                .map((digit, index) => (
                  <TextField
                    key={index}
                    value={digit}
                    variant="outlined"
                    inputProps={{
                      readOnly: true,
                      style: {
                        fontSize: "28px", // Larger font size for clarity
                        textAlign: "center",
                      },
                    }}
                    sx={{
                      width: "60px", // Uniform size for OTP fields
                      textAlign: "center",
                    }}
                  />
                ))}
            </Box>
            <Button
              variant="contained"
              onClick={() => copyOtpToClipboard(jobStartOtp, "Job Start OTP")}
              startIcon={
                copiedOtp === "Job Start OTP" ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <ContentCopyIcon />
                )
              }
              sx={{
                marginTop: 2,
                backgroundColor:
                  copiedOtp === "Job Start OTP" ? "#4caf50" : "#1976d2", // Dynamic button color
                "&:hover": {
                  backgroundColor:
                    copiedOtp === "Job Start OTP" ? "#43a047" : "#1565c0", // Hover state
                },
              }}
            >
              {copiedOtp === "Job Start OTP" ? "Copied!" : "Copy OTP"}
            </Button>
          </Box>
        ) : (
          // Job Completion OTP Section
          <Box
            sx={{
              width: "100%",
              padding: 2,
              border: "1px solid #d32f2f",
              borderRadius: "8px",
              backgroundColor: "#fdecea",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="error">
              Job Completion OTP
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Share this OTP with the provider to confirm job completion.
            </Typography>
            <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
              {String(jobCompleteOtp) // Convert to string to avoid errors
                .split("")
                .map((digit, index) => (
                  <TextField
                    key={index}
                    value={digit}
                    variant="outlined"
                    inputProps={{
                      readOnly: true,
                      style: {
                        fontSize: "28px", // Larger font size for clarity
                        textAlign: "center",
                      },
                    }}
                    sx={{
                      width: "60px", // Uniform size for OTP fields
                      textAlign: "center",
                    }}
                  />
                ))}
            </Box>
            <Button
              variant="contained"
              onClick={() =>
                copyOtpToClipboard(jobCompleteOtp, "Job Completion OTP")
              }
              startIcon={
                copiedOtp === "Job Completion OTP" ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <ContentCopyIcon />
                )
              }
              sx={{
                marginTop: 2,
                backgroundColor:
                  copiedOtp === "Job Completion OTP" ? "#4caf50" : "#d32f2f", // Dynamic button color
                "&:hover": {
                  backgroundColor:
                    copiedOtp === "Job Completion OTP" ? "#43a047" : "#c62828", // Hover state
                },
              }}
            >
              {copiedOtp === "Job Completion OTP" ? "Copied!" : "Copy OTP"}
            </Button>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default OTP;
