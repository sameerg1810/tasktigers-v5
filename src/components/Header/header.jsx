import React, { useState, useEffect, useContext, useCallback } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CartContext, CartProvider } from "../../context/CartContext";
import { useHelp } from "../../context/HelpContext";
import LocationSearch from "./LocationSearch";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
const profile = `${IMAGE_BASE_URL}/profile-icon.png`;
const logo = `${IMAGE_BASE_URL}/new-logo.png`;
import LoginComponent from "../LoginComponent";
import "./header.css";

const serviceNames = ["cleaning", "plumbing", "locksmith"]; // Service names

const Header = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userCity, logout } = useAuth();
  const { totalItems } = useContext(CartContext);

  // State

  const [isLoginVisible, setLoginVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update locationQuery when userCity changes

  useEffect(() => {
    console.log("isAuthenticated state:", isAuthenticated);
  }, [isAuthenticated]);

  // Rotate service names every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % serviceNames.length);
    }, 2000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  // Handle Profile Click
  const handleProfileClick = useCallback(() => {
    if (isAuthenticated === false) {
      setLoginVisible(true); // Show login modal
    } else if (isAuthenticated === true) {
      navigate("/profile"); // Redirect to profile if authenticated
    }
  }, [isAuthenticated, navigate]);

  // Handle Cart Click
  const handleCartClick = useCallback(() => {
    if (isAuthenticated === false) {
      setLoginVisible(true); // Show login modal
    } else if (isAuthenticated === true) {
      navigate("/cart"); // Redirect to cart if authenticated
    }
  }, [isAuthenticated, navigate]);

  return (
    <CartProvider>
      <div className="new-main-h">
        {/* Logo */}
        <div className="new-h-logo">
          <img src={logo} alt="logo" onClick={() => navigate("/")} />
        </div>

        {/* Location Search */}
        <div className="new-location">
          <LocationSearch />
        </div>

        {/* Service Search */}
        <div className="new-service">
          <div
            className="new-search-header"
            onClick={() => navigate("/service-search")}
          >
            <SearchOutlinedIcon sx={{ color: "white", fontSize: "20px" }} />
            <p className="search-text">
              Search for a "{serviceNames[currentIndex]}"
            </p>
          </div>
        </div>

        {/* Profile and Cart Icons */}
        <div className="profile-cart-icons">
          {/* Cart Icon */}
          <div className="cart-icon-main" onClick={handleCartClick}>
            <div className="total-items">
              <p className="badge-text">{totalItems}</p>
            </div>

            <ShoppingCartOutlinedIcon
              sx={{ color: "white", fontSize: "35px" }}
            />
          </div>

          {/* Profile Icon */}
          <div>
            <img
              src={profile}
              onClick={handleProfileClick}
              className="profile-icon"
              alt="Profile"
            />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {isLoginVisible && (
        <div className="modalOverlay" onClick={() => setLoginVisible(false)} style={{ backgroundImage: `url(${IMAGE_BASE_URL})/internet.gif` }}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setLoginVisible(false)}
            >
              &times;
            </button>
            <LoginComponent onLoginSuccess={() => setLoginVisible(false)} />
          </div>
        </div>
      )}

      {/* Child Components */}
      {children}
    </CartProvider>
  );
};

export default Header;
