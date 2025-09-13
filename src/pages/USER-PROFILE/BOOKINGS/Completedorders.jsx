import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import "./orders.css";
import { CategoryContext } from "../../../context/CategoryContext";
import StarRating from "../../YourOrderPage/YourRating";

const CompletedOrders = ({ orders }) => {
  const navigate = useNavigate();
  const { locationCat, setSelectedCategoryId } = useContext(CategoryContext);

  const [openViewMore, setOpenViewMore] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Toggle the View More popup visibility
  const handleClickOpenViewMore = (order) => {
    setSelectedOrder(order);
    setOpenReview(false); // Close the review popup if open
    setOpenViewMore(true);
  };

  const handleCloseViewMore = () => {
    setOpenViewMore(false);
    setSelectedOrder(null);
  };

  // Toggle the Review popup visibility
  const handleClickOpenReview = () => {
    setOpenViewMore(false); // Close the view more popup if open
    setOpenReview(true);
  };

  const handleCloseReview = () => {
    setOpenReview(false);
  };

  // Handle customer support
  const handleContactSupport = () => {
    navigate("/faqChat");
  };

  // Handle rebook
  const handleRebook = (category) => {
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === category,
    );
    if (isCategoryInLocation) {
      setSelectedCategoryId(category);
      navigate("/services");
    } else {
      navigate("/services");
    }
    console.log("Rebooking with category:", category);
  };

  const handleDownloadInvoice = (orderId) => {
    console.log(orderId, "orderId");
    navigate(`/booking-details/${orderId}`);
  };

  // Log orders for debugging
  useEffect(() => {
    console.log(orders, "completed orders");
  }, [orders]);

  return (
    <Box
      sx={{
        maxHeight: "80vh", // Set max height for the container
        overflowY: "auto", // Add vertical scroll
       
        borderRadius: "8px",
        margin: "2rem auto",
      }}
    >
      {orders.map((order) => (
        <Box
          key={order._id}
          className="com-order-card"
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: 2,
            marginBottom: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {order?.orderId?.items?.length > 0
              ? order?.orderId?.items[0]?.serviceId?.name
              : "Service Name Not Available"}
          </Typography>

          <Typography>
            <strong>Status:</strong> {order?.status || "No Status"}
          </Typography>
          <Typography>
            <strong>Scheduled Date:</strong>{" "}
            <span className="scheduled-date">
              {order?.orderId?.items?.length > 0
                ? order?.orderId?.items[0]?.scheduledDate
                : "N/A"}
            </span>
          </Typography>
          <Typography>
            <strong>Selected Time:</strong>{" "}
            <span className="selected-time">
              {order?.orderId?.items?.length > 0
                ? order?.orderId?.items[0]?.selectedTime
                : "N/A"}
            </span>
          </Typography>
          <Typography>
            <strong>Total Amount:</strong>{" "}
            <span className="total-amount">
              ₹{order?.orderId?.totalAmount || "N/A"}
            </span>
          </Typography>
          <Box className="button-container" sx={{ marginTop: 2 }}>
            <button
              
              style={{
                backgroundColor: "black", // Orange color
                color: "white",
                
              }}
              onClick={() => handleRebook(order._id)}
              className="special-button"
            >
              Rebook
            </button>
            <button
             
              style={{
                backgroundColor: "black", // Orange color
                color: "white",
                
              }}
               className="special-button"
              onClick={() => handleContactSupport(order._id)}
            >
              Contact Support
            </button>
            <button
            
              style={{
                backgroundColor: "black", // Orange color
                color: "white",
              }}
               className="special-button"
              onClick={() => handleDownloadInvoice(order.orderId._id, true)}
            >
              Download Invoice
            </button>
          </Box>
        </Box>
      ))}

      {/* View More Dialog */}
      <Dialog
        open={openViewMore}
        onClose={handleCloseViewMore}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && selectedOrder?.orderId?.items?.length > 0 && (
            <>
              <Typography variant="h6">
                Service Name:{" "}
                {selectedOrder?.orderId?.items[0]?.serviceId?.name || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {selectedOrder?.status || "No Status"}
              </Typography>
              <Typography variant="body1">
                <strong>Scheduled Date:</strong>{" "}
                {selectedOrder?.orderId?.items[0]?.scheduledDate || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Selected Time:</strong>{" "}
                {selectedOrder?.orderId?.items[0]?.selectedTime || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Total Amount:</strong> ₹
                {selectedOrder?.orderId?.totalAmount || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong>{" "}
                {selectedOrder?.orderId?.items[0]?.serviceId?.description ||
                  "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong>{" "}
                {selectedOrder?.orderId?.addressId?.city || "N/A"},{" "}
                {selectedOrder?.orderId?.addressId?.state || "N/A"},{" "}
                {selectedOrder?.orderId?.addressId?.pincode || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Payment ID:</strong> {selectedOrder?.paymentId || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Provider ID:</strong>{" "}
                {selectedOrder?.providerIds?.[0] || "N/A"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewMore} color="primary">
            Close
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              handleRebook(selectedOrder?.orderId?.items?.[0]?.categoryId?._id)
            }
          >
            Rebook
          </Button>
          <Button onClick={handleClickOpenReview}>Review</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={openReview}
        onClose={handleCloseReview}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Rate Your Service</DialogTitle>
        <DialogContent>
          <StarRating />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReview} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompletedOrders;
