import React, { useEffect, useState } from "react";
import { useMessaging } from "../context/MessagingContext";

const WorkerComponent = () => {
  const { messageRef } = useMessaging(); // Access messageRef from MessagingContext
  const [message, setMessage] = useState(null); // Local state for the current message

  // Update message when messageRef changes
  useEffect(() => {
    if (messageRef.current) {
      setMessage(messageRef.current);
      console.log(
        "New message received in WorkerComponent:",
        messageRef.current,
      );
    }
  }, [messageRef.current]);

  // Parse providerDetails safely
  const providerDetails = message?.data?.providerDetails
    ? JSON.parse(message.data.providerDetails)
    : {};

  if (!message) {
    return <div>No notifications available.</div>;
  }

  return (
    <div>
      <h2>{message.notification?.title || "Notification"}</h2>
      <p>{message.notification?.body || "No details available."}</p>
      <div>
        <strong>Order ID:</strong> {message.data?.orderId || "N/A"}
      </div>
      <div>
        <strong>Provider Name:</strong> {providerDetails.name || "N/A"}
      </div>
      <div>
        <strong>Provider Phone:</strong> {providerDetails.phone || "N/A"}
      </div>
      <div>
        <strong>OTP:</strong> {message.data?.otp || "N/A"}
      </div>
    </div>
  );
};

export default WorkerComponent;
