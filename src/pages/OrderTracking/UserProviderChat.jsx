import React, { useEffect, useRef, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { io } from "socket.io-client";
import {
  fetchProviderChatHistory,
  markMessageAsSeen,
} from "./api/notification-api";
import moment from "moment";
const  singleTickIcon = `${IMAGE_BASE_URL}/single-tick.png`;
const  doubleTickIcon = `${IMAGE_BASE_URL}/double-tick.png`;
import "./UserProviderChat.css";
const  SendPng = `${IMAGE_BASE_URL}/send.png`;
const UserProviderChat = ({ providerId, onCloseChat, workerDetails }) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!providerId || !userId) return; // If no providerId or userId, skip

    const loadChatHistory = async () => {
      const chatHistory = await fetchProviderChatHistory(userId, providerId);
      setMessages(chatHistory);

      chatHistory.forEach((msg) => {
        if (!msg.seen && msg.receiverId === userId) {
          markMessageAsSeen(msg._id);
        }
      });
    };

    loadChatHistory();
  }, [providerId, userId]);

  useEffect(() => {
    if (!providerId || !userId) return; // Skip socket setup if no chat is available

    socket.current = io("https://appsvc-apibackend-dev.azurewebsites.net", {
      transports: ["websocket"],
      upgrade: false,
    });

    socket.current.on("connect", () => console.log("Socket connected"));

    socket.current.on("receiveMessage", (incomingMessage) => {
      if (
        (incomingMessage.senderId === providerId &&
          incomingMessage.receiverId === userId) ||
        (incomingMessage.receiverId === providerId &&
          incomingMessage.senderId === userId)
      ) {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    });

    return () => {
      socket.current.off("receiveMessage");
      socket.current.disconnect();
    };
  }, [providerId, userId]);

  const sendMessage = () => {
    if (providerId && userId && newMessage.trim() && socket.current) {
      const chatMessage = {
        senderId: userId,
        receiverId: providerId,
        message: newMessage,
        senderType: "user",
        receiverType: "provider",
        timestamp: new Date().toISOString(),
      };

      socket.current.emit("sendMessage", chatMessage, (response) => {
        if (response.status !== "ok") {
          console.error("Failed to send message:", response.message);
        }
      });

      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <div className="chat-header-content">
          <img
            src={workerDetails?.image || "https://via.placeholder.com/50"}
            alt={workerDetails?.name || "Provider"}
            className="chat-header-image"
          />
          <div>
            <div className="chat-header-name">
              {workerDetails?.name || "Service Provider"}
            </div>
            <div className="chat-header-phone">
              {workerDetails?.phone || "N/A"}
            </div>
          </div>
        </div>
        <button
          className="chat-close-button"
          onClick={() => onCloseChat()} // Close chat via callback
        >
          ✖
        </button>
      </div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.senderId === userId ? "sent-message" : "received-message"
              }`}
            >
              <div className="message-bubble">
                <div className="message-content">{msg.message}</div>
                <div className="message-timestamp">
                  {moment(msg.timestamp).format("hh:mm A")}
                  {msg.senderId === userId && (
                    <img
                      src={msg.seen ? doubleTickIcon : singleTickIcon}
                      alt="Message Status Icon"
                      className="message-status-icon"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <img
          src={SendPng} // Replace with the correct path to your send.gif
          alt="Send"
          className={`chat-send-icon ${!newMessage.trim() ? "disabled" : ""}`}
          onClick={sendMessage}
          style={{
            cursor: !newMessage.trim() ? "not-allowed" : "pointer",
            opacity: !newMessage.trim() ? 0.6 : 1,
          }}
        />
      </div>
    </div>
  );
};

export default UserProviderChat;
