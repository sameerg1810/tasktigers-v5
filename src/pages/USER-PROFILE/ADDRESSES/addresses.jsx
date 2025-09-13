import React, { useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useNavigate } from "react-router-dom";
import "./addresses.css";
const rightarrow = `${IMAGE_BASE_URL}/right-arrow.svg`;
import Userprofileaddressform from "./userprofileaddressform";

const Addresses = () => {
  const navigate = useNavigate();
  const [userId, setStoredUserId] = useState(null);
  const [addressData, setAddressesData] = useState([]);
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);

  const handleAddAddressClick = () => {
    navigate("/cart");
  };



  const handleDeleteAddressClick = async (addressId) => {
    console.log("Delete address with ID:", addressId);
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
        const response = await fetch(`${AZURE_BASE_URL}/v1.0/users/user-address/${addressId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setAddressesData((prevData) =>
            prevData.filter((address) => address._id !== addressId)
          );
          console.log("Address deleted successfully");
        } else {
          console.error("Failed to delete address:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    setStoredUserId(storedUserId);
  }, []);

  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    if (userId) {
      const fetchAddresses = async (uid) => {
        try {
          const response = await fetch(
            `${AZURE_BASE_URL}/v1.0/users/user-address/${uid}`
          );
          if (response.ok) {
            const data = await response.json();
            setAddressesData(data);
          } else {
            console.error(
              "Failed to fetch addresses:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      };

      fetchAddresses(userId);
    }
  }, [userId]);

  return (
    <div className="addresses-page">

      <div className="address-content">
        <div
          className="add-address"
          onClick={handleAddAddressClick}
          style={{ cursor: "pointer" }}
        >
          + Add Address
         
        </div>
        <h2 className="add-head">Saved Addresses</h2>
        <div className="addresses-main-con">
          {addressData.length > 0 ? (
            addressData.map((address) => (
              <div key={address._id} className="addresses-sub-con">
                <h1>
                  {`${address.address}, ${address.landmark}, ${address.city}, ${address.pincode}`}
                </h1>
                <div className="address-buttons">
                
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteAddressClick(address._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No addresses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Addresses;
