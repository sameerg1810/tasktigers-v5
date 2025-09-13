import React, { useState, useContext, useMemo, useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const logo = `${IMAGE_BASE_URL}/logo.png`;
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { OrdersContext } from "../../context/OrdersContext";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";
import Coupons from "../../pages/USER-PROFILE/COUPONS/coupons";
import LZString from "lz-string";
import CloseIcon from '@mui/icons-material/Close';

const Checkout = ({ state }) => {
  const { user } = useAuth();
  const { discountValue, totalPrice, clearCart, fetchCart,cartItems,setAfterDiscountPrice , basicTotalPrice,afterDiscountPrice } =
    useContext(CartContext);
  const { createOrder } = useContext(OrdersContext);

  const [couponData, setCouponData] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponNotification, setCouponNotification] = useState(
    "Use coupons to get more discounts",
  );

  const navigate = useNavigate();
  const RazorKey = import.meta.env.VITE_RZP_KEY_ID;


  // cartitems related
  
  // Group items by service-related data and aggregate quantities
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const key = `${item.serviceId?._id}-${item.categoryId?._id}`; // Group by serviceId and categoryId

    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }

    acc[key].quantity += item.quantity; // Aggregate quantity for grouped items
    return acc;
  }, {});

  const groupedItemsArray = Object.values(groupedCartItems);

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
// cart  items related ended

  // Decompressed phone
  const decompressedPhone = useMemo(() => {
    const compressedPhone = localStorage.getItem("compressedPhone");
    return compressedPhone ? LZString.decompress(compressedPhone) : "";
  }, []);



  // Apply coupon logic
  const handleCouponApply = () => {
    if (!couponData) return;
  
    const { discount, discountType, minCartValue } = couponData;
    console.log(couponData, 'coupon data');
    
    // Step 1: Check if the total price is less than the minimum cart value
    if (totalPrice < minCartValue) {
      setCouponNotification(
        `Buy Rs.${minCartValue - totalPrice} more to use this coupon`
      );
      return;
    }
  
    let calculatedDiscountPrice = 0;
    
    // Step 2: Check if the discount is a percentage or a fixed amount
    if (discountType === "percentage") {
      calculatedDiscountPrice = (totalPrice * discount) / 100;
      console.log(calculatedDiscountPrice, 'discount price');
    } else {
      calculatedDiscountPrice = discount;
    }
    
    setAfterDiscountPrice(calculatedDiscountPrice);
    
    // Step 6: Notify the user about the discount applied
   
    // Mark the coupon as applied
    setIsCouponApplied(true);
  };

  useEffect(()=>{
    setCouponNotification(
      `You saved Rs.${afterDiscountPrice} using this coupon`
    );  
  },[afterDiscountPrice])
  
  

  // Clear coupon logic
  const handleClearCoupon = () => {
    setCouponData("");
    setAfterDiscountPrice(0)
    setCouponNotification("Use coupons to get more discounts");
    setIsCouponApplied(false);
  };

  // Handle coupon selection
  const handleCopen = (coupon) => {
    setCouponData(coupon);
  };

  // Payment handling logic
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderId) => {
    try {
      const res = await loadRazorpayScript();

      if (!res) {
        console.error("Razorpay SDK failed to load. Are you online?");
        setIsLoading(false);
        return;
      }

      const phoneNumber = user?.phone || decompressedPhone || "";
      const selectedDate = "12"; // Replace with actual date selection logic
      const selectedTime = "9AM"; // Replace with actual time selection logic

      const options = {
        key: RazorKey,
        amount: totalPrice * 100,
        currency: "INR",
        name: "TASK TIGERS",
        description: "Test Transaction",
        image: logo,
        order_id: orderId,
        handler: async function (response) {
          console.log("Payment successful", response);

          // Handle the post-payment flow
          try {
            const orderResponse = await createOrder(
              response.razorpay_payment_id,
              totalPrice,
              {
                selectedDate,
                selectedTime,
              },
            );

            if (orderResponse.success) {
              await clearCart(async () => {
                await fetchCart();
                navigate("/ordertracking?orderCreated=true");
              });
            } else {
              console.error("Order creation failed.");
            }
          } catch (error) {
            console.error("Error while processing order:", error);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: phoneNumber,
        },
        notes: {
          address: user?.address || "",
        },
        theme: {
          color: "#ff6600",
        },
        modal: {
          ondismiss: () => {
            console.warn("Payment modal closed by the user.");
            setIsLoading(false);
          },
        },
      };

      // Razorpay callbacks for advanced management
      options.events = {
        payment_failed: function (response) {
          console.error("Payment failed:", response.error.description);
          setIsLoading(false);
          alert("Payment failed. Please try again.");
        },
        payment_successful: function (response) {
          console.log("Payment completed successfully:", response);
        },
      };

      // Open the Razorpay payment modal
      const paymentObject = new window.Razorpay(options);

      // Add listeners for debugging
      paymentObject.on("payment.failed", (response) => {
        console.error("Payment failed during transaction:", response);
      });

      paymentObject.on("payment.success", (response) => {
        console.log("Payment succeeded during transaction:", response);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Error during Razorpay process:", error);
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://appsvc-apibackend-dev.azurewebsites.net/v1.0/core/razor-pay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          }),
        },
      );

      const data = await response.json();
      if (response.ok && data.id) {
        await handleRazorpayPayment(data.id);
      } else {
        console.error("Failed to create order.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-main-con">
      
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
             
            
              <div key={item._id} className="cart-item slide-in">
                 {/* <div>
                   <img src={serviceimage} alt="serviceimage"/>
                 </div> */}
                 <p>{serviceName}</p>
                 <p>₹{pricePerItem}{" "}</p>
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
                  <p>₹{(pricePerItem * item.quantity).toFixed(2)}{" "}</p>
                  <CloseIcon
                    onClick={handleDeleteClick}
                    sx={{ cursor: 'pointer' }}
                  />

              </div>
              </>
            
            );
          })
        )}
      </div>
      <div className="checkout-container">
        <div className="checkout-summary">
          <div className="cart-total">
            <h2>Cart Total</h2>
            <div className="pricing-con">
            <div className="total-items-cart">
                <h2>Sub Total :</h2>
                <p>{basicTotalPrice}</p>
            </div>
            {
              discountValue>0 && (
                  <div className="discount-value">
                    <h2>Package Discount :</h2>
                    <p>{discountValue}</p>
                  </div>
              )
            }
           
            {
              afterDiscountPrice>0 && 
                (
                  <div className="discount-value">
                  <h2>Coupon Discount :</h2>
                  <p>{afterDiscountPrice}</p>
              </div>
                )
            }
           
            <div className="total-value"> 
                <h2>Total :</h2>
                <p>{totalPrice.toFixed(2)}</p>
            </div>
          </div>

            <div className="cart-total-button">
              <button
                className="confirm-payment-btn"
                onClick={handleConfirmPayment}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "CONFIRM PAYMENT"}
              </button>
            </div>
          </div>
      </div> 
      <div className="coupon-section">
        <div className="active-package-card">
          <p className="active-package-text">{couponNotification}</p>
        </div>

        <div className="coupon-code">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponData.couponCode || ""}
            onChange={(e) =>
              setCouponData({ ...couponData, couponCode: e.target.value })
            }
          />
          <button
            className="apply-coupon-btn"
            onClick={isCouponApplied ? handleClearCoupon : handleCouponApply}
          >
            {isCouponApplied ? "CLEAR" : "APPLY"}
          </button>
        </div>
      </div>

      <Coupons handleCopen={handleCopen} />

     
        </div>
    </div>
    
  );
};

Checkout.propTypes = {
  state: PropTypes.object.isRequired,
};

export default Checkout;
