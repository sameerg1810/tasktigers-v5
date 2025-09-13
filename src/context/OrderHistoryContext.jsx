import React, { createContext, useState, useContext, useEffect } from "react";

const OrderHistoryContext = createContext();

// Custom hook to access the OrderHistoryContext
export const useOrderHistory = () => {
  return useContext(OrderHistoryContext);
};

export const OrderHistoryProvider = ({ children }) => {
  // State for the current tracking details
  const [currentProviderId, setCurrentProviderId] = useState(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState("Pending");
  const [currentJobCompleteOtp, setCurrentJobCompleteOtp] = useState("");
  const [currentReviewCompleted, setCurrentReviewCompleted] = useState(false);
  const [currentOrderCreated, setCurrentOrderCreated] = useState(false);

  // State for selected order details (YourOrderPage specific)
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // State for storing all orders and all order histories
  const [Allorders, setAllOrders] = useState([]);
  const [Allorderhistories, setAllOrderhistories] = useState([]);

  useEffect(() => {
    console.log(Allorders);
  }, [selectedOrderId]);

  // Method to reset current order history state
  const resetOrderHistory = () => {
    setCurrentProviderId(null);
    setCurrentOrderStatus("Pending");
    setCurrentJobCompleteOtp("");
    setCurrentReviewCompleted(false);
    setCurrentOrderCreated(false);
  };

  // Method to reset selected order details
  const resetSelectedOrder = () => {
    setSelectedOrderId(null);
    setSelectedProviderId(null);
  };

  useEffect(() => {
    console.log(selectedOrderId, "selected order id");
  }, [selectedOrderId]);

  // Method to update order details and status
  const updateOrderDetails = (orderId, providerId, status) => {
    console.log("updateOrderDetails called with:");
    console.log("Order ID:", orderId);
    console.log("Provider ID:", providerId);
    console.log("Status:", status);

    if (!orderId || !providerId || !status) {
      console.error("Incomplete order details provided for update.");
      return;
    }

    setSelectedOrderId(orderId);
    setSelectedProviderId(providerId);
    setCurrentOrderStatus(status);

    console.log("State updated:");
    console.log("Selected Order ID:", orderId);
    console.log("Selected Provider ID:", providerId);
    console.log("Current Order Status:", status);
  };

  // Context value
  const contextValue = {
    // Current order details
    currentProviderId,
    setCurrentProviderId,
    currentOrderStatus,
    setCurrentOrderStatus,
    currentJobCompleteOtp,
    setCurrentJobCompleteOtp,
    currentReviewCompleted,
    setCurrentReviewCompleted,
    currentOrderCreated,
    setCurrentOrderCreated,

    // Selected order details
    selectedOrderId,
    setSelectedOrderId,
    selectedProviderId,
    setSelectedProviderId,

    // Reset methods
    resetOrderHistory,
    resetSelectedOrder,

    // Update order details
    updateOrderDetails,

    // All orders and histories
    Allorders,
    setAllOrders,
    Allorderhistories,
    setAllOrderhistories,
  };

  return (
    <OrderHistoryContext.Provider value={contextValue}>
      {children}
    </OrderHistoryContext.Provider>
  );
};
