import React from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const  noInternetGif = `${IMAGE_BASE_URL}/internet.gif`
import "./NoInternet.css"; // Optional styling

const NoInternet = () => {
  return (
    <div className="no-internet">
      <img src={noInternetGif} alt="No Internet" />
      <h2>No Internet Connection</h2>
      <p>Please check your connection and try again.</p>
    </div>
  );
};

export default NoInternet;
