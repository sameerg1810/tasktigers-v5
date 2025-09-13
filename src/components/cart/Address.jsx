import React, { useState, useEffect, useContext } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faArrowLeft,
  faSave,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Address.css";
import { useAuth } from "../../context/AuthContext";
import {
  saveAddress,
  getSavedAddresses,
  deleteAddress,
} from "./api/address-api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddressForm from "./AddressForm";
import LocationModal from "./LocationModal";
import { CartContext } from "../../context/CartContext";
import { OrdersContext } from "../../context/OrdersContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
const DeleteIcon = `${IMAGE_BASE_URL}/Delete.png`;

const Address = ({ onNext }) => {
  const { phone } = useAuth();
  const { totalItems, totalPrice, handleLocationUpdate,basicTotalPrice,discountValue,afterDiscountPrice } =
    useContext(CartContext);
  const { updateSelectedAddressId } = useContext(OrdersContext);
  const [cookies] = useCookies(["location"]);
  const initialLocation = cookies.location || {};

  const userId = sessionStorage.getItem("userId") || "";
  const [addressData, setAddressData] = useState({
    bookingType: "self",
    name: "",
    mobileNumber: phone || sessionStorage.getItem("phone") || "",
    address: "",
    city: initialLocation.city || "Hyderabad",
    pincode: initialLocation.pincode || "500072",
    landmark: initialLocation.landmark || "Medchal-Malkajgiri",
    state: initialLocation.state || "Telangana",
    latitude: Number(initialLocation.latitude) || 0,
    longitude: Number(initialLocation.longitude) || 0,
    userId: userId,
  });

  const [showForm, setShowForm] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [filterBookingType, setFilterBookingType] = useState("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Fetch saved addresses for the user and handle initial selection with delay
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (userId) {
        try {
          const addresses = await getSavedAddresses(userId);
          setSavedAddresses(addresses || []);
          if (addresses.length === 1) {
            setSelectedAddress(addresses[0]);
            // Add delay before showing confirmation alert
            setTimeout(() => askConfirmation(addresses[0]), 1000); // 1-second delay
          }
        } catch (error) {
          toast.error("Error fetching saved addresses.");
        }
      }
    };
    fetchSavedAddresses();
  }, [userId]);

  // Display confirmation alert to the user on initial load if there's only one address
  // Display confirmation alert to the user on initial load if there's only one address
  const askConfirmation = (address) => {
    const addressDetails = `
    ${address.username}, ${address.mobileNumber}, ${address.address},
    ${address.city}, ${address.pincode}, ${address.landmark}, ${address.state}
  `;

    confirmAlert({
      title: "Confirm Address",
      message: `Your current address is:\n\n${addressDetails}\n\nYou can proceed with this address or add a new one.`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setSelectedAddress(address); // Keep checkbox selected
          },
        },
        {
          label: "No",
          onClick: () => {
            setSelectedAddress(null); // Deselect checkbox for adding a new address
          },
        },
      ],
    });
  };

  // Handle checkbox change when there's only one address
  const handleCheckboxChange = (address) => {
    if (savedAddresses.length > 1) {
      setSelectedAddress(address);
    }
  };

  // Handle radio button change for selecting an address
  const handleRadioChange = (address) => {
    setSelectedAddress(address);
  };

  // Handle save address
  const handleSaveAddress = async (addressData) => {
    try {
      const requestBody = {
        ...addressData,
        username: addressData.name,
        latitude: Number(addressData.latitude),
        longitude: Number(addressData.longitude),
        userId: userId,
      };
      delete requestBody.name;

      await saveAddress(requestBody);
      const addresses = await getSavedAddresses(userId);
      setSavedAddresses(addresses);
      setShowForm(false);
      setShowSavedAddresses(true);
      setIsAddingNewAddress(false);
      if (addresses.length === 1) {
        setSelectedAddress(addresses[0]);
      }
      toast.success("Address saved successfully.");
    } catch (error) {
      toast.error("Error saving address.");
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedAddress) {
      toast.error("Please select an address before proceeding.");
      return;
    }

    confirmAlert({
      title: "Confirm Address",
      message: "Do you want to proceed with this address?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            handleLocationUpdate(
              selectedAddress.latitude,
              selectedAddress.longitude,
              selectedAddress.pincode,
            );
            updateSelectedAddressId(selectedAddress._id);
            toast.success("Location, address, and pincode confirmed.");
            onNext("schedule");
          },
        },
        {
          label: "No",
          onClick: () => console.log("Address confirmation declined."),
        },
      ],
    });
  };

  // Handle location selection from LocationModal
  const handleLocationSelect = (location) => {
    const parsedAddress = parseAddress(location.address);

    setAddressData((prevData) => ({
      ...prevData,
      address: parsedAddress.address,
      city: parsedAddress.city,
      pincode: parsedAddress.pincode,
      landmark: parsedAddress.landmark,
      state: parsedAddress.state,
      latitude: location.latitude,
      longitude: location.longitude,
      userId: userId,
    }));
    setShowLocationModal(false);
    setShowForm(true);
    setShowSavedAddresses(false);
  };

  // Parse address string into components
  const parseAddress = (fullAddress) => {
    const pincodeRegex = /\b\d{6}\b/;
    const pincodeMatch = fullAddress.match(pincodeRegex);
    const pincode = pincodeMatch ? pincodeMatch[0] : "";
    let addressWithoutPincode = fullAddress.replace(pincode, "").trim();
    const parts = addressWithoutPincode.split(",").map((part) => part.trim());

    const address = parts.slice(0, 2).join(", ");
    const city = parts.length > 2 ? parts[parts.length - 3] : "";
    const landmark = parts.length > 3 ? parts[parts.length - 4] : "";
    const state = parts.length > 1 ? parts[parts.length - 2] : "";

    return {
      address,
      city,
      pincode,
      landmark,
      state,
    };
  };

  // Toggle between adding new address and viewing saved addresses
  const handleAddNewAddressClick = () => {
    if (isAddingNewAddress) {
      setShowLocationModal(false);
      setShowForm(false);
      setShowSavedAddresses(true);
      setIsAddingNewAddress(false);
    } else {
      setShowLocationModal(true);
      setShowForm(false);
      setShowSavedAddresses(false);
      setIsAddingNewAddress(true);
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
      const addresses = await getSavedAddresses(userId);
      setSavedAddresses(addresses);
      toast.success("Address deleted successfully.");
    } catch (error) {
      toast.error("Error deleting address.");
    }
  };

  const filteredAddresses = filterBookingType
    ? savedAddresses.filter(
        (address) => address.bookingType === filterBookingType,
      )
    : savedAddresses;

  return (
    <div className="cart-address-main-con">
      <div className="address-container">
        <ToastContainer />
        <div className="add-new-address" onClick={handleAddNewAddressClick}>
          <FontAwesomeIcon icon={isAddingNewAddress ? faArrowLeft : faAdd} />
          <span>
            {isAddingNewAddress ? "Saved Addresses" : "Add New Address"}
          </span>
        </div>
        {showSavedAddresses && (
          <div className="toggle-saved-addresses-container">
            <div className="saved-addresses-title">
              <span>Saved Addresses</span>
            </div>
            {/* <div className="booking-type-filter">
              <div className="select-wrapper">
                <select
                  id="filterBookingType"
                  value={filterBookingType}
                  onChange={(e) => setFilterBookingType(e.target.value)}
                  className="filter-container"
                >
                  <option value="self">My Self</option>
                  <option value="others">Others</option>
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
              </div>
            </div> */}
          </div>
        )}
        {showSavedAddresses && (
          <div className="saved-addresses-container">
            {filteredAddresses.length > 0 ? (
              filteredAddresses.map((address, index) => (
                <div key={index} className="saved-address">
                  {filteredAddresses.length === 1 ? (
                    <input
                      type="checkbox"
                      checked={selectedAddress?._id === address._id}
                      onChange={() => handleCheckboxChange(address)}
                      className="address-checkbox"
                    />
                  ) : (
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddress?._id === address._id}
                      onChange={() => handleRadioChange(address)}
                      className="address-radio"
                    />
                  )}
                   <div className="saved-address-content">
                    <p>
                      {/* <strong>Name:</strong> {address.username} <br />
                      <strong>Mobile:</strong> {address.mobileNumber} <br />
                      <strong>Booking Type:</strong> {address.bookingType} <br /> */}
                      <strong>Address:</strong> {address.address}, {address.city},{" "}
                      {address.pincode}, {address.landmark}, {address.state}
                    </p>
                  </div>
                  <div
                    className="delete-address-icon"
                    onClick={() => handleDeleteAddress(address._id)}
                  >
                    <img src={DeleteIcon} alt="Delete" />
                  </div>
                 
                </div>
              ))
            ) : (
              <p>No addresses available</p>
            )}
          </div>
        )}
        {showForm && (
          <AddressForm
            addressData={addressData}
            setAddressData={setAddressData}
            handleSaveAddress={handleSaveAddress}
            onCancel={() => {
              setShowForm(false);
              setShowSavedAddresses(true);
              setIsAddingNewAddress(false);
            }}
          />
        )}
        {showLocationModal && (
          <LocationModal
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationModal(false)}
          />
        )}

     
      </div>

      
      <div className="cart-total">
         <h2>Cart Total</h2>
          <>
            <div className="pricing-con">
              <div className="total-items-cart">
                  <h2>Sub Total :</h2>
                  <p>₹ {basicTotalPrice}</p>
              </div>
              {
                discountValue>0 && (
                    <div className="discount-value">
                      <h2>Package Discount :</h2>
                      <p>₹ {discountValue}</p>
                    </div>
                )
              }
            
              {
                afterDiscountPrice>0 && 
                  (
                    <div className="discount-value">
                    <h2>Coupon Discount :</h2>
                    <p>₹ {afterDiscountPrice}</p>
                </div>
                  )
              }
            
              <div className="total-value"> 
                  <h2>Total :</h2>
                  <p>₹ {totalPrice.toFixed(2)}</p>
              </div>
            </div>
            {/* ₹  */}  
          </>
     
      <div className="cart-total-button">
        <button className="go-to-address-btn" onClick={handleSubmit}>
            SCHEDULE YOUR VISIT
        </button>
      </div>
    </div>
      
   </div>
  );
};

export default Address;
