import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const TimerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "orderStatus", // Prevents orderStatus from being passed to the DOM
})(({ theme, orderStatus }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "30%",
  height: "60%",
  backgroundColor:
    orderStatus === "Completed"
      ? "#ffffff"
      : orderStatus === "InProgress"
        ? "#e0ffe0"
        : "#000", // White background for completed, green for in progress
  color: orderStatus === "InProgress" ? "#006400" : "#fff", // Dark green text when in progress
  fontFamily: "'Roboto', sans-serif",
  fontSize: "0.8rem",
  textShadow:
    orderStatus === "InProgress"
      ? "0 0 10px #00ff00"
      : "0 0 5px #f00, 0 0 10px #f00, 0 0 15px #f00",
  padding: "0.5rem",
  borderRadius: "8px",
  boxShadow:
    orderStatus === "Completed"
      ? "0px 0px 20px #ffa500"
      : orderStatus === "InProgress"
        ? "0px 0px 20px #00ff00"
        : "inset 0px 0px 10px #ff0000", // Orange glow for completed
}));

const Timer = ({ orderStatus }) => {
  const [time, setTime] = useState(orderStatus === "Accepted" ? 1800 : 0); // Start from 0 when InProgress or countdown from 1800 when Accepted
  const [isRunning, setIsRunning] = useState(
    orderStatus === "InProgress" || orderStatus === "Accepted",
  );

  useEffect(() => {
    if (orderStatus === "InProgress") {
      setTime(0); // Reset timer to 0 when order is in progress
      setIsRunning(true);
    } else if (orderStatus === "Accepted") {
      setIsRunning(true);
    } else if (orderStatus === "Completed") {
      setIsRunning(false);
      console.log(`Total service time: ${formatTime(time)}`); // Log total service time when completed
    }
  }, [orderStatus]);

  useEffect(() => {
    if (!isRunning) return;

    const timerId = setInterval(() => {
      setTime((prevTime) => {
        if (orderStatus === "Accepted") {
          return prevTime > 0 ? prevTime - 1 : 0; // Countdown if Accepted
        } else if (orderStatus === "InProgress") {
          return prevTime + 1; // Count up if InProgress
        }
        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning, orderStatus]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <TimerContainer orderStatus={orderStatus}>
      <Typography variant="h6" component="div">
        {orderStatus === "InProgress"
          ? `We're on it! Service underway: ${formatTime(time)}`
          : orderStatus === "Accepted"
            ? `Hang tight! Your worker will arrive in ${formatTime(time)}`
            : "Service completed! Total time: " + formatTime(time)}
      </Typography>
    </TimerContainer>
  );
};

export default Timer;
