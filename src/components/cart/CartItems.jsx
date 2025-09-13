import React, { useContext, useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import CartFooter from "./CartFooter";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import "./CartItems.css";

const CartItems = ({ onNext }) => {
  const {
    cartItems,
    removeFromCart,
    addToCart, // Make sure this function is available in the context
    setTotalItems,
    discountValue,
    setBasicTotalPrice
  } = useContext(CartContext);

  const { hasMembership } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const navigate = useNavigate();

  // Group items by service-related data and aggregate quantities
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const key = `${item.serviceId?._id}-${item.categoryId?._id}`; // Group by serviceId and categoryId

    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0, totalPrice: 0 }; // Add totalPrice property for each group
    }

    acc[key].quantity += item.quantity; // Aggregate quantity for grouped items
    acc[key].totalPrice += item.quantity * item.price; // Update total price for each group

    return acc;
  }, {});

  const groupedItemsArray = Object.values(groupedCartItems);

  // Calculate total items when `groupedItemsArray` changes
  useEffect(() => {
    const totalQuantity = groupedItemsArray.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    setTotalItems(totalQuantity); // Update the total quantity
  }, [cartItems]); // Only depend on cartItems

  // Calculate total price when `cartItems` change
  useEffect(() => {
    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    setBasicTotalPrice(totalPrice.toFixed(2)); // Update state with the total price
  }, [cartItems]); // Only depend on cartItems


  // Handle incompatible item logic after adding a new item
  useEffect(() => {
    handleIncompatibleItem();
  }, [cartItems]);

  const handleIncompatibleItem = () => {
    if (cartItems.length > 1) {
      const previousItem = cartItems[cartItems.length - 2];
      const newItem = cartItems[cartItems.length - 1];

      // Compare the category IDs of the previous and new item
      if (previousItem?.categoryId !== newItem?.categoryId) {
        setShowPopup(true);
        console.log("Incompatible items detected. Removing previous item."); // Debugging log
        removeFromCart(previousItem._id);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress size={50} color="primary" />
      </div>
    );
  }

  const handleDeleteClick = async () => {
    setLoading(true); // Start loading spinner
    for (const item of groupedItemsArray) {
      console.log("Removing item from cart: ", item._id); // Console log for debugging
      await removeFromCart(item._id); // Remove each item sequentially
    }
    setLoading(false); // End loading spinner once done
  };

  const handleMinusClick = (item) => {
    // Directly remove item on minus button click (same as delete)
    console.log("Removing item from cart (via minus): ", item._id); // Console log for debugging
    removeFromCart(item._id);
  };

  const handlePlusClick = (item) => {
    console.log("Original item:", item);

    // Format the item to include only the required fields
    const formattedItem = {
      serviceId: item.serviceId._id, // Extract the _id from serviceId
      categoryId: item.categoryId,
      subCategoryId: item.subCategoryId,
      quantity: 1, // Default to 1 if quantity is not provided
      price: item.price,
    };

    console.log("Formatted item to send to addToCart:", formattedItem);

    // Add to cart with the formatted item
    addToCart({ items: [formattedItem] }); // Ensure 'items' is an array
  };

  return (
    <div className="cart-items">
      {/* Popup for incompatible items */}
      {showPopup && (
        <div className="popup fade-in">
          <span>
            This service item is not similar to the previous one. The previous
            item has been removed from the cart.
          </span>
          <button className="popup-close" onClick={() => setShowPopup(false)}>
            &times;
          </button>
        </div>
      )}



      {/* Grouped Cart items */}
      <div className="cart-items-container">
        <div className="cart-items-headding">
          <p>Service name</p>
          <p>Price</p>
          <p> Quantity</p>
          <p>Total</p>
          <p>Delete</p>
        </div>
        {groupedItemsArray.length === 0 ? (
          <p className="empty-cart-message fade-in">No items in the cart.</p>
        ) : (
          groupedItemsArray.map((item) => {
            const serviceName =
              item.serviceId?.name || "Service Name Unavailable";
            const serviceVariant = item.serviceId?.serviceVariants?.[0];
            const serviceTime = item.serviceId?.serviceTime || "N/A"; // Displaying serviceTime from serviceId
            const pricePerItem = (item.price / item.quantity).toFixed(2); // Rounded to 2 decimal places
            const serviceimage = item.serviceId?.image;
            // Displaying service variant with '-' next to service name
            const variantName = serviceVariant?.variantName
              ? `- ${serviceVariant.variantName}`
              : "";

            return (
              <>


                <div key={item._id} className="cart-item">
                  {/* <div>
                   <img src={serviceimage} alt="serviceimage"/>
                 </div> */}
                  <p>{serviceName}</p>
                  <p>₹{pricePerItem} </p>
                  <div className="quantity">
                    <button
                      id="quantitybtn"
                      onClick={() => handleMinusClick(item)} // Now minus is deleting the item
                    >
                      - {/* Now Minus also removes item */}
                    </button>
                    <span id="quantity-text">{item.quantity}</span>
                    <button
                      id="quantitybtn"
                      onClick={() => handlePlusClick(item)}
                    >
                      +
                    </button>
                  </div>
                  <p>₹{(pricePerItem * item.quantity).toFixed(2)} </p>
                  <CloseIcon
                    onClick={handleDeleteClick}
                    sx={{ cursor: "pointer" }}
                  />
                </div>
              </>
            );
          })
        )}
      </div>
      <div >
        <CartFooter onNext={onNext} />
      </div>

      {/* Cart Footer */}
    </div>
  );
};

CartItems.propTypes = {
  onNext: PropTypes.func.isRequired,
};

export default memo(CartItems);
