import React, { useContext, useState } from "react";
import { Button, Modal, Box } from "@mui/material";
import "./orders.css";
import { CategoryContext } from "../../../context/CategoryContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PendingOrders = ({ orders }) => {
  const navigate = useNavigate();
  const { locationCat, setSelectedCategoryId } = useContext(CategoryContext);

  const [openPopup, setOpenPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const userId = sessionStorage.getItem("userId");

  const handleContactSupport = () => {
    navigate("/faqChat");
  };

  const handleRebook = (category) => {
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === category
    );
    setSelectedCategoryId(isCategoryInLocation ? category : null);
    navigate("/services");
    console.log("Rebooking with category:", category);
  };

  const handleViewMoreClick = (order) => {
    setSelectedOrder(order);
    setOpenPopup(true);
    console.log(order, "selected order");
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setSelectedOrder(null);
  };

  const cancelOrder = async (orderId, userId) => {
    console.log(orderId, userId, "order user");

    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/order-history/user-cancel-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            userId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Order cancelled successfully!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1000,
        });
        setOpenPopup(false);
        return data;
      } else {
        toast.error("Failed to cancel the order.", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        console.error(
          "Failed to cancel the order:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      toast.error("An error occurred while canceling the order.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
      console.error("Error occurred while canceling the order:", error);
    }
  };

  return (
    <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "5px" }}>
      {orders.map((order) => (
        <div
          key={order._id}
          className="order-card"
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "5px",
            marginBottom: "16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 className="notification-pending">
            We are notifying available providers. This may take up to 15
            minutes.
          </h3>
          <h2 className="service-name">
            {order.items?.[0]?.serviceId?.name || "Service Name"}
          </h2>
          <p>Payment status: PAID</p>
          <p>
            Booking time:{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            <br />
            Booking Time:{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>Total Amount: ₹{order.totalAmount || "N/A"}</p>

          <div
            className="button-container"
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              variant="contained"
              style={{
                backgroundColor: "black",
                color: "#fff",
                borderRadius: "4px",
                textTransform: "none",
              }}
               className="special-button"
              onClick={() => handleRebook(order._id)}
            >
              Rebook
            </button>
            <button
              variant="contained"
              style={{
                backgroundColor: "black",
                color: "#fff",
                borderRadius: "4px",
                textTransform: "none",
              }}
               className="special-button"
              onClick={handleContactSupport}
            >
              Contact Support
            </button>
            <button
              variant="contained"
              style={{
                backgroundColor: "black",
                color: "#fff",
                borderRadius: "4px",
                textTransform: "none",
              }}
               className="special-button"
              onClick={() => handleViewMoreClick(order)}
            >
              View More
            </button>
          </div>
        </div>
      ))}

      {/* Modal Popup */}
      <Modal
        open={openPopup}
        onClose={handleClosePopup}
        aria-labelledby="service-details-popup"
        aria-describedby="service-details-popup-description"
      >
        <Box
          className="popup-box"
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
            maxWidth: "600px",
            margin: "auto",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {selectedOrder && (
            <div>
              <h2>Service Details</h2>
              <p>
                <strong>Category Name:</strong>{" "}
                {selectedOrder.items?.[0]?.categoryId?.name || "N/A"}
              </p>
              <p>
                <strong>Subcategory Name:</strong>{" "}
                {selectedOrder.items?.[0]?.subCategoryId?.name || "N/A"}
              </p>
              <p>
                <strong>Service Name:</strong>{" "}
                {selectedOrder.items?.[0]?.serviceId?.name || "N/A"}
              </p>
              <p>
                <strong>Scheduled Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p>
                <strong>Scheduled Time:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {selectedOrder.totalAmount || "N/A"}
              </p>
              <div className="button-container">
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: "black",
                    color: "#fff",
                    borderRadius: "4px",
                    textTransform: "none",
                    marginTop: "16px",
                  }}
                  onClick={handleClosePopup}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: "black",
                    color: "#fff",
                    borderRadius: "4px",
                    textTransform: "none",
                    marginTop: "16px",
                  }}
                  onClick={() => {
                    cancelOrder(selectedOrder._id, userId);
                  }}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default PendingOrders;
