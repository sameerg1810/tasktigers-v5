import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { messaging } from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { confirmAlert } from "react-confirm-alert";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";
import "react-confirm-alert/src/react-confirm-alert.css";

const MessagingContext = createContext();

export const useMessaging = () => useContext(MessagingContext);

export const MessagingProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const { userId } = useAuth();
  const messageRef = useRef(null);
  const messageQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  // Request notification permission and retrieve FCM token
  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        try {
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });
          if (currentToken) {
            setToken(currentToken);
            if (userId) {
              await sendTokenToServer(currentToken, userId); // Send to server after user login
            }
          } else {
            console.log("No registration token available.");
          }
        } catch (error) {
          console.error("Error retrieving token:", error);
        }
      }
      // } else {
      //   confirmAlert({
      //     title: "Notifications Blocked",
      //     message:
      //       "Please enable notifications in your browser settings to receive updates.",
      //     buttons: [{ label: "OK", onClick: () => {} }],
      //   });
      // }
    };

    requestPermission();
  }, [userId]); // Re-run when userId changes

  useEffect(() => {
    if (token && userId) {
      sendTokenToServer(token, userId);
    }
  }, [token, userId]);

  const sendTokenToServer = async (token, userId) => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    console.log("Sending FCM token to server:", token, "for user:", userId);

    try {
      const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/user-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, userId }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(
          "FCM token successfully sent to the server. Response:",
          responseData,
        );
        console.log("FCM token successfully sent to the server.");
      } else {
        const errorData = await response.json();
        console.error("Failed to store FCM token. Response:", errorData);
        console.log("Failed to send FCM token to server.");
      }
    } catch (error) {
      console.error("Error sending FCM token to server:", error);
      console.log("Error sending FCM token to server.");
    }
  };

  // Message queue processing for incoming messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Received push notification:", payload); // Log each notification payload
      messageQueue.current.push(payload);
      processMessageQueue();
    });

    return () => unsubscribe();
  }, []);

  const processMessageQueue = () => {
    if (isProcessingQueue.current) return;
    isProcessingQueue.current = true;

    const processNextMessage = () => {
      if (messageQueue.current.length === 0) {
        isProcessingQueue.current = false;
        return;
      }

      const payload = messageQueue.current.shift();
      console.log("Processing notification:", payload); // Log each processed message
      messageRef.current = payload;

      // Show alert with notification details
      confirmAlert({
        title: payload.notification?.title || "New Notification",
        message: `${payload.notification?.body || ""}\n\nOrder ID: ${
          payload.data?.orderId || "N/A"
        }`,
        buttons: [{ label: "OK", onClick: () => {} }],
      });

      // Add delay between messages
      setTimeout(processNextMessage, 5000);
    };

    processNextMessage();
  };

  console.log("MessagingContext provider initialized with token:", token);

  return (
    <MessagingContext.Provider
      value={{ token, sendNotification: processMessageQueue, messageRef }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

MessagingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
