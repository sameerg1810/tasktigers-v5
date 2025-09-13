import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";

const CancelledOrders = ({ orders }) => {
  // Handle rebook
  const handleRebook = (category) => {
    console.log("Rebooking with category:", category);
    // Add navigation logic or function call for rebooking
  };

  // Handle contact support
  const handleContactSupport = (orderId) => {
    console.log("Contact support for order:", orderId);
    // Add logic for contacting support
  };

  useEffect(() => {
    console.log(orders, "cancelled orders");
  }, [orders]);

  return (
    <Box
      sx={{
        margin:'2rem auto',
        maxHeight: "80vh", // Set max height for the container
        overflowY: "auto", // Add vertical scroll
        borderRadius: "8px",
      }}
    >
      {/* Display All Orders */}
      {orders.length > 0 ? (
        orders.map((order) => (
          <Box
            key={order._id}
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: 2,
              marginBottom: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {order.orderId?.items?.[0]?.serviceId?.name || "Service Name"}
            </Typography>
            <Typography>
              <strong>Service Price:</strong> ₹
              {order.orderId?.totalAmount || "N/A"}
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              {order.status === "CancelledByUser"
                ? "Cancelled by User"
                : order.status === "CancelledByProvider"
                  ? "Cancelled by Provider"
                  : order.status === "SystemCancelled"
                    ? "System Cancelled"
                    : "N/A"}
            </Typography>
            <Typography>
              <strong>Refund Status:</strong> {order.refundStatus || "Refunded"}
            </Typography>

            {/* Buttons for Rebook and Contact Support */}
            <div className="button-container" style={{ marginTop: "10px" }}>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "black", // Orange color
                  color: "white",
                  marginRight: "10px",
                }}
                onClick={() => handleRebook(order._id)}
              >
                Rebook
              </Button>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "black", // Orange color
                  color: "white",
                }}
                onClick={() => handleContactSupport(order._id)}
              >
                Contact Support
              </Button>
            </div>
          </Box>
        ))
      ) : (
        <Typography>No orders available.</Typography>
      )}
    </Box>
  );
};

export default CancelledOrders;
