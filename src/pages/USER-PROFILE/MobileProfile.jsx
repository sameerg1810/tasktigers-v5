import React from "react";
import "./MobileProfile.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

const MobileProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavClick = (path) => {
    if (path === "logout") {
      logout();
      navigate("/login"); // Navigate to a login or home page after logout
    } else {
      navigate(`/${path}`); // Navigate to the selected route
    }
  };

  return (
    <div className="mobile-profile">
      {/* Mobile Navigation */}
      <ul className="mobile-nav">
        <li onClick={() => handleNavClick("userprofile")}>
          Account <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("addresses")}>
          My Addresses <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("bookings")}>
          My Bookings <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("packages")}>
          My Packages <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("coupons")}>
          My Coupons <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("notifications")}>
          My Notifications <FontAwesomeIcon icon={faAngleRight} />
        </li>
        <li onClick={() => handleNavClick("logout")}>
          Log Out <FontAwesomeIcon icon={faAngleRight} />
        </li>
      </ul>
    </div>
  );
};

export default MobileProfile;
