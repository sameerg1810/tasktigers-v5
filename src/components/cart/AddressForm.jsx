import React, { useState, useEffect } from "react";
import './AddressForm.css'
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook


const AddressForm = ({ addressData, setAddressData, handleSaveAddress }) => {
  const [errors, setErrors] = useState({});
  const { user } = useAuth(); // Access the user context

  // Autofill the mobile number if not already provided
  useEffect(() => {
    if (!addressData.mobileNumber && user && user.phone) {
      setAddressData((prevState) => ({
        ...prevState,
        mobileNumber: user.phone, // Autofill the mobile number from AuthContext
      }));
    }
  }, [user, addressData.mobileNumber, setAddressData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateFields = () => {
    let newErrors = {};

    if (!String(addressData.name || "").trim())
      newErrors.name = "Name is required";
    if (!String(addressData.mobileNumber || "").trim())
      newErrors.mobileNumber = "Mobile number is required";
    if (!String(addressData.address || "").trim())
      newErrors.address = "Address is required";
    if (!String(addressData.city || "").trim())
      newErrors.city = "City is required";
    if (!String(addressData.pincode || "").trim())
      newErrors.pincode = "Pincode is required";
    if (!String(addressData.state || "").trim())
      newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateFields()) {
      handleSaveAddress(addressData);
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  // Function to clear all input fields
  const handleClear = () => {
    setAddressData({
      name: "",
      mobileNumber: "",
      address: "",
      city: "",
      landmark: "",
      pincode: "",
      state: "",
      bookingType: "self", // You can set default booking type if needed
    });
    setErrors({}); // Clear errors when resetting the form
  };

  return (
    <div className="address-form">
      {/* <div className="address-radio-group">
        <p>Contact:</p>
        <label>
          <input
            type="radio"
            name="bookingType"
            value="self"
            checked={addressData.bookingType === "self"}
            onChange={handleChange}
            aria-label="Booking for myself"
          />
          <h4>My Self</h4>
        </label>
        <label>
          <input
            type="radio"
            name="bookingType"
            value="others"
            checked={addressData.bookingType === "others"}
            onChange={handleChange}
            aria-label="Booking for others"
          />
          <h4>Booking for Others</h4>
        </label>
      </div> */}
      <div className="form-row">
        <input
          type="text"
          name="name"
          placeholder={`Name (${addressData.name || "Mr/Mrs"})`}
          value={addressData.name}
          onChange={handleChange}
          title={errors.name}
          aria-label="Name"
          className={errors.name ? "input-error" : ""}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
        <input
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number (e.g., +1 234 567 890)"
          value={addressData.mobileNumber || ""} // Autofilled value
          onChange={handleChange}
          title={errors.mobileNumber}
          aria-label="Mobile Number"
          className={errors.mobileNumber ? "input-error" : ""}
        />
        {errors.mobileNumber && (
          <span className="error-message">{errors.mobileNumber}</span>
        )}
      </div>
      <div className="form-row">
        <input
          type="text"
          name="address"
          className={`full-width ${errors.address ? "input-error" : ""}`}
          placeholder="Address (House#, Street)"
          value={addressData.address}
          onChange={handleChange}
          title={errors.address}
          aria-label="Address"
        />
        {errors.address && (
          <span className="error-message">{errors.address}</span>
        )}
      </div>
      <div className="form-row">
        <input
          type="text"
          name="city"
          placeholder="City (e.g., Los Angeles)"
          value={addressData.city}
          onChange={handleChange}
          title={errors.city}
          aria-label="City"
          className={errors.city ? "input-error" : ""}
        />
        {errors.city && <span className="error-message">{errors.city}</span>}
        <input
          type="text"
          name="landmark"
          placeholder="Landmark (Optional)"
          value={addressData.landmark || ""}
          onChange={handleChange}
          aria-label="Landmark"
        />
      </div>
      <div className="form-row">
        <input
          type="text"
          name="pincode"
          placeholder="Pincode (e.g., 90001)"
          value={addressData.pincode}
          onChange={handleChange}
          title={errors.pincode}
          aria-label="Pincode"
          className={errors.pincode ? "input-error" : ""}
        />
        {errors.pincode && (
          <span className="error-message">{errors.pincode}</span>
        )}
        <input
          type="text"
          name="state"
          placeholder="State (e.g., California)"
          value={addressData.state}
          onChange={handleChange}
          title={errors.state}
          aria-label="State"
          className={errors.state ? "input-error" : ""}
        />
        {errors.state && <span className="error-message">{errors.state}</span>}
      </div>
      <div className="address-button-group">
        <button
          className="save-address-btn"
          onClick={handleSave}
          aria-label="Save Address"
        >
          <FontAwesomeIcon icon={faSave} /> <span>SAVE ADDRESS</span>
        </button>
        <button
          className="clear-address-btn"
          onClick={handleClear}
          aria-label="Clear All Fields"
        >
          <FontAwesomeIcon icon={faTimes} /> <span>CLEAR</span>
        </button>
      </div>
    </div>
  );
};

// PropTypes for validation of component props
AddressForm.propTypes = {
  addressData: PropTypes.shape({
    name: PropTypes.string,
    mobileNumber: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    landmark: PropTypes.string,
    pincode: PropTypes.string,
    state: PropTypes.string,
    bookingType: PropTypes.string,
  }).isRequired,
  setAddressData: PropTypes.func.isRequired,
  handleSaveAddress: PropTypes.func.isRequired,
};

export default AddressForm;
