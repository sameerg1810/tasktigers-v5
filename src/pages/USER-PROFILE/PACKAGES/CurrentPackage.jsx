import React, { useEffect, useState, useRef } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CurrentPackage.css";
import { useAuth } from "../../../context/AuthContext";
const errorGif = `${IMAGE_BASE_URL}/Down Arrow.gif`;
const hurrayGif = `${IMAGE_BASE_URL}/hurray.gif`;
const emptyBoxGif = `${IMAGE_BASE_URL}/Empty box.gif`; 

const CurrentPackage = ({ userId, newPurchase, setNewPurchase }) => {
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHurrayGif, setShowHurrayGif] = useState(false);
  const { setHasMembership } = useAuth();
  const toastDisplayedRef = useRef(false);

  const fetchUserPackage = async () => {
    if (!userId) return;
    setLoading(true);
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/user-packages/${userId}`,
      );
      const data = await response.json();

      // console.log("API Response:", data); // Log API response for debugging

      if (response.ok) {
        if (Array.isArray(data) && data.length > 0) {
          setCurrentPackage(data[0]);
          setHasMembership(new Date(data[0].expiryDate) > new Date());
        } else if (data && typeof data === "object" && data._id) {
          setCurrentPackage(data);
          setHasMembership(new Date(data.expiryDate) > new Date());
        } else {
          setCurrentPackage(null);
          setHasMembership(false);
        }
      } else {
        handleErrorToast(); // Show toast if the response isn't OK
      }
    } catch (err) {
      console.error("Fetch error:", err); // Log fetch errors
      handleErrorToast(); // Show toast on fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPackage(); // Initial fetch when component mounts
  }, [userId, setHasMembership]);

  // Show the hurray GIF when a new package is purchased
  useEffect(() => {
    if (newPurchase) {
      setShowHurrayGif(true);
      setTimeout(() => {
        setShowHurrayGif(false);
        setNewPurchase(false); // Reset newPurchase to prevent re-triggering
        fetchUserPackage(); // Refresh the package data after hurray gif plays
      }, 3000);
    }
  }, [newPurchase, setNewPurchase]);

  const handleErrorToast = () => {
    if (!toastDisplayedRef.current) {
      toastDisplayedRef.current = true;
      toast.error(
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={errorGif}
            alt="Error"
            style={{ width: "30px", height: "30px", marginRight: "10px" }}
          />
          <span>Failed to fetch current package. Please try again later.</span>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          style: {
            backgroundColor: "#fffbcc",
            color: "#333",
          },
        },
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading current package...</p>
      </div>
    );
  }

  const isExpired = currentPackage
    ? new Date(currentPackage.expiryDate) <= new Date()
    : true;

  return (
    <div className="current-package-container">
      {showHurrayGif ? (
        // Display hurray GIF when `showHurrayGif` is true
        <div className="hurray-gif-container">
          <img src={hurrayGif} alt="Hurray!" style={{ width: "150px" }} />
        </div>
      ) : currentPackage ? (
        // Display current package details when `showHurrayGif` is false
        <div className="package-card">
          <h3 className="package-title">Your Current Package</h3>
          <div className="package-content">
            <p>
              <strong>Package Name:</strong> {currentPackage.packageName}
            </p>
            <p>
              <strong>Validity (in days):</strong> {currentPackage.validity}
            </p>
            <p>
              <strong>Price:</strong> ₹{currentPackage.priceRs}
            </p>
            <p>
              <strong>Discount:</strong> {currentPackage.discount}%
            </p>
            <p>
              <strong>Description:</strong> {currentPackage.description}
            </p>
            <p>
              <strong>Expiry Date:</strong>{" "}
              {new Date(currentPackage.expiryDate).toLocaleDateString()}
            </p>
            
          </div>
        </div>
      ) : (
        // Display Empty Box GIF when there is no active package
        <div className="no-package">
          <img
            src={emptyBoxGif}
            alt="No Active Package"
            style={{ width: "150px", marginBottom: "10px" }}
          />
          <h3>No active package</h3>
          <p>Purchase a package to enjoy the benefits!</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default CurrentPackage;
