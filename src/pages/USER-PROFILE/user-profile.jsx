import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  IconButton,
  Grid,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    displayName: "",
    image: "",
    gender: "",
    dateOfBirth: "",
    city: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const storedUserId = sessionStorage.getItem("userId");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setUserId(storedUserId);
  }, [storedUserId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(
          `${AZURE_BASE_URL}/v1.0/users/userAuth/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setFormData({
            email: data.email || "",
            name: data.name || "",
            displayName: data.displayName || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            city: data.city || "",
            image: data.image || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (userId) fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "image" && files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key === "image" && value instanceof File) {
        console.log(value,"value")
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, value);
      }
    }

    try {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/userAuth/${userId}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setFormData((prevData) => ({ ...prevData, ...updatedData }));
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Error updating profile");
      }
    } catch (error) {
      toast.error("Error:", error.message);
    }
  };

  const toggleEditMode = () => setIsEditing(!isEditing);

  return (
    <Box display="flex">
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Toaster />
        <Typography variant="h4" align="center" gutterBottom>
          User Profile
        </Typography>

        <Grid container justifyContent="center" spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} display="flex" flexDirection="column" alignItems="center">
            {/* Profile Image with Edit Icon */}
            <Box
              sx={{
                position: "relative",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box
                component="img"
                src={formData.image || "default-image-url.jpg"}
                alt="User Profile"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Edit Icon */}
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: "2px",
                    right: "30px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                    },
                  }}
                >
                  <EditOutlinedIcon />
                  <input
                    accept="image/*"
                    id="file-upload"
                    type="file"
                    name="image"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isEditing}>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Select your date of birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Enter your city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              {!isEditing && (
                <Button
                  type="button"
                  onClick={toggleEditMode}
                  variant="outlined"
                  sx={{
                    mr: 2,
                    backgroundColor: "black",
                    border: "none",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#e68a33",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    type="button"
                    onClick={toggleEditMode}
                    variant="outlined"
                    sx={{
                      mr: 2,
                      backgroundColor: "black",
                      border: "none",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#e63939",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: "black",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#218838",
                      },
                    }}
                  >
                    Save Profile
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default UserProfile;
