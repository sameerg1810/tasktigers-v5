import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  ListItemAvatar,
  Avatar,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import HelpIcon from "@mui/icons-material/Help";
import DoneIcon from "@mui/icons-material/Done";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getNotificationsByPurpose,
  deleteNotification,
  clearAllNotifications,
  markNotificationAsRead,
} from "./api/notificationsAPI";
import "./NotificationPage.css";

const NotificationsPage = () => {
  const userId = sessionStorage.getItem("userId");
  const [selectedTab, setSelectedTab] = useState("order");
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { value: "order", label: "Orders", icon: <NotificationsIcon /> },
    { value: "promotions", label: "Promotions", icon: <LocalOfferIcon /> },
    { value: "help", label: "Help", icon: <HelpIcon /> },
  ];

  const fetchOrderAndOtpNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orderNotifications, otpNotifications] = await Promise.all([
        getNotificationsByPurpose(userId, "order"),
        getNotificationsByPurpose(userId, "otpGeneration"),
      ]);

      const combinedNotifications = [
        ...(orderNotifications.notifications || []),
        ...(otpNotifications.notifications || []),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(combinedNotifications);
      setFilteredNotifications(combinedNotifications);

      const dates = [
        ...new Set(
          combinedNotifications.map(
            (notif) => new Date(notif.createdAt).toISOString().split("T")[0],
          ),
        ),
      ];
      setHighlightedDates(dates.map((date) => new Date(date)));
    } catch (err) {
      setError("Failed to fetch notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHelpNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNotificationsByPurpose(userId, "help");
      const helpNotifications = response.notifications || [];

      setNotifications(helpNotifications);
      setFilteredNotifications(helpNotifications);

      const dates = [
        ...new Set(
          helpNotifications.map(
            (notif) => new Date(notif.createdAt).toISOString().split("T")[0],
          ),
        ),
      ];
      setHighlightedDates(dates.map((date) => new Date(date)));
    } catch (err) {
      setError("Failed to fetch help notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotionsNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNotificationsByPurpose(userId, "package");
      const promotionsNotifications = response.notifications || [];

      setNotifications(promotionsNotifications);
      setFilteredNotifications(promotionsNotifications);

      const dates = [
        ...new Set(
          promotionsNotifications.map(
            (notif) => new Date(notif.createdAt).toISOString().split("T")[0],
          ),
        ),
      ];
      setHighlightedDates(dates.map((date) => new Date(date)));
    } catch (err) {
      setError(
        "Failed to fetch promotions notifications. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newTab) => {
    setSelectedTab(newTab);
    setSelectedDate(null);

    if (newTab === "help") {
      fetchHelpNotifications();
    } else if (newTab === "promotions") {
      fetchPromotionsNotifications();
    } else {
      fetchOrderAndOtpNotifications();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);

    if (date) {
      const selectedDateString = date.toISOString().split("T")[0];
      const filtered = notifications.filter((notif) => {
        const notificationDate = new Date(notif.createdAt)
          .toISOString()
          .split("T")[0];
        return notificationDate === selectedDateString;
      });
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications(notifications);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );
      setFilteredNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );
    } catch (err) {
      setError("Failed to delete the notification. Please try again.");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, status: "Seen" } : notif,
        ),
      );
      setFilteredNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, status: "Seen" } : notif,
        ),
      );
    } catch (err) {
      setError("Failed to mark the notification as read. Please try again.");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications(userId, "User");

      setNotifications([]);
      setFilteredNotifications([]);
      setHighlightedDates([]);
    } catch (err) {
      setError("Failed to clear notifications. Please try again.");
    }
  };

  useEffect(() => {
    if (userId) fetchOrderAndOtpNotifications();
    else setError("User ID is missing. Please log in again.");
  }, []);

  return (
    <Box
      sx={{
        padding: 2,
        minHeight: "95vh",
        backgroundColor: "transparent",
        position: "relative",
        borderRadius: "10px",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          marginBottom: 2,
          fontWeight: "bold",
          color: "#ff8c00",
        }}
      >
        Notifications
      </Typography>

      <Card
        sx={{
          marginBottom: 2,
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "10px",
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              sx={{ minWidth: 90 }}
            />
          ))}
        </Tabs>
      </Card>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          highlightDates={highlightedDates}
          className="custom-datepicker"
          placeholderText="Filter by date"
          style={{ flex: "1 1 auto", maxWidth: "calc(100% - 70px)" }}
        />
        <Button
          variant="contained"
          color="error"
          startIcon={<ClearAllIcon />}
          onClick={handleClearAll}
          sx={{ padding: "4px 8px", fontSize: "12px" }}
        >
          Clear All
        </Button>
      </Box>

      {loading ? (
        <Typography variant="body1" textAlign="center">
          Loading notifications...
        </Typography>
      ) : error ? (
        <Typography variant="body1" color="error" textAlign="center">
          {error}
        </Typography>
      ) : filteredNotifications.length > 0 ? (
        <Box
          sx={{
            maxHeight: "60vh",
            overflowY: "auto",
            padding: 1,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 1,
                marginBottom: 2,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ backgroundColor: "#ff8c00", marginRight: 2 }}>
                  {selectedTab === "help" ? (
                    <HelpIcon />
                  ) : selectedTab === "promotions" ? (
                    <LocalOfferIcon />
                  ) : (
                    <NotificationsIcon />
                  )}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {notification.body}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleMarkAsRead(notification._id)}
                      sx={{ padding: "4px" }}
                    >
                      <DoneIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(notification._id)}
                      sx={{ padding: "4px" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" textAlign="center">
          No data available for the selected date.
        </Typography>
      )}
    </Box>
  );
};

export default NotificationsPage;
