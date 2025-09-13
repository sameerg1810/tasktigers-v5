// utils.js
import moment from "moment";

// Generate a random color for each user or provider
export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Format the date based on "Today", "Yesterday", or a standard date format
export const formatDate = (date) => {
  const today = moment();
  const messageDate = moment(date);

  if (messageDate.isSame(today, "day")) {
    return "Today";
  } else if (messageDate.isSame(today.subtract(1, "day"), "day")) {
    return "Yesterday";
  } else {
    return messageDate.format("MMMM D, YYYY");
  }
};
