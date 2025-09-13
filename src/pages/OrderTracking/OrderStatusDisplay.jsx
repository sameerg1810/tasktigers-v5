import React from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/system";

// Import the relevant GIFs for each status
const orderInProgressGif = `${IMAGE_BASE_URL}/InProgress.gif`;
const serviceAcceptedGif = `${IMAGE_BASE_URL}/orderAccepted.gif`;
const orderCompletedGif = `${IMAGE_BASE_URL}/Completed.gif`;
const pendingOrderGif = `${IMAGE_BASE_URL}/Pending.gif`;

const StatusContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

const OrderStatusDisplay = ({ orderStatus }) => {
  let statusMessage = "Pending Order";
  let statusGif = pendingOrderGif;

  // Determine the message and GIF based on the order status
  switch (orderStatus) {
    case "InProgress":
      statusMessage = "Order in Progress";
      statusGif = orderInProgressGif;
      break;
    case "Accepted":
      statusMessage = "Service Accepted";
      statusGif = serviceAcceptedGif;
      break;
    case "Completed":
      statusMessage = "Order Completed";
      statusGif = orderCompletedGif;
      break;
    default:
      statusMessage = "Pending Order";
      statusGif = pendingOrderGif;
  }

  return (
    <StatusContainer>
      <img src={statusGif} alt={statusMessage} width={60} height={70} />
      <Typography variant="h5">{statusMessage}</Typography>
    </StatusContainer>
  );
};

export default OrderStatusDisplay;
