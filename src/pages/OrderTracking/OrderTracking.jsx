import React, { useEffect, useState } from "react";
import './OrderTracking.css'
import Cookies from "js-cookie";
import WorkerInfo from "./WorkerInfo";
import Timer from "./Timer";
import Rating from "./Rating";
import { Toaster, toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import LoadingPage from "./LoadingPage";
import SOSDialog from "./SOSDialog";
import NoOrder from "./NoOrder";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../config/firebase";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import OrderStatusDisplay from "./OrderStatusDisplay";
import { sendFeedback } from "./api/feedback-api";
import { useOrderHistory } from "../../context/OrderHistoryContext";

// Custom styles for the confirmation alert
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
    padding: "5px 15px",
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

// Custom confirmation alert function
const showSmallConfirmAlert = (title, message, onConfirm) => {
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

const OrderTracking = () => {
  const [providerId, setProviderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [jobCompleteOtp, setJobCompleteOtp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSosDialogOpen, setIsSosDialogOpen] = useState(false);
  const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderHistoryId, setOrderHistoryId] = useState("");
  const [userId, setUserId] = useState(sessionStorage.getItem("userId"));
  const [titleStatus,setTitleStatus]=useState('')


  const location = useLocation();

  useEffect(()=>{
   console.log(orderHistoryId,'orderhistory id in order tracking')
  },[])

  const {
    currentProviderId,
    currentOrderStatus,
    currentJobCompleteOtp,
    currentReviewCompleted,
    currentOrderCreated,
    resetOrderHistory,
  } = useOrderHistory();

  const finalProviderId = providerId || currentProviderId;
  const finalOrderStatus = orderStatus || currentOrderStatus;
  const finalJobCompleteOtp = jobCompleteOtp || currentJobCompleteOtp;
  const finalReviewCompleted = reviewCompleted || currentReviewCompleted;
  const finalOrderCreated = orderCreated || currentOrderCreated;

  const resetStateForNewOrder = (delay = 0) => {
    setTimeout(() => {
      Cookies.remove("providerId");
      Cookies.remove("orderStatus");
      setProviderId(null);
      setOrderStatus("Pending");
      setJobCompleteOtp("");
      setIsLoading(true);
      setOrderCreated(false);
      resetOrderHistory();
    }, delay);
  };

  useEffect(() => {
    Cookies.set("providerId", null, { expires: 1 });
    Cookies.set("orderStatus", "Pending", { expires: 1 });
  }, []);

  useEffect(() => {
    const savedProviderId = Cookies.get("providerId");
    const savedOrderStatus = Cookies.get("orderStatus");

    const params = new URLSearchParams(location.search);
    setOrderCreated(params.get("orderCreated") === "true");

    if (savedProviderId) setProviderId(savedProviderId);
    if (savedOrderStatus && savedOrderStatus !== "Pending") {
      setOrderStatus(savedOrderStatus);
      setIsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (providerId) Cookies.set("providerId", providerId, { expires: 1 });
    if (orderStatus) Cookies.set("orderStatus", orderStatus, { expires: 1 });
  }, [providerId, orderStatus]);

  useEffect(() => {
    const handleNotification = (payload) => {
      // Log the entire payload for debugging
      console.log("Received Notification Payload:", payload);

      // Destructure notification and data from the payload
      const { notification, data } = payload || {};
      const title = notification?.title;
      setTitleStatus(title)
      const body = notification?.body;

      // Debug individual components of the payload
      console.log("Notification Title:", title);
      console.log("Notification Body:", body);
      console.log("Notification Data:", data);

      setOrderHistoryId(data.orderId)

      // Handle different notification titles
      if (title === "Order Canceled by Provider") {
        console.log("Handling Order Canceled by Provider notification.");
        showSmallConfirmAlert("Order Canceled", body, () => {
          window.location.href = "/";
        });
      } else if (title === "OTP for Order Completion") {
        console.log("Handling OTP for Order Completion notification.");
        const extractedOtp = data?.otp; // Extract the OTP directly from data
        console.log("Extracted OTP from Notification Data:", extractedOtp);

        if (extractedOtp) {
          setJobCompleteOtp(extractedOtp); // Set the OTP in state
          showSmallConfirmAlert(
            "OTP Received",
            `Your OTP is: ${extractedOtp}. Please share it with the provider.`,
            () => {},
          );
        }
      } else if (title === "Order Completed") {
        console.log("Handling Order Completed notification.");
        setOrderStatus("Completed");
        showSmallConfirmAlert(
          "Order Completed",
          "Your order has been successfully completed. Please leave a review and rating.",
          () => setIsRatingPopupOpen(true),
        );
      } else if (title === "Order Accepted") {
        console.log("Handling Order Accepted notification.");
        setOrderStatus("Accepted");
        setProviderId(data?.providerId || null);
        showSmallConfirmAlert(
          "Order Accepted",
          "Your order has been accepted by a provider.",
          () => {},
        );
      } else if (
        title === "Order Status Update" &&
        data?.status === "Workstart"
      ) {
        console.log("Handling Order Status Update (Workstart) notification.");
        setOrderStatus("InProgress");
        showSmallConfirmAlert(
          "Service Started",
          "The service provider has started the job.",
          () => {},
        );
      } else {
        console.log("Unhandled notification title:", title);
      }

      // Stop the loading state once the notification is handled
      setIsLoading(false);
    };

    // Listen for Firebase notifications
    const unsubscribe = onMessage(messaging, handleNotification);

    // Cleanup the subscription on unmount
    return () => {
      console.log("Unsubscribing from Firebase notifications.");
      unsubscribe();
    };
  }, [
    setJobCompleteOtp,
    setOrderStatus,
    setIsRatingPopupOpen,
    setIsLoading,
    setProviderId,
  ]);

  if (!finalOrderCreated) return <NoOrder />;
  if (isLoading) return <LoadingPage />;

  return (
    <div className="workinfo-main">
          <div
           className="status-sos"
          >
            <OrderStatusDisplay orderStatus={finalOrderStatus} />
            <button
              color="error"
              variant="contained"
              className="sos-button"
              onClick={() => setIsSosDialogOpen(true)}
              startIcon={<ReportProblemIcon />}
            >
              SOS
            </button>
          </div>
       
          <div className="workerinfo-main">
            {finalProviderId ? (
              <WorkerInfo
                jobCompleteOtp={finalJobCompleteOtp}
                providerId={finalProviderId}
                reviewCompleted={finalReviewCompleted}
                orderHistoryId={orderHistoryId}
                orderStatus= {titleStatus}
                onCall={handleCall}
                onCancel={handleCancel}
              />
            ) : (
              <Typography color="textSecondary">
                No provider assigned yet.
              </Typography>
            )}
          </div>
     
      

      <SOSDialog
        isOpen={isSosDialogOpen}
        onClose={() => setIsSosDialogOpen(false)}
      />

      <Dialog
        open={isRatingPopupOpen}
        onClose={() => setIsRatingPopupOpen(false)}
      >
        <Rating
          isOpen={isRatingPopupOpen}
          handleClose={() => setIsRatingPopupOpen(false)}
          handleSubmit={handleSubmitRating}
        />
      </Dialog>

      <Toaster />
    </div>
  );

  function handleCall(phone) {
    if (phone) {
      window.location.href = `tel:${phone}`;
      toast.success(`Calling ${phone}...`);
    } else {
      toast.error("Phone number not available.");
    }
  }

  function handleCancel() {
    showSmallConfirmAlert(
      "Cancel Booking",
      "Your Refund will be initiated soon.",
      () => {},
    );
  }

  function handleSubmitRating(rating, feedback) {
    sendFeedback({
      userId: userId,
      rating: rating,
      orderHistoryId: orderHistoryId,
      description: feedback,
      providerId: finalProviderId,
    });
    setIsRatingPopupOpen(false);
    setReviewCompleted(true);
    toast.success("Thank you for your feedback!");
    resetStateForNewOrder(7000);
  }
};

export default OrderTracking;
