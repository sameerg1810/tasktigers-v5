import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import YourWorkerInfo from "./YourWorkerInfo";
import YourTimer from "./YourTimer";
import YourRating from "./YourRating";
import YourLoadingPage from "./YourLoadingPage";
import { Toaster, toast } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import YourSOSDialog from "./YourSOSDialog";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../config/firebase";
const NODATA =  `${IMAGE_BASE_URL}/Nothing.gif`;
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  Box,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OrderStatusDisplay from "./OrderStatusDisplay";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import { sendFeedback } from "./api/your-feedback-api";
import { useOrderHistory } from "../../context/OrderHistoryContext";
import { useNavigate } from "react-router-dom";
import "./YourOrderPage.css";

const YourOrderPage = () => {
  const {
    selectedProviderId,
    selectedOrderId,
    currentOrderStatus,
    resetOrderHistory,
    setCurrentOrderStatus,
  } = useOrderHistory();

  const navigate = useNavigate();

  const [providerId, setProviderId] = useState(selectedProviderId || null);
  const [orderStatus, setOrderStatus] = useState(
    currentOrderStatus || "Pending",
  );
  const [jobCompleteOtp, setJobCompleteOtp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSosDialogOpen, setIsSosDialogOpen] = useState(false);
  const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [error, setError] = useState(false);
  const [matchingOrder, setMatchingOrder] = useState(null);
  const [Allorders, setAllOrders] = useState(null);
  const userId = sessionStorage.getItem('userId')

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
  const resetStateForNewOrder = (delay = 0) => {
    setTimeout(() => {
      setProviderId(null);
      setOrderStatus("Pending");
      setJobCompleteOtp("");
      setIsLoading(true);
      resetOrderHistory();
    }, delay);
  };

  /**
   * Fetch matching order details from `Allorders`.
   */
  useEffect(() => {
    const handleNotification = (payload) => {
      console.log("Notification payload received:", payload);

      const { notification, data } = payload || {};
      const title = notification?.title;
      const body = notification?.body;

      if (!notification) {
        console.warn("No notification object found in payload.");
        return;
      }

      // Handle different notification types
      switch (title) {
        case "Provider sent OTP": {
          const extractedOtp = body?.match(/\d{4}/)?.[0]; // Extract OTP from body
          if (extractedOtp) {
            setJobCompleteOtp(extractedOtp);
            showSmallConfirmAlert(
              "OTP Received",
              `Your OTP is: ${extractedOtp}. Please share it with the provider.`,
              () => {},
            );
          }
          break;
        }

        case "OTP for Order Completion": {
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
          break;
        }

        case "Order Completed":
          setOrderStatus("Completed");
          setCurrentOrderStatus("Completed");
          showSmallConfirmAlert(
            "Order Completed",
            "Your order has been successfully completed. Please leave a review and rating.",
            () => setIsRatingPopupOpen(true),
          );
          break;

        case "Order Accepted":
          setOrderStatus("Accepted");
          setCurrentOrderStatus("Accepted");
          setProviderId(data?.providerId || null);
          showSmallConfirmAlert(
            "Order Accepted",
            "Your order has been accepted by a provider.",
            () => {},
          );
          break;

        case "Order Status Update":
          setOrderStatus(data?.status || "InProgress");
          showSmallConfirmAlert(
            "Order Status Update",
            `Your order for service(s) (${data?.serviceNames}) is now ${data?.status}. Scheduled on ${data?.scheduledDate} at ${data?.selectedTime}.`,
            () => {},
          );
          break;

        default:
          console.warn("Unhandled notification type:", title);
      }

      setIsLoading(false);
    };

    // Subscribe to Firebase messaging
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Firebase message received:", payload);
      handleNotification(payload);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Unsubscribing from Firebase messaging listener.");
      unsubscribe();
    };
  }, [setCurrentOrderStatus]);

  // getting selected orders form ordera api

  useEffect(() => {
    const fetchSelectedOrder = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const responce = await fetch(
          `${AZURE_BASE_URL}/v1.0/users/order/order/${selectedOrderId}`,
        );
        const data = await responce.json();
        setAllOrders(data);
      } catch (err) {
        console.log(err, "error while fetching selected order");
      }
    };
    fetchSelectedOrder();
  }, [selectedOrderId]);



  useEffect(() => {
    console.log("Fetching matching order details...");
    if (Allorders && selectedOrderId) {
      const order = Allorders;
      console.log(order, "selected order");
      if (order) {
        console.log("Matching Order Found: ", order);
        setMatchingOrder(order);
        setOrderStatus(order?.status || "Pending");

        // Priority given to selectedProviderId
        if (!selectedProviderId) {
          console.log("Order is pending; no provider assigned yet.");
        }
      } else {
        console.error("No matching order found!");
        setError(true);
      }
    }
    setIsLoading(false);
  }, [Allorders, selectedOrderId, selectedProviderId]);

  /**
   * Handle notifications from Firebase messaging.
   */



  useEffect(() => {
    if (!selectedOrderId || !selectedProviderId) {
      console.error(
        "Missing essential data: selectedOrderId or selectedProviderId",
      );
      setError(true);
      setIsLoading(false);
      return;
    }

    if (currentOrderStatus !== "Pending") {
      console.log(
        "Skipping loading for non-Pending status:",
        currentOrderStatus,
      );
      setOrderStatus(currentOrderStatus); // Override orderStatus from context
      setIsLoading(false);
    } else if (orderStatus === "Pending") {
      console.log("Loading page shown for Pending status.");
      setIsLoading(true);
    } else {
      console.log(
        "Order status is neither Pending nor from context, disabling loading.",
      );
      setError(false);
      setIsLoading(false);
    }
  }, [selectedOrderId, selectedProviderId, currentOrderStatus, orderStatus]);

  const handleBackToBookings = () => {
    console.log("Navigating back to bookings...");
    navigate("/bookings");
  };

  if (isLoading) {
    return <YourLoadingPage />;
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={NODATA} alt="No Data" style={{ maxWidth: "300px" }} />
        <Typography variant="h6" color="textSecondary" sx={{ marginTop: 2 }}>
          No data available for the selected order.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToBookings}
        >
          Back to My Bookings
        </Button>
      </Box>
    );
  }


  // cancelorder

    const cancelOrder = async (orderId, userId) => {
      console.log(orderId,userId,'order and userid')

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
          return data;
        } else {
          console.error('Failed to cancel the order:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error occurred while canceling the order:', error);
      }
    };
 

  return (
    <Box>
      {/* Sticky Header */}
      <div className="op-sticky-header">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToBookings}
          className="op-action-button op-back-button"
        >
          Back to Bookings
        </Button>
      </div>

      <div className="order-status-bar">
        <div>
          <OrderStatusDisplay orderStatus={orderStatus} />
        </div>

        <div className="sos-button">
          <Button
            color="error"
            variant="contained"
            onClick={() => setIsSosDialogOpen(true)}
            startIcon={<ReportProblemIcon />}
          >
            SOS
          </Button>
        </div>
      </div>

      <div className="orders-otp-display">
        <div className="order-display">
          <div className="summary-canel">
            <h3>Order summary</h3>
            {   orderStatus === "Accepted" &&
              <div className="cancel-button" onClick={()=>{cancelOrder(selectedOrderId,userId)}}>Cancel</div>
            }
            
          </div>
         
          {matchingOrder ? (
            <>
              <div className="order-details-container">
                {/* Left Column: Image */}
                <div className="order-image">
                  <img
                    src={matchingOrder.items[0]?.serviceId?.image}
                    alt={matchingOrder.items[0]?.serviceId?.name}
                  />
                </div>

                {/* Middle Column: Name */}
                <div className="order-name">
                  <h2>{matchingOrder.items[0]?.serviceId?.name}</h2>
                </div>

                {/* Right Column: Price */}
                <div className="order-price">
                  <p>
                    <span>{matchingOrder.totalAmount}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p>Loading order details...</p>
          )}
        </div>

        {/* PROVIDER DETAILS*/}
        <div className="provider-details">
          {selectedProviderId ? (
            <YourWorkerInfo
              jobCompleteOtp={jobCompleteOtp}
              providerId={selectedProviderId}
              reviewCompleted={reviewCompleted}
              onCall={(phone) => {
                if (phone) {
                  window.location.href = `tel:${phone}`;
                  toast.success(`Calling ${phone}...`);
                } else {
                  toast.error("Phone number not available.");
                }
              }}
              onCancel={() =>
                confirmAlert({
                  title: "Cancel Booking",
                  message: "Are you sure you want to cancel this booking?",
                  buttons: [
                    {
                      label: "Yes",
                      onClick: () => toast.error("Booking cancelled."),
                    },
                    {
                      label: "No",
                    },
                  ],
                })
              }
            />
          ) : (
            <Box
              sx={{
                textAlign: "center",
                padding: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="textSecondary">
                No provider assigned yet. Your order is still pending.
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ marginTop: 1 }}
              >
                Once a provider accepts the job, you’ll see their details here.
              </Typography>
            </Box>
          )}
        </div>
      </div>

      <Grid container justifyContent="center" spacing={3} padding={3}>
        {/* USER details */}

        <Grid item xs={12} sx={{ margin: " 0rem 2rem" }}>
          {matchingOrder ? (
            <Grid container spacing={3} justifyContent="left">
              {/* Right Column: Order Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: 4, borderRadius: 3, padding: "1rem" }}>
                  <CardContent>
                    {/* User Information */}
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 1,
                      }}
                    >
                      <PersonIcon sx={{ marginRight: "8px" }} />{" "}
                      {matchingOrder.userId.name} {matchingOrder.userId.phone}
                    </Typography>

                    {/* Address */}
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 1,
                      }}
                    >
                      <LocationOnIcon sx={{ marginRight: "8px" }} />
                      {matchingOrder.addressId.city},{" "}
                      {matchingOrder.addressId.state} -{" "}
                      {matchingOrder.addressId.pincode}
                    </Typography>

                    {/* Date & Time */}
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 1,
                      }}
                    >
                      <ScheduleIcon sx={{ marginRight: "8px" }} />
                      {matchingOrder.items[0]?.selectedDate} at{" "}
                      {matchingOrder.items[0]?.selectedTime}
                    </Typography>

                    {/* Total Amount */}
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 1,
                        color: "#2e7d32", // Highlight with green color
                        fontWeight: "bold", // Make the text bold for emphasis
                      }}
                    >
                      <CurrencyRupeeIcon sx={{ marginRight: 1 }} />
                      {matchingOrder.totalAmount} /-
                    </Typography>

                    {/* Order Created Date */}
                    <Typography variant="body2" color="textSecondary">
                      Order Placed On:{" "}
                      {new Date(matchingOrder.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading order details...</Typography>
          )}
        </Grid>

        {/* SOS calls Container */}
        <YourSOSDialog
          isOpen={isSosDialogOpen}
          onClose={() => setIsSosDialogOpen(false)}
        />
        <Dialog
          open={isRatingPopupOpen}
          onClose={() => setIsRatingPopupOpen(false)}
        >
          <YourRating
            isOpen={isRatingPopupOpen}
            handleClose={() => setIsRatingPopupOpen(false)}
            handleSubmit={(rating, feedback) => {
              sendFeedback({
                rating,
                feedback,
                providerId,
              });
              setIsRatingPopupOpen(false);
              setReviewCompleted(true);
              toast.success("Thank you for your feedback!");
              resetStateForNewOrder(7000);
            }}
          />
        </Dialog>
      </Grid>
      <Toaster />
    </Box>
  );
};

export default YourOrderPage;
