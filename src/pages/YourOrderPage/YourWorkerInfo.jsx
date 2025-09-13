import React, { useEffect, useState } from "react";
const callIcon = `${IMAGE_BASE_URL}/provider-dailer.svg`;
const messageIcon = `${IMAGE_BASE_URL}/message-provider.svg`;
import YourUserProviderChat from "./YourUserProviderChat";
import { fetchProviderDetailsId } from "./api/your-providerDetails-api";
import { fetchOtp } from "./api/your-fetchOtp";
import { Button, Box, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import YourCompleteGreeting from "./YourCompleteGreeting"; // Import the CompleteGreeting component
import "./YourWorkerInfo.css";
const avatar = `${IMAGE_BASE_URL}/happytiger.gif`;

const YourWorkerInfo = ({
  providerId,
  jobCompleteOtp,
  reviewCompleted,
  onCall,
  onCancel,
}) => {
  const [workerDetails, setWorkerDetails] = useState(null); // Store fetched provider details
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat popup visibility
  const [jobStartOtp, setJobStartOtp] = useState(""); // Job Start OTP
  const [copiedOtp, setCopiedOtp] = useState(""); // Tracks which OTP was copied

  /**
   * Fetch provider details when providerId is available.
   */
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

  /**
   * Fetch Job Start OTP on Component Mount.
   */
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
      }
    };

    getJobStartOtp();
  }, []);

  /**
   * Copy OTP to clipboard with success toast.
   */
  const copyOtpToClipboard = (otp, label) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(label);
    toast.success(`${label} copied to clipboard!`);
  };

  /**
   * Render CompleteGreeting component if reviewCompleted is true.
   */
  if (reviewCompleted) {
    return (
      <Box className="worker-info-container">
        <YourCompleteGreeting />
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
      {/* OTP Container */}
      <div className="otp-and-actions">
        {!jobCompleteOtp ? (
          <div className="otp-containers job-start">
            <div className="otp-box">
              <p className="otp-descriptions">
                Before the provider starts the job, share<br/><span>your OTP pin:</span> 
              </p>
              <div className="otp-inputs">
                {jobStartOtp.split("").map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    readOnly
                    value={digit}
                    className="otp-input"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="otp-container job-completion">
            <div className="otp-box">
              <p className="otp-description">
                Share this OTP with the provider to confirm job completion:
              </p>
              <div className="otp-inputs">
                {jobCompleteOtp.split("").map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    readOnly
                    value={digit}
                    className="otp-input"
                  />
                ))}
              </div>
              <Button
                className="otp-button completion"
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
              >
                {copiedOtp === "Job Completion OTP" ? "Copied" : "Copy OTP"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Worker Information */}
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

      {/* Action Buttons */}
      <div className="worker-actions">
        <Button
          onClick={() => onCall(workerDetails?.primaryMobile)}
          className="icon-button provider-call"
        >
          <img src={callIcon} alt="Call" />
        </Button>
        <Button
          onClick={() => setIsChatOpen(true)}
          className="icon-button message-button"
        >
          <img src={messageIcon} alt="Message" />
        </Button>
      </div>

      {/* Chat Dialog */}
      {isChatOpen && (
        <div className="message-popup-overlay">
          <YourUserProviderChat
            providerId={providerId}
            workerDetails={workerDetails}
            onCloseChat={() => setIsChatOpen(false)} // Callback to close the chat
          />
        </div>
      )}
    </div>
  );
};

export default YourWorkerInfo;
