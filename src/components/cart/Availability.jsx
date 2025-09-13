import React from "react";
import PropTypes from "prop-types";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "./Availability.css";
const noProvider =  `${IMAGE_BASE_URL}/Nothing.gif`;
const Availability = ({ message, onClose }) => (
  <div className="availability-overlay">
    <div className="availability-content">
      <img src={noProvider} alt="Error" className="availability-gif" />
      <p className="availability-message">{message}</p>
      <button onClick={onClose} className="availability-button">
        OK
      </button>
    </div>
  </div>
);

Availability.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Availability;
