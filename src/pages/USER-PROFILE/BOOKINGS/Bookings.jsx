import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import "./Bookings.css";
import PendingOrders from "./Pendingorders";
import CompletedOrders from "./Completedorders";
import CancelledOrders from "./Cancelledorders";
import OngoingOrders from "./Ongoingorders"; // Import the new OngoingOrders component
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useOrderHistory } from "../../../context/OrderHistoryContext";

const Bookings = () => {
  const { userId: authUserId } = useAuth();
  const userId = authUserId || sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const { setSelectedOrderId, setCurrentOrderStatus } = useOrderHistory();

  const [orders, setOrders] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderStatus = async () => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      setLoading(true);
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/order-history/user/${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch order history.");
      const data = await response.json();
      setOrdersData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/order/user/${userId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch orders.");
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    fetchOrders();
  }, [userId]);

  const handleTabChange = (event, value) => {
    setSelectedTab(value);
  };

  const handleViewMore = (orderId, isActiveTab) => {
    console.log(orderId, "selectedorderid");
    setSelectedOrderId(orderId);
    if (isActiveTab) setCurrentOrderStatus("Active");
    navigate("/your-order-page");
  };

  const filteredOrders = (() => {
    switch (selectedTab) {
      case "Pending":
        return orders.filter((order) => order.status === "Pending");
      case "Ongoing":
        return ordersData.filter((order) =>
          ["Accepted", "Workstart", "InProgress"].includes(order.status),
        );
      case "Cancelled":
        return ordersData.filter((order) =>
          ["CancelledByUser", "CancelledByProvider"].includes(order.status),
        );
      case "Completed":
        return ordersData.filter((order) => order.status === "Completed");
      default:
        return [];
    }
  })();

  useEffect(() => {
    console.log(ordersData, "orderdata");
  }, [ordersData]);

  return (
    <div className="bookings-container">
      <h1 className="bookings-title">My Bookings</h1>
      <div>
        <Tabs
          className="tabs-con"
          value={selectedTab}
          onChange={handleTabChange}
        >
          <Tab className="tab-item" value="Pending" label="Pending" />
          <Tab className="tab-item" value="Ongoing" label="Ongoing" />
          <Tab className="tab-item" value="Completed" label="Completed" />
          <Tab className="tab-item" value="Cancelled" label="Cancelled" />
        </Tabs>
      </div>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {selectedTab === "Pending" && (
            <PendingOrders orders={orders} handleViewMore={handleViewMore} />
          )}
          {selectedTab === "Ongoing" && (
            <OngoingOrders
              orders={filteredOrders}
              handleViewMore={handleViewMore}
            />
          )}
          {selectedTab === "Completed" && (
            <CompletedOrders
              orders={filteredOrders}
              handleViewMore={handleViewMore}
            />
          )}
          {selectedTab === "Cancelled" && (
            <CancelledOrders
              orders={filteredOrders}
              handleViewMore={handleViewMore}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Bookings;
