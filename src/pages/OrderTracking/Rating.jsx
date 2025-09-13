import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import ReactStars from "react-rating-stars-component"; // A star rating component

const Rating = ({ isOpen = false, handleClose, handleSubmit }) => {
  const [rating, setRating] = useState(0); // Rating state
  const [feedback, setFeedback] = useState(""); // Feedback state
  const [error, setError] = useState(""); // Error state for feedback validation

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const validateAndSubmit = () => {
    if (feedback.trim().length < 10) {
      setError("Feedback must be at least 10 characters.");
      return;
    }
    setError("");
    handleSubmit(rating, feedback.trim()); // Call the submit handler with rating and feedback
    handleClose(); // Close the dialog
    setRating(0); // Reset rating
    setFeedback(""); // Reset feedback
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Rate the Service</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>How would you rate the service?</Typography>
        <Box
          sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}
        >
          <ReactStars
            count={5}
            onChange={handleRatingChange}
            size={40}
            activeColor="#ffd700" // Gold color for active stars
          />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Leave a feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={validateAndSubmit}
          color="primary"
          disabled={rating === 0}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Rating;
