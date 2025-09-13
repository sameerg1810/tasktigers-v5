import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import "./Chat.css"; // Add styles as needed for any custom animations

const ProviderChat = ({ providerId }) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [providerDetails, setProviderDetails] = useState(null);

  const userId = sessionStorage.getItem("userId"); // Sender ID from sessionStorage

  // Fetch provider details if available
  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (providerId) {
        try {
          const response = await axios.get(`/api/providers/${providerId}`);
          setProviderDetails(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch provider details", error);
          setIsLoading(false);
        }
      }
    };

    fetchProviderDetails();
  }, [providerId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!providerId || !userId) return;

    socket.current = io("https://appsvc-apibackend-dev.azurewebsites.net", {
      transports: ["websocket"],
      upgrade: false,
    });

    socket.current.on("connect", () => {
      console.log("Socket connected");
      socket.current.emit("joinRoom", {
        senderId: userId,
        receiverId: providerId,
      });
    });

    socket.current.on("receiveMessage", (incomingMessage) => {
      if (
        (incomingMessage.senderId === providerId &&
          incomingMessage.receiverId === userId) ||
        (incomingMessage.senderId === userId &&
          incomingMessage.receiverId === providerId)
      ) {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    });

    return () => {
      socket.current.off("receiveMessage");
      socket.current.disconnect();
    };
  }, [providerId, userId]);

  // Fetch chat history between the user and provider
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `/api/chats?userId=${userId}&providerId=${providerId}`,
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (userId && providerId) {
      fetchChatHistory();
    }
  }, [userId, providerId]);

  // Sending new message to the server
  const sendMessage = () => {
    if (newMessage.trim() && socket.current) {
      const chatMessage = {
        senderId: userId,
        receiverId: providerId,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };

      socket.current.emit("sendMessage", chatMessage, (response) => {
        if (response.status === "ok") {
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
          setNewMessage("");
        } else {
          console.error("Failed to send message:", response.message);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, margin: "0 auto", mt: 5 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Chat with {providerDetails?.providerName || "Provider"}
        </Typography>

        {/* Chat messages */}
        <List sx={{ maxHeight: 300, overflow: "auto" }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  msg.senderId === userId ? "flex-end" : "flex-start",
              }}
            >
              <Avatar
                sx={{
                  backgroundColor:
                    msg.senderId === userId ? "primary.main" : "secondary.main",
                }}
              >
                {msg.senderId === userId
                  ? "You"
                  : providerDetails?.providerName[0]}
              </Avatar>
              <ListItemText
                primary={msg.message}
                secondary={new Date(msg.timestamp).toLocaleString()}
                sx={{
                  backgroundColor:
                    msg.senderId === userId
                      ? "primary.light"
                      : "secondary.light",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "70%",
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Input for new messages */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            sx={{ ml: 2 }}
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProviderChat;
