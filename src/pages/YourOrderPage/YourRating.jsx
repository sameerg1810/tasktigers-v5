import React, { useState } from "react";
import ReactStars from "react-rating-stars-component"; // Import the ReactStars component
import { Box, Typography } from "@mui/material";

const StarRating = () => {
  const [rating, setRating] = useState(0); // State to hold the current rating

  const handleRatingChange = (newRating) => {
    setRating(newRating); // Update the rating when stars are clicked
  };

  return (
    <Box sx={{ textAlign: "center", padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rate the Service 
      </Typography>
      <ReactStars
        count={5} // Total number of stars
        value={rating} // Current rating value
        onChange={handleRatingChange} // Callback when rating changes
        size={40} // Size of each star
        activeColor="#ffd700" // Active star color
        sx={{ border: '1px solid black' , display : 'flex' }}
      />
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        Current Rating: {rating}
      </Typography>
    </Box>
  );
};

export default StarRating;
