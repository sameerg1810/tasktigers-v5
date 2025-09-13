import React, { useEffect, useRef } from "react";
import { useOrderHistory } from "../../../context/OrderHistoryContext"; // Context for order updates
import { useNavigate } from "react-router-dom"; // For navigation
import { toast } from "react-toastify"; // For user notifications
import "react-toastify/dist/ReactToastify.css"; // Toast styles
import { confirmAlert } from "react-confirm-alert"; // Confirm alert box
import "react-confirm-alert/src/react-confirm-alert.css"; // Confirm alert styles
import { onMessage } from "firebase/messaging"; // For Firebase notifications
import { messaging } from "../../../config/firebase"; // Firebase configuration

const OngoingOrders = ({ orders }) => {
  const navigate = useNavigate();
  const { updateOrderDetails } = useOrderHistory(); // Context function to update order details
  const jobCompleteOtpRef = useRef(null); // Ref to hold the job completion OTP

  // Custom styles for confirmAlert
  const customAlertStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    messageBox: {
      maxWidth: "300px",
      padding: "10px",
      fontSize: "14px",
      textAlign: "center",
      borderRadius: "8px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    buttons: {
      marginTop: "10px",
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
    button: {
      padding: "8px 16px",
      borderRadius: "4px",
      fontSize: "12px",
      border: "none",
      cursor: "pointer",
    },
    okButton: {
      backgroundColor: "#4caf50",
      color: "#fff",
    },
    cancelButton: {
      backgroundColor: "#f44336",
      color: "#fff",
    },
  };

  /**
   * Displays a styled confirm alert box.
   */
  const showStyledConfirmAlert = (title, message, onConfirm) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div style={customAlertStyles.messageBox}>
          <h4>{title}</h4>
          <p>{message}</p>
          <div style={customAlertStyles.buttons}>
            <button
              style={{
                ...customAlertStyles.button,
                ...customAlertStyles.okButton,
              }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              OK
            </button>
            <button
              style={{
                ...customAlertStyles.button,
                ...customAlertStyles.cancelButton,
              }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
    });
  };

  /**
   * Handles notifications received via Firebase messaging.
   */
  useEffect(() => {
    const handleNotification = (payload) => {
      console.log("Notification received:", payload);

      const { notification, data } = payload || {};
      const title = notification?.title;
      const body = notification?.body;

      console.log("Notification Title:", title);
      console.log("Notification Body:", body);
      console.log("Notification Data:", data);

      if (title === "Order Canceled by Provider") {
        console.log("Handling Order Canceled by Provider notification.");
        showStyledConfirmAlert("Order Canceled", body, () => {
          navigate("/"); // Redirect to homepage
        });
      } else if (title === "OTP for Order Completion") {
        console.log("Handling OTP for Order Completion notification.");
        const extractedOtp = data?.otp;
        console.log("Extracted OTP:", extractedOtp);

        if (extractedOtp) {
          jobCompleteOtpRef.current = extractedOtp; // Store OTP in ref
          showStyledConfirmAlert(
            "OTP Received",
            `Your OTP is: ${extractedOtp}. Please share it with the provider.`,
            () => {},
          );
        }
      } else if (title === "Order Completed") {
        console.log("Handling Order Completed notification.");
        showStyledConfirmAlert(
          "Order Completed",
          "Your order has been successfully completed.",
          () => navigate("/order-summary"), // Redirect to order summary
        );
      } else if (title === "Order Accepted") {
        console.log("Handling Order Accepted notification.");
        showStyledConfirmAlert(
          "Order Accepted",
          "Your order has been accepted by a provider.",
          () => {},
        );
      } else if (
        title === "Order Status Update" &&
        data?.status === "Workstart"
      ) {
        console.log("Handling Order Status Update (Workstart) notification.");
        showStyledConfirmAlert(
          "Service Started",
          "The service provider has started the job.",
          () => {},
        );
      } else {
        console.log("Unhandled notification title:", title);
      }
    };

    const unsubscribe = onMessage(messaging, handleNotification);

    return () => {
      console.log("Unsubscribing from Firebase notifications.");
      unsubscribe();
    };
  }, [navigate]);

  /**
   * Handles "View More" action for a specific order.
   */
  const handleViewMore = (orderId, providerId, status) => {
    // Validate parameters
    const missingParams = [];
    if (!orderId) missingParams.push("Order ID");
    if (!providerId) missingParams.push("Provider ID");
    if (!status) missingParams.push("Status");

    if (missingParams.length > 0) {
      const message = `Missing parameters: ${missingParams.join(", ")}. Unable to proceed.`;
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(message);
      return;
    }

    // Update order details in context
    updateOrderDetails(orderId, providerId, status);

    console.log("Navigating to order details page:", {
      orderId,
      providerId,
      status,
    });

    navigate(`/your-order-page`);
  };

  /**
   * Handles navigation to support chat.
   */
  const handleContactSupport = () => {
    navigate("/faqChat");
  };

  // Filter out orders with null providerId
  const filteredOrders = orders.filter((order) => order.providerId !== null);

  useEffect(()=>{
    console.log(filteredOrders,'ongoing orders')
  },[filteredOrders])


  return (
    <div
      style={{
        maxHeight: "80vh",
        overflowY: "auto",
        borderRadius: "8px",
        margin:"2rem 0rem",
      }}
    >
      {filteredOrders && filteredOrders.length > 0 ? (
        filteredOrders.map((order, index) => {
          const orderId = order.orderId?._id;
          const providerId = order.providerId?._id;
          const status = order.status;

          return (
            <div
              key={order._id || index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p style={{ margin: "0 0 4px" }}>
                <strong>Service Name:</strong>{" "}
                {order.orderId?.items?.[0]?.serviceId?.name || "N/A"}
              </p>
              <p style={{ margin: "0 0 4px" }}>
                <strong>Total Amount:</strong> ₹
                {order.orderId?.totalAmount || "N/A"}
              </p>
              <p style={{ margin: "0 0 16px" }}>
                <strong>Status:</strong>{" "}
                {status === "Accepted"
                  ? "Your order has been accepted"
                  : "Your work has been started"}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleViewMore(orderId, providerId, status)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "black",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  View More
                </button>
                <button
                  onClick={handleContactSupport}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "black",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Contact Support
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>No ongoing orders to display.</p>
      )}
    </div>
  );
};

export default OngoingOrders;
