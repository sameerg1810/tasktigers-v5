import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import LZString from "lz-string";
import { onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase"; // Make sure Firebase is set up correctly
import { useMessaging } from "./MessagingContext"; // Custom hook or function for sending notifications
import { CartContext } from "./CartContext";
import { useAuth } from "./AuthContext";
import { confirmAlert } from "react-confirm-alert"; // Import the confirmAlert function
import "react-confirm-alert/src/react-confirm-alert.css"; // Import the styles for the confirmation alert
import { postNotification } from "../pages/OrderTracking/api/user-notification";
export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { cartItems } = useContext(CartContext); // Access cartItems
  const { userId } = useAuth(); // Access userId from Auth context
  const { sendNotification } = useMessaging(); // Custom function for sending notifications

  // State variables for managing order details and notifications
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [providerId, setProviderId] = useState(null); // Store the provider ID
  const [jobCompleteOtp, setJobCompleteOtp] = useState(null); // OTP for job completion
  const [orderStatus, setOrderStatus] = useState(null); // Store order status
  const [orderId, setOrderId] = useState(null); // Store order ID
  const [loading, setLoading] = useState(false); // Loading state
  const [providerAvailability, setProviderAvailability] = useState([]); // Provider availability data
  const [otpFilled, setOtpFilled] = useState(false);
  
  // Refs to store order details and scheduling data
  const orderDetailsRef = useRef([]);
  const matchedProvidersRef = useRef([]);
  const addressIdRef = useRef(null);
  const selectedDateRef = useRef(null);
  const selectedTimeRef = useRef(null);

  // Load order and provider availability data from sessionStorage and cookies
  useEffect(() => {
    loadOrderDetailsFromStorage();
    loadProviderAvailabilityFromStorage();
    loadSelectedDateTimeFromCookies();
  }, []);

  // Update order details when cart items change
  useEffect(() => {
    updateOrderDetails(cartItems);
  }, [cartItems]);

  // Load order details from sessionStorage
  const loadOrderDetailsFromStorage = () => {
    const compressedOrderDetails = sessionStorage.getItem(
      "compressedOrderItems",
    );
    if (compressedOrderDetails) {
      const orderDetails = JSON.parse(
        LZString.decompressFromUTF16(compressedOrderDetails),
      );
      orderDetailsRef.current = orderDetails;
    }
  };

  // Load provider availability from sessionStorage
  const loadProviderAvailabilityFromStorage = () => {
    const compressedAvailability = sessionStorage.getItem(
      "compressedProviderAvailability",
    );
    if (compressedAvailability) {
      const availability = JSON.parse(
        LZString.decompressFromUTF16(compressedAvailability),
      );
      setProviderAvailability(availability);
    }
  };

  // Load selected date, time, and month from cookies
  const loadSelectedDateTimeFromCookies = () => {
    const storedSelectedDate = Cookies.get("selectedDate");
    const storedSelectedTime = Cookies.get("selectedTime");

    if (storedSelectedDate) {
      selectedDateRef.current = LZString.decompress(storedSelectedDate);
    }
    if (storedSelectedTime) {
      selectedTimeRef.current = LZString.decompress(storedSelectedTime);
    }
  };

  // Update order details
  const updateOrderDetails = (newOrderDetails) => {
    if (!Array.isArray(newOrderDetails)) {
      console.error(
        "Expected newOrderDetails to be an array:",
        newOrderDetails,
      );
      return;
    }

    orderDetailsRef.current = newOrderDetails;
    persistOrderDetails(newOrderDetails);
  };

  // Persist order details to sessionStorage
  const persistOrderDetails = (orderDetails) => {
    const compressedItems = LZString.compressToUTF16(
      JSON.stringify(orderDetails),
    );
    sessionStorage.setItem("compressedOrderItems", compressedItems);
  };

  // Update provider availability
  const updateProviderAvailability = (availability) => {
    setProviderAvailability(availability);
    const compressedAvailability = LZString.compressToUTF16(
      JSON.stringify(availability),
    );
    sessionStorage.setItem(
      "compressedProviderAvailability",
      compressedAvailability,
    );
  };

  // Clear provider availability from state and sessionStorage
  const clearProviderAvailability = () => {
    setProviderAvailability([]);
    sessionStorage.removeItem("compressedProviderAvailability");
  };

  // Update all item schedules based on selected date, time, and month
  const updateAllItemSchedules = (dateTime) => {
    const { providerIds = [], selectedDate, selectedTime } = dateTime || {};
    matchedProvidersRef.current = providerIds;
    // Store selectedDate, selectedTime, and selectedMonth in refs and cookies
    selectedDateRef.current = selectedDate;
    selectedTimeRef.current = selectedTime;

    Cookies.set("selectedDate", LZString.compress(selectedDate), {
      expires: 1,
    });
    Cookies.set("selectedTime", LZString.compress(selectedTime), {
      expires: 1,
    });

    const updatedOrderData = (orderDetailsRef.current || []).map((cart) => {
      const items = Array.isArray(cart.items) ? cart.items : [];
      return {
        ...cart,
        items: items.map((item) => ({
          ...item,
          selectedDate: selectedDateRef.current,
          selectedTime: selectedTimeRef.current,
        })),
      };
    });

    orderDetailsRef.current = updatedOrderData;
  };

  // Update selected address ID
  const updateSelectedAddressId = (addressId) => {
    setSelectedAddressId(addressId);
    addressIdRef.current = addressId;
  };

  // Create a new order
  const createOrder = async (paymentId, totalAmount) => {
    if (!totalAmount) {
      console.error("TotalAmount is not defined.");
      return { success: false, message: "TotalAmount is required" };
    }

    const finalAddressId = addressIdRef.current || "FAKE_ADDRESS_ID_12345";
    const finalUserId = userId || "FAKE_USER_ID_12345";
    const items = getItemsForOrder();

    const orderData = {
      userId: finalUserId,
      addressId: finalAddressId,
      providerIds: matchedProvidersRef.current,
      items,
      paymentId: paymentId || "FAKE_PAYMENT_ID_12345",
      totalAmount,
    };

    return submitOrder(orderData);
  };

  // Get items for the order
  const getItemsForOrder = () => {
    return orderDetailsRef.current.map((item) => ({
      serviceId: item.serviceId._id,
      categoryId: item.categoryId,
      subCategoryId: item.subCategoryId,
      quantity: item.quantity,
      selectedTime: String(selectedTimeRef.current || ""),
      scheduledDate: formatScheduledDate(),
    }));
  };

  // Format scheduled date for the order
  const formatScheduledDate = () => {
    const selectedDate = String(selectedDateRef.current || "");
    console.log("the variables at formatScheduleDate", selectedDate);
    return `${selectedDate}`;
  };

  // Submit the order to the server
  const submitOrder = async (orderData) => {
    console.log("Submitting Order Data:", orderData); // Log for debugging

    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

    try {
      setLoading(true); // Set loading to true before making the request

      // Console log to check request before sending
      console.log(
        "Sending request to:",
        `${AZURE_BASE_URL}/v1.0/users/order/create-order`,
      );

      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/order/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        },
      );

      setLoading(false); // Reset loading state after request completes

      if (response.ok) {
        const orderResponse = await response.json();
        console.log("Order successfully created:", orderResponse);
        handleOrderCreationSuccess(orderResponse); // Handle success response
        return { success: true, orderResponse };
      } else {
        const errorMessage = `Failed to create order: ${response.status} ${response.statusText}`;
        console.error(errorMessage); // Log error message for failed response
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("Error creating order:", error); // Log error during fetch request
      setLoading(false); // Reset loading state on error
      return {
        success: false,
        message: `Error creating order: ${error.message}`,
      };
    }
  };

  // Handle order creation success
  const handleOrderCreationSuccess = (orderResponse) => {
    setOrderId(orderResponse.orderId || null);
    sendNotification({
      title: "Order Created",
      body: "Your order has been successfully created and is being processed.",
    });
    sessionStorage.removeItem("compressedOrderItems");
    setOrderCreated(true);
    clearProviderAvailability();

    selectedDateRef.current = null;
    selectedTimeRef.current = null;

    Cookies.remove("selectedDate");
    Cookies.remove("selectedTime");
  };

  // Handle incoming Firebase backend messages (notifications)
  // Handle incoming Firebase backend messages (notifications)
  useEffect(() => {
    const handleBackendMessage = (payload) => {
      console.log("Received backend message:", payload); // Log the payload for debugging
      const notification = {
        title: payload?.notification?.title || "No title",
        body: payload?.notification?.body || "No body",
        data: payload?.data || {},
        receivedAt: new Date().toISOString(),
      };
      postNotification(notification, userId);
      const notificationTitle = payload?.notification?.title;
      const notificationBody = payload?.notification?.body;
      const receivedOrderId = payload?.data?.orderId || "N/A";
      const providerIdFromMessage = payload?.data?.providerId || "N/A";
      const status = payload?.data?.status;

      let title = notificationTitle;
      //provider sent otp
      if (notificationTitle === "Provider sent OTP") {
        setJobCompleteOtp(notificationBody);
        title = `OTP Received: ${notificationBody}`;
        confirmAlert({
          title,
          message: `Your OTP is: ${notificationBody}. Please share it with the provider.`,
          buttons: [{ label: "OK" }],
        });
      } else if (
        notificationTitle === "Order Status Update" &&
        status === "InProgress"
      ) {
        setOrderStatus("InProgress");
        title = `Order In Progress (ID: ${receivedOrderId})`;
        confirmAlert({
          title,
          message: `Your order (ID: ${receivedOrderId}) is now in progress.`,
          buttons: [{ label: "OK" }],
        });
      } else if (notificationTitle === "Order Accepted") {
        setProviderId(providerIdFromMessage); // Set providerId
        setOrderId(receivedOrderId);
        setOrderStatus("Accepted");
        title = `Order Accepted (ID: ${receivedOrderId})`;
        setLoading(false);
        confirmAlert({
          title,
          message: `Your order (ID: ${receivedOrderId}) has been accepted by the provider.`,
          buttons: [{ label: "OK" }],
        });
      } else if (notificationTitle === "Order Completed") {
        setOrderId(receivedOrderId);
        title = `Order Completed (ID: ${receivedOrderId})`;
        confirmAlert({
          title,
          message: `Your order (ID: ${receivedOrderId}) has been completed. Please rate your experience.`,
          buttons: [{ label: "OK" }],
        });
      }

      if (title) {
        sendNotification({
          title,
          body: notificationBody || "No additional information provided.",
        });
      }
    };

    const unsubscribe = onMessage(messaging, handleBackendMessage);
    return () => unsubscribe();
  }, []); // Empty dependency array to ensure this runs only once

  return (
    <OrdersContext.Provider
      value={{
        selectedAddressId,
        setSelectedAddressId,
        updateSelectedAddressId,
        orderDetails: orderDetailsRef.current,
        updateOrderDetails,
        updateAllItemSchedules,
        createOrder,
        matchedProviders: matchedProvidersRef.current,
        providerAvailability,
        updateProviderAvailability,
        loading,
        orderCreated,
        jobCompleteOtp,
        providerId, // Exposing providerId
        setProviderId, // Exposing setProviderId
        orderStatus,
        orderId,
        selectedDateRef,
        selectedTimeRef,

        otpFilled, // Expose otpFilled
        setOtpFilled, // Expose setOtpFilled
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

OrdersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default OrdersProvider;
