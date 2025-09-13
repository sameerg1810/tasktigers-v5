import React, { useState, useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LZString from "lz-string"; // Import LZString for decompression
import "./LoginComponent.css";
const coolieLogo = `${IMAGE_BASE_URL}/new-logo.png`;

const LoginComponent = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(Array(4).fill("")); // OTP as an array of 4 empty strings
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Timer for countdown
  const [otpError, setOtpError] = useState(""); // Error message for OTP validation
  const navigate = useNavigate();
  const { sendOtp, login } = useAuth(); // Access sendOtp and login from AuthContext

  // Start the timer countdown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // Allow only one digit or empty value
    const updatedOtp = [...otp];
    updatedOtp[index] = value; // Update specific OTP field
    setOtp(updatedOtp);
    setOtpError(""); // Clear error when user starts entering OTP

    if (value && index < 3) {
      document.querySelectorAll(".otp-box")[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.querySelectorAll(".otp-box")[index - 1].focus();
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    await sendOtp({ phone });
    setOtp(Array(4).fill("")); // Clear OTP fields
    setOtpSent(true);
    setTimer(60); // Start 30-second timer
    setLoading(false);
  };

  const handleLogin = async () => {
    const combinedOtp = otp.join(""); // Combine OTP array into a single string
    if (combinedOtp.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      const success = await login({ phone, otp: combinedOtp });
      if (success) {
        onLoginSuccess();
        sessionStorage.removeItem("compressedOtp"); // Clear OTP from sessionStorage
        navigate("/home");
      } else {
        setOtpError("Please enter the correct OTP."); // Show error if OTP is incorrect
      }
    } catch (error) {
      console.error("Error during login:", error);
      setOtpError("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const compressedOtp = sessionStorage.getItem("compressedOtp");
    if (compressedOtp) {
      const decompressedOtp = LZString.decompress(compressedOtp);
      if (decompressedOtp && decompressedOtp.length === 4) {
        setOtp(decompressedOtp.split(""));
      }
    }
  }, [otpSent]);

  return (
    <div className="login-box">
      <img src={coolieLogo} alt="Coolie Logo" className="coolie-logo" />
      <div className="login-box-header">
        <h4>Welcome Back</h4>
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {!otpSent && (
        <button
          className="send-otp-button"
          onClick={handleSendOtp}
          disabled={loading || phone.length !== 10}
        >
          {loading ? "Sending..." : "Get OTP"}
        </button>
      )}

      {otpSent && (
        <>
          <div className="otp-group">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="otp-box"
                />
              ))}
          </div>

          <p className="otpnotify">{otpError}</p> {/* Display OTP error message */}

          {timer > 0 ? (
            <p className="timer-message">Resend OTP in {timer}s</p>
          ) : (
            <button className="resend-otp-button" onClick={handleSendOtp}>
              Resend OTP
            </button>
          )}

          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
        </>
      )}
    </div>
  );
};

export default LoginComponent;
