import React, { useContext } from "react";
import "./ScheduleFooter.css";
import { CartContext } from "../../context/CartContext";
import { OrdersContext } from "../../context/OrdersContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import LZString from "lz-string";

const ScheduleFooter = ({ onNext }) => {
  const { totalItems, totalPrice, afterDiscountPrice, basicTotalPrice, discountValue } = useContext(CartContext);
  const {
    orderDetails,
    selectedAddressId,
    matchedProviders,
    selectedDateRef,
    selectedTimeRef,
  } = useContext(OrdersContext);

  const handleProceedToCheckout = () => {
    console.log("Order Details:", orderDetails); // Debugging log to verify structure
    console.log("Matched Provider IDs:", matchedProviders); // Check if matchedProviders are correctly fetched

    // Construct items array with extracted details for API call
    const items = orderDetails.map((item) => ({
      ...item,
      serviceId: item.serviceId._id, // Only the _id from serviceId
      selectedDate: selectedDateRef.current || "Not specified",
      selectedTime: selectedTimeRef.current || "Not specified",
      scheduledDate: `${selectedDateRef.current || "Date not selected"}`,
    }));

    const orderData = {
      addressId: selectedAddressId,
      items,
      providerIds: matchedProviders, // Use matchedProviders from context
    };

    // Compress and store the order data in session storage as a backup
    const compressedOrderData = LZString.compress(JSON.stringify(orderData));
    sessionStorage.setItem("backupOrderData", compressedOrderData);

    console.log("Order Data on Proceed to Checkout:", orderData);

    // Create a formatted message with item details for confirmation alert
    const itemDetails = orderDetails
      .map(
        (item) =>
          `Service: ${item.serviceId.name}\nDate: ${selectedDateRef.current || "Not specified"
          }\nTime: ${selectedTimeRef.current || "Not specified"}`,
      )
      .join("\n\n");

    const message = `
      You have booked:
      ${itemDetails}

      Total Items: ${totalItems}
      Total Price: ₹${totalPrice.toFixed(2)}
    `;

    confirmAlert({
      title: "Confirm to proceed",
      message: message.trim(),
      buttons: [
        {
          label: "Confirm",
          onClick: () => onNext("checkout"),
        },
        {
          label: "Cancel",
          onClick: () => { },
        },
      ],
    });
  };

  return (
    <>
      <div className="cart-total">
        <h2>Cart Total</h2>
        <div className="pricing-con">
          <div className="total-items-cart">
            <h2>Sub Total :</h2>
            <p>₹ {basicTotalPrice}</p>
          </div>
          {
            discountValue > 0 && (
              <div className="discount-value">
                <h2>Package Discount :</h2>
                <p>₹ {discountValue}</p>
              </div>
            )
          }

          {
            afterDiscountPrice > 0 &&
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

        <div className="cart-total-button">
          <button
            className="proceed-to-checkout-btn"
            onClick={handleProceedToCheckout}
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>


    </>


  );
};

export default ScheduleFooter;
