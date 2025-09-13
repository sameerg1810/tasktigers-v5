export const postNotification = async (notification, userId) => {
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

  try {
    const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, notification }), // Sending userId and notification
    });

    if (!response.ok) {
      console.error("Failed to post notification:", response.statusText);
    } else {
      const data = await response.json();
      console.log("Notification posted successfully:", data);
      return data; // Return the created notification for confirmation if needed
    }
  } catch (error) {
    console.error("Error posting notification:", error);
  }
};

export const getNotifications = async (userId) => {
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

  try {
    const response = await fetch(
      `${AZURE_BASE_URL}/v1.0/users/notifications/${userId}`,
    ); // Pass userId as a path parameter
    if (!response.ok) {
      console.error("Failed to fetch notifications:", response.statusText);
      return [];
    }

    const notifications = await response.json();
    console.log(`Fetched notifications for user ${userId}:`, notifications);
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const deleteNotification = async (notificationId) => {
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

  try {
    const response = await fetch(
      `${AZURE_BASE_URL}/v1.0/users/notifications/${notificationId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      console.error("Failed to delete notification:", response.statusText);
    } else {
      console.log(
        `Notification with ID ${notificationId} deleted successfully`,
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

export const deleteAllNotificationsForUser = async (userId) => {
  const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

  try {
    const response = await fetch(
      `${AZURE_BASE_URL}/v1.0/users/notifications/user/${userId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      console.error("Failed to delete all notifications:", response.statusText);
    } else {
      console.log(`All notifications for user ${userId} deleted successfully`);
    }
  } catch (error) {
    console.error("Error deleting all notifications:", error);
  }
};
