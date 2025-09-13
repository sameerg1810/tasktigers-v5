import axios from "axios";

// Base URL from the environment variable
const BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

// API to fetch notifications by purpose
export const getNotificationsByPurpose = async (userId, purpose) => {
  try {
    console.log(
      `Fetching notifications for userId: ${userId}, purpose: ${purpose}`,
    );
    const url = `${BASE_URL}/v1.0/core/notify/notificationhistory/purpose/${purpose}/recipient/${userId}`;
    console.log(`Request URL: ${url}`);
    const response = await axios.get(url);
    console.log("Notifications fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    throw new Error("Failed to fetch notifications. Please try again later.");
  }
};

// API to delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    console.log(`Deleting notification with ID: ${notificationId}`);
    const url = `${BASE_URL}/v1.0/core/notify/notificationhistory/${notificationId}`;
    console.log(`Request URL: ${url}`);
    const response = await axios.delete(url);
    console.log("Notification deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    throw new Error("Failed to delete the notification. Please try again.");
  }
};

// Function to clear all notifications for a user
export const clearAllNotifications = async (recipientId, recipientType) => {
  try {
    console.log(
      `Clearing all notifications for recipientId: ${recipientId}, recipientType: ${recipientType}`,
    );
    const url = `${BASE_URL}/v1.0/core/notify/notificationhistory/${recipientId}/${recipientType}`;
    console.log(`Request URL: ${url}`);
    const response = await axios.delete(url);
    console.log("All notifications cleared successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing all notifications:", error.message);
    throw new Error("Failed to clear all notifications. Please try again.");
  }
};

// Function to mark a notification as seen
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log(`Marking notification with ID: ${notificationId} as seen`);
    const url = `${BASE_URL}/v1.0/core/notify/notificationhistory/${notificationId}/read`;
    console.log(`Request URL: ${url}`);
    const response = await axios.patch(url);
    console.log("Notification marked as seen successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as seen:", error.message);
    throw new Error(
      "Failed to mark the notification as seen. Please try again.",
    );
  }
};
