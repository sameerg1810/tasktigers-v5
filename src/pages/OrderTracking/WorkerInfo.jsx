import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const callIcon = `${IMAGE_BASE_URL}/provider-dailer.svg`;
const messageIcon = `${IMAGE_BASE_URL}/message-provider.svg`;
import UserProviderChat from "./UserProviderChat";
import { fetchProviderDetailsId } from "./api/providerDetails-api";
import { fetchOtp } from "./api/fetchOtp";
import { Button, Box, Typography, TextField, Fade } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import CompleteGreeting from "./CompleteGreeting"; // Import the CompleteGreeting component
import "./WorkerInfo.css";
import axios from "axios"; // Add axios import
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
const avatar = `${IMAGE_BASE_URL}/happytiger.gif`;

const WorkerInfo = ({
  providerId,
  jobCompleteOtp,
  reviewCompleted,
  onCall,
  onCancel,
  orderHistoryId,
  orderStatus,
}) => {
  const [workerDetails, setWorkerDetails] = useState(null); // Store fetched provider details
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat popup visibility
  const [jobStartOtp, setJobStartOtp] = useState(""); // Job Start OTP
  const [loadingStartOtp, setLoadingStartOtp] = useState(true); // Loading state for Start OTP
  const [copiedOtp, setCopiedOtp] = useState(null); // Tracks which OTP was copied
   const userId = sessionStorage.getItem('userId')
  const baseUrl = import.meta.env.VITE_AZURE_BASE_URL;
  const navigate = useNavigate(); // Initialize navigate function

  // Fetch provider details when providerId is available
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        if (providerId) {
          const details = await fetchProviderDetailsId(providerId);
          if (details?.provider) {
            setWorkerDetails(details.provider); // Store fetched details
          } else {
            console.error("Provider details not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching provider details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [providerId]);

  // Fetch Job Start OTP on Component Mount
  useEffect(() => {
    const getJobStartOtp = async () => {
      try {
        let otpValue = Cookies.get("jobStartOtp");
        if (!otpValue) {
          otpValue = await fetchOtp();
          if (otpValue) {
            Cookies.set("jobStartOtp", otpValue, { expires: 1 });
          }
        }
        setJobStartOtp(String(otpValue));
      } catch (error) {
        console.error("Error fetching Job Start OTP:", error);
      } finally {
        setLoadingStartOtp(false);
      }
    };

    getJobStartOtp();
  }, []);

  // Handler to open chat dialog
  const handleOpenChat = () => setIsChatOpen(true);

  // Copy OTP to clipboard
  const copyOtpToClipboard = (otp, type) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(type);
    toast.success(`${type} copied to clipboard!`);
  };

useEffect(()=>{
  console.log(orderHistoryId,userId , orderStatus, 'orderhistoryid')
},[])

  const handleCancelBooking = async (orderId, userId) => {
    console.log(orderId,userId,'order and userid in woerkinfo')

    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
  
    try {
      const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/order-history/user-cancel-order`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          userId,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('order cancelled')
        navigate('/bookings')
        return data;
      } else {
        console.error('Failed to cancel the order:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error occurred while canceling the order:', error);
    }
    
  };

  // Render CompleteGreeting component if reviewCompleted is true
  if (reviewCompleted) {
    return (
      <Box className="worker-info-container">
        <CompleteGreeting />
      </Box>
    );
  }

  if (isLoading) {
    return <p>Loading provider details...</p>;
  }

  if (!workerDetails) {
    return <p>No provider details available.</p>;
  }

  return (
    <div className="worker-info-container">
      <div className="worker-info">
        <div className="worker-image-container">
          <img
            src={
              workerDetails.image && workerDetails.image.trim() !== ""
                ? workerDetails.image
                : avatar
            }
            alt={workerDetails.name || "Provider"}
            className="worker-image"
          />
        </div>

        <div className="worker-name">
          {`${workerDetails.firstName} ${workerDetails.surName}`}
        </div>
      </div>

      <div className="otp-and-actions">
        {!jobCompleteOtp ? (
          <Fade in={!loadingStartOtp && !!jobStartOtp} timeout={500}>
            <div
              style={{
                width: "100%",
                padding: "2rem 0rem",
                borderRadius: "8px",
                backgroundColor: "rgba(217, 217, 217, 0.22)",
                marginBottom: 2,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="black" textAlign="center">
                Job Start OTP
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Share this OTP with the provider to start the job.
              </Typography>
              <Box sx={{ display: "flex",alignItems:'center', gap: 1, marginTop: 2 }}>
                {String(jobStartOtp)
                  .split("")
                  .map((digit, index) => (
                    <TextField
                      key={index}
                      value={digit}
                      variant="outlined"
                      inputProps={{
                        readOnly: true,
                        style: {
                          fontSize: "28px",
                          textAlign: "center",
                          background : "black",
                          color:'white',
                          height:'20px'
                        },
                      }}
                      sx={{
                        width: "60px",
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
                  backgroundColor:"black",
                  display:"flex",
                  justifyContent:'center',
                  //   copiedOtp === "Job Start OTP" ? "#4caf50" : "#ff8c00",
                  // "&:hover": {
                  //   backgroundColor:
                  //     copiedOtp === "Job Start OTP" ? "#43a047" : "#e57c00",
                  // },
                }}
              >
                {copiedOtp === "Job Start OTP" ? "Copied!" : "Copy OTP"}
              </Button>
            </div>
          </Fade>
        ) : (
          <Fade in={!!jobCompleteOtp} timeout={500}>
            <Box
              sx={{
                width: "100%",
                padding: 2,
                borderRadius: "8px",
                backgroundColor: "#fdecea",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="#d32f2f">
                Job Completion OTP
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Share this OTP with the provider to confirm job completion.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
                {String(jobCompleteOtp)
                  .split("")
                  .map((digit, index) => (
                    <TextField
                      key={index}
                      value={digit}
                      variant="outlined"
                      inputProps={{
                        readOnly: true,
                        style: {
                          fontSize: "28px",
                          textAlign: "center",
                        },
                      }}
                      sx={{
                        width: "60px",
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
                    copiedOtp === "Job Completion OTP" ? "#4caf50" : "#d32f2f",
                  "&:hover": {
                    backgroundColor:
                      copiedOtp === "Job Completion OTP"
                        ? "#43a047"
                        : "#c62828",
                  },
                }}
              >
                {copiedOtp === "Job Completion OTP" ? "Copied!" : "Copy OTP"}
              </Button>
            </Box>
          </Fade>
        )}
      </div>

      <div className="worker-actions">
        <div className="call-message">
          <button
              onClick={() => onCall(workerDetails?.phone)}
              className="icon-button provider-call"
            >
              <img src={callIcon} alt="Call" />
            </button>
            <button
              onClick={handleOpenChat}
              className="icon-button message-button"
            >
              <img src={messageIcon} alt="Message" />
            </button>
        </div>
       {
        orderStatus == "Order Accepted" &&
        (
          <button onClick={()=>{handleCancelBooking(orderHistoryId,userId)}} className="cancel-button">
               Cancel Booking
          </button>
        )
       }
       
          
         
      </div>

      {isChatOpen && (
        <div className="message-popup-overlay">
          <UserProviderChat
            providerId={providerId}
            workerDetails={workerDetails}
            onCloseChat={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default WorkerInfo;
