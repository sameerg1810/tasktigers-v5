import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import moment from "moment";
import SendIcon from "@mui/icons-material/Send";
import { useLocation } from "react-router-dom";
import { useHelp } from "../../context/HelpContext";

// Update this URL to your WebSocket server or API server URL
const baseUrl = "https://appsvc-apibackend-dev.azurewebsites.net";
const adminId = "6731ec1529290742dd3851de"; // Static admin ID
const avatarUrl = "https://i.pravatar.cc/150?img=3"; // User avatar
const adminAvatarUrl = "https://i.pravatar.cc/150?img=5"; // Admin avatar

const getMessageWidth = (length) => {
  if (length <= 10) return "8.5vw";
  if (length <= 30) return "13vw";
  if (length <= 50) return "20vw";
  return "30vw";
};

const FaqChat = () => {
  const socket = useRef(null);
  const messagesEndRef = useRef(null); // Reference for scrolling
  const { isChatToggle, setIsChatToggle } = useHelp();
  const { state } = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState(sessionStorage.getItem("userId"));
  const [isConnected, setIsConnected] = useState(false);
  const [faqmessages, setFaqMessages] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState(null);
  const [clickedQuestions, setClickedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state?.topic) {
      setIsLoading(true);

      const timerQuestions = setTimeout(() => {
        setCurrentQuestions(state.topic.questions);
        setIsLoading(false);
      }, 4000);

      const timer = setTimeout(() => {
        setFaqMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Hi! How can I assist you today?" },
        ]);
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer, timerQuestions);
    }
  }, [state]);

  const handleQuestionClick = (question, answer) => {
    setFaqMessages([...faqmessages, { sender: "user", text: question }]);

    setIsLoading(true);

    setTimeout(() => {
      setFaqMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: answer },
      ]);
      setIsLoading(false);
    }, 1000);

    setClickedQuestions([...clickedQuestions, question]);
  };

  useEffect(() => {
    console.log("Initializing socket connection...");
    socket.current = io(baseUrl, {
      transports: ["websocket"],
      upgrade: false,
    });

    socket.current.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");

      // Join the chat room
      socket.current.emit("joinRoom", {
        senderId: userId,
        receiverId: adminId,
      });
    });

    socket.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    // Listening for incoming messages
    socket.current.on("receiveMessage", (data) => {
      console.log("Received message from server:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: data.senderId,
          message: data.message,
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    });

    // Cleanup on component unmount
    return () => {
      console.log("Cleaning up socket connection...");
      socket.current.disconnect();
    };
  }, [userId, adminId]);

  // Function to send a message
  const handleSendMessage = () => {
    if (socket.current && message.trim()) {
      console.log("Sending message:", message);

      // Emit the message through socket
      socket.current.emit(
        "sendMessage",
        {
          senderId: userId, // Sender is the current user
          receiverId: adminId, // Receiver is always the admin
          message: message,
          senderType: "user",
          receiverType: "admin",
          timestamp: new Date().toISOString(),
        },
        (response) => {
          if (response.status === "ok") {
            console.log("Message sent successfully");
            setMessage(""); // Clear the input field
          } else {
            console.error("Failed to send message:", response.message);
          }
        },
      );
    }
  };

  // Fetch chat history from the server
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (userId && adminId) {
        try {
          console.log("Fetching chat history...");
          const response = await fetch(
            `${baseUrl}/chats?userId=${userId}&providerId=${adminId}`,
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };

    fetchChatHistory();
  }, [userId, adminId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, faqmessages]);

  return (
    <div style={{width:'90%', margin:'auto'}}>
      <Box sx={styles.container}>
        <Box sx={styles.miniContainer}>
          <Grid container alignItems="center">
            <Grid item>
              <Avatar src={adminAvatarUrl} />
            </Grid>
            <Grid item sx={{ ml: 2 }}>
              <Typography sx={styles.userName}>Chat with Agent</Typography>
              <Typography sx={styles.activeText}>
                {isConnected ? "online" : "offline"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Paper sx={styles.messageContainer} elevation={3}>
          <Typography variant="h6" align="center" gutterBottom>
            Support Chat with Agent
          </Typography>
          <List>
            {messages.length <= 0 &&
              faqmessages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.sender === "bot" && (
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: "#ffc107" }}>🤖</Avatar>
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={msg.text}
                    secondary={moment(msg.timestamp).format("hh:mm A")}
                    secondaryTypographyProps={{
                      sx: { textAlign: "right", fontSize: "9px", color: "grey" },
                    }}
                    sx={{
                      padding: "10px 15px",
                      borderRadius: "12px",
                      borderTopLeftRadius: msg.sender !== "user" ? 0 : "12px",
                      borderTopRightRadius: msg.sender === "user" ? 0 : "12px",
                      maxWidth: getMessageWidth(msg.text.length),
                      wordBreak: "break-word",
                      marginLeft: msg.sender !== "user" ? "10px" : "0px",
                      boxShadow: 1,
                    }}
                  />
                </ListItem>
              ))}
            {isLoading && (
              <ListItem sx={{ justifyContent: "flex-start" }}>
                <ListItemText>
                  <Typography
                    variant="body1"
                    sx={{ fontStyle: "italic", color: "#888" }}
                  >
                    Typing...
                  </Typography>
                </ListItemText>
              </ListItem>
            )}
          </List>
          {messages.length <= 0 && !isLoading && currentQuestions && (
            <>
              {" "}
              <Box sx={{ marginTop: "16px" }}>
                {currentQuestions
                  .filter((q) => !clickedQuestions.includes(q.question))
                  .map((q, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        cursor: "pointer",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                          padding: "10px 15px",
                          backgroundColor: "#bdfcff",
                          color: "black",
                          borderRadius: "12px",
                          wordBreak: "break-word",
                          marginLeft: "0px",
                          boxShadow: 1,
                        }}
                        onClick={() => handleQuestionClick(q.question, q.answer)}
                      >
                        {q.question}
                      </Button>
                    </ListItem>
                  ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={() => setIsChatToggle(true)}>
                  Chat With Agent
                </Button>
              </Box>
            </>
          )}
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent:
                    msg.senderId === userId ? "flex-end" : "flex-start",
                }}
              >
                <ListItemText
                  primary={msg.message}
                  secondary={moment(msg.timestamp).format("hh:mm A")}
                  secondaryTypographyProps={{
                    sx: { textAlign: "right", fontSize: "9px", color: "grey" },
                  }}
                  sx={{
                    padding: "10px 15px",
                    color: "black",
                    borderRadius: "12px",
                    borderTopLeftRadius: msg.senderId !== userId ? 0 : "12px",
                    borderTopRightRadius: msg.senderId === userId ? 0 : "12px",
                    maxWidth: {
                      lg: getMessageWidth(msg.message.length),
                      md: "20vw",
                      xs: "35vw",
                      sm: "23vw",
                    },
                    wordBreak: "break-word",
                    marginLeft: msg.senderId !== userId ? "10px" : "0px",
                    boxShadow: 1,
                  }}
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        <Paper>
          <Box sx={styles.TextFieldContainer}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={handleSendMessage}>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      </Box>
    </div>

  );
};

export default FaqChat;

const styles = {
  container: {
    maxWidth: "100%",
    padding: 0,
    backgroundColor: "#FAFAFA",
    borderRadius: "12px",
    boxShadow: 3,
    overflow: "hidden",
    marginTop: 3,
    marginBottom: 3,
  },
  miniContainer: {
    backgroundColor: "#000",
    padding: 2,
    borderRadius: "12px 12px 0 0",
  },
  messageContainer: {
    height: "600px",
    overflowY: "auto",
    padding: 1,
    backgroundColor: "#FFF",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    borderRadius: "0px",
  },
  userName: { color: "#FFF", fontWeight: "bold" },
  activeText: { color: "green", fontSize: "12px" },
  TextFieldContainer: {
    display: "flex",
    alignItems: "center",
    padding: 1,
    backgroundColor: "#FFF",
  },
};
