import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import { useLocationPrice } from "./LocationPriceContext";
import LZString from "lz-string";
import Availability from "../components/cart/Availability";
import { toast } from "react-toastify";
import useEnhancedEffect from "@mui/material/utils/useEnhancedEffect";
import { use } from "react";
// Creating the Cart Context
export const CartContext = createContext();

// Export a custom hook to use the Cart context
export const useCart = () => useContext(CartContext);

// CartProvider component that will wrap other components
export const CartProvider = ({ children, cartId, showLogin }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemIdToRemove, setItemIdToRemove] = useState(null);
  const [cartNotFound, setCartNotFound] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [afterDiscountPrice, setAfterDiscountPrice] = useState(0);
  const { user, isAuthenticated, setHasMembership } = useAuth();
  const { updateUserLocation } = useAuth();
  const { getStoredPincode } = useLocationPrice();
  const [providerAvailability, setProviderAvailability] = useState(
    loadProviderAvailability(),
  );
  const [cartErrorMessage, setCartErrorMessage] = useState("");
  const [basicTotalPrice, setBasicTotalPrice] = useState(0);
  const [selectedTime, setselectedTime] = useState('')

  const cartIdRef = useRef(null);
  const [showActivePackage, setShowActivePackage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [discountValue, setDiscountValue] = useState("");

  const getuserId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchUserPackage();
  }, [getuserId, setHasMembership]);

  useEffect(() => {
    console.log(basicTotalPrice, "basic total price in context");
  }, [basicTotalPrice]);

  const fetchUserPackage = async () => {
    if (!getuserId) return;
    setLoading(true);
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/user-packages/${getuserId}`,
      );
      const data = await response.json();

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
        console.warn("Failed to fetch package:", response.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // package caluclation
  const calculateDiscountedPrice = useCallback(() => {
    const baseTotal = cartItems.reduce((acc, item) => acc + item.price, 0);
    const discount = currentPackage?.discount || 0;
    const discountAmount = (discount / 100) * baseTotal;
    const finalPrice = baseTotal - discountAmount - afterDiscountPrice;
    setDiscountValue(discountAmount);
    setTotalPrice(finalPrice);
  }, [cartItems, currentPackage, afterDiscountPrice]);

  useEffect(() => {
    setTotalPrice(totalPrice - afterDiscountPrice);
    console.log(totalPrice, "totalpriceincontext");
  }, [afterDiscountPrice]);

  const calculateTotalItems = useCallback(() => {
    const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotalItems(total);
  }, [cartItems]);

  const updateQuantity = useCallback(
    (itemId, newQuantity, unitPrice) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId
            ? { ...item, quantity: newQuantity, price: unitPrice * newQuantity }
            : item,
        ),
      );
      calculateDiscountedPrice();
      calculateTotalItems();
    },
    [calculateDiscountedPrice, calculateTotalItems],
  );

  useEffect(() => {
    calculateDiscountedPrice();
  }, [cartItems, currentPackage, calculateDiscountedPrice]);

  const fetchCart = useCallback(async () => {
    console.log("fetchCart() called"); // Debugging log

    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const userId = user?._id || sessionStorage.getItem("userId");

    if (!userId) {
      console.warn("fetchCart: user or userId is undefined");
      return;
    }

    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/cart/${userId}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          setCartNotFound(true);
          console.warn(`Cart not found for user: ${userId}`);
        }
        return;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.warn("Cart is empty, skipping unnecessary updates.");
        setCartItems([]);
        setTotalPrice(0);
        setTotalItems(0);
        return;
      }

      // ✅ Updating states in a batch to minimize re-renders
      setCartItems(data.items);
      cartIdRef.current = data._id;
      setCartNotFound(false);

      // Perform calculations within fetchCart to avoid dependency re-triggers
      const baseTotal = data.items.reduce((acc, item) => acc + item.price, 0);
      const discount = currentPackage?.discount || 0;
      const discountAmount = (discount / 100) * baseTotal;
      setDiscountValue(discountAmount);
      setTotalPrice(baseTotal - discountAmount - afterDiscountPrice);

      const totalItemsCount = data.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      setTotalItems(totalItemsCount);
    } catch (err) {
      console.warn("Failed to fetch cart data: ", {
        message: err.message,
        stack: err.stack,
        userId,
      });
    }
  }, [user?._id, currentPackage, afterDiscountPrice]); // Minimal dependencies

  useEffect(() => {
    if ((user && user._id) || sessionStorage.getItem("userId")) {
      fetchCart();
    }
  }, [user, cartId, fetchCart]);

  useEffect(() => {
    storeProviderAvailability(providerAvailability);
  }, [providerAvailability]);

  function loadProviderAvailability() {
    const storedData = localStorage.getItem("providerAvailability");
    return storedData ? JSON.parse(LZString.decompress(storedData)) : [];
  }

  function storeProviderAvailability(data) {
    const compressedData = LZString.compress(JSON.stringify(data));
    localStorage.setItem("providerAvailability", compressedData);
  }

  const addToCart = async (item) => {
    if (!isAuthenticated) {
      console.warn("User not authenticated. Redirecting to login.");
      showLogin && showLogin(true);
      return;
    }

    const latitude = sessionStorage.getItem("latitude");
    const longitude = sessionStorage.getItem("longitude");

    console.log(
      "SessionStorage - Latitude:",
      latitude,
      "Longitude:",
      longitude,
    );

    if (!latitude || !longitude) {
      console.error("Coordinates (latitude and longitude) are missing.");
      return;
    }

    const userId = user?._id || sessionStorage.getItem("userId");
    const itemWithCoordinates = {
      ...item,
      userId,
      lat: parseFloat(latitude),
      long: parseFloat(longitude),
    };

    console.log("Payload Sent to API:", itemWithCoordinates);

    try {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      const apiUrl = `${AZURE_BASE_URL}/v1.0/users/cart/create-cart`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemWithCoordinates),
      });

      const responseData = await response.json();
      console.log("API Response :", responseData);

      if (response.ok) {
        console.log("Cart item added successfully.");

        toast.success("Item added to cart successfully!", {
          position: "center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        if (
          responseData.providerAvailability &&
          responseData.providerAvailability.length > 0
        ) {
          console.log(
            "Provider Availability:",
            responseData.providerAvailability,
          );
          setProviderAvailability(responseData.providerAvailability);
        } else {
          console.warn("No providers available for this request.");
          setProviderAvailability([]);
          setCartErrorMessage("Providers not available");

          setTimeout(() => {
            console.log(
              `Removing item ${item._id} from cart due to unavailability.`,
            );
            removeFromCart(item._id);
          }, 2000);
        }
        await fetchCart();
      } else {
        console.warn(
          "Failed to add item to cart. Response message:",
          responseData.message,
        );
        setCartErrorMessage(
          responseData.message || "Failed to add item to cart",
        );

        // **Handle the new backend response when no providers are available**
        if (
          responseData.message ===
            "No providers available for the requested services." &&
          responseData.data ===
            "Sorry,No providers available now for chosen service."
        ) {
          setCartErrorMessage(
            "No Service person available for the requested service.",
          );
          toast.warn("No providers available for the selected service.", {
            position: "top-right",
            autoClose: 2000,
          });

          setTimeout(() => {
            console.log(
              `Removing item ${item._id} from cart due to unavailability.`,
            );
            removeFromCart(item._id);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error adding item to cart:", {
        message: error.message,
        stack: error.stack,
        userId,
        payload: itemWithCoordinates,
      });
      setCartErrorMessage("Error adding item to cart");
    }
  };

  const handleCart = async (
    serviceId,
    categoryId,
    subCategoryId,
    priceToUse,
  ) => {
    const userId = user?._id || sessionStorage.getItem("userId");

    if (!userId) {
      console.warn("User not authenticated");
      showLogin && showLogin(true);
      return;
    }

    const newItem = {
      userId,
      items: [
        {
          serviceId,
          categoryId,
          subCategoryId,
          quantity: 1,
          price: priceToUse,
        },
      ],
    };

    await addToCart(newItem);
    calculateDiscountedPrice(); // Recalculate discounted price after updating the cart
  };

  const removeFromCart = async (itemId) => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const userId = user?._id || sessionStorage.getItem("userId");

    // **Prevent API call if userId or itemId is missing**
    if (!userId || !itemId) {
      console.warn(
        "Invalid parameters: userId or itemId is undefined. Aborting API call.",
        { userId, itemId },
      );
      return;
    }

    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/cart/${userId}/${itemId}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId),
        );
        calculateDiscountedPrice();
        calculateTotalItems();
      } else {
        console.warn("Error deleting cart item: ", {
          status: response.status,
          statusText: response.statusText,
          userId,
          itemId,
        });
      }
    } catch (error) {
      console.warn("Error deleting cart item: ", {
        message: error.message,
        stack: error.stack,
        userId,
        itemId,
      });
    }
  };

  const clearCart = async (onCartCleared) => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      console.warn("No user ID found. Cannot clear the cart.");
      return;
    }

    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/cart/${userId}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setCartItems([]);
        setProviderAvailability([]);
        localStorage.removeItem("providerAvailability");
        if (onCartCleared) {
          onCartCleared();
        }
      } else {
        const errorMessage = await response.text();
        console.warn(`Failed to clear cart: ${errorMessage}`);
      }
    } catch (error) {
      console.warn("Error clearing the cart:", error);
    }
  };

  const handleLocationUpdate = async (latitude, longitude, pincode) => {
    const storedPincode = getStoredPincode();
    const selectedPincode = String(pincode);

    if (storedPincode === selectedPincode) {
      console.warn(
        "Pincode matches. Skipping location update and cart clearing.",
      );
      return;
    } else {
      await clearCart();
      await updateUserLocation(latitude, longitude);
      storePincode(selectedPincode);
    }
  };

  const storePincode = (pincode) => {
    const compressedPincode = LZString.compress(pincode);
    localStorage.setItem("userPincode", compressedPincode);
  };

  const createOrder = async () => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const orderData = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: `Task-tigers_${Date.now()}`,
        userId: user?._id,
        notes: {
          note1: "Order for Task Tigers",
          note2: "Additional details here",
        },
      };

      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/orders/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      const orderResponse = await response.json();
      const orderId = orderResponse.id;
      return orderId;
    } catch (error) {
      console.warn("Error creating order:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        basicTotalPrice,
        setBasicTotalPrice,
        setCartItems,
        totalPrice,
        setTotalPrice,
        totalItems,
        setAfterDiscountPrice,
        setTotalItems,
        itemIdToRemove,
        setItemIdToRemove,
        cartNotFound,
        setCartNotFound,
        cartMessage,
        setCartMessage,
        addToCart,
        removeFromCart,
        handleCart,
        updateQuantity,
        fetchCart,
        clearCart,
        createOrder,
        handleLocationUpdate,
        errorMessage,
        setErrorMessage,
        cartErrorMessage,
        setCartErrorMessage,
        providerAvailability,
        showActivePackage,
        setShowActivePackage,
        afterDiscountPrice,
        discountValue,
        setselectedTime,
        selectedTime,
        cartId: cartIdRef.current,
      }}
    >
      {cartNotFound && <div>{cartMessage}</div>}
      {cartErrorMessage && (
        <Availability
          message={cartErrorMessage}
          onClose={() => setCartErrorMessage("")}
        />
      )}
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
  cartId: PropTypes.string,
  showLogin: PropTypes.func,
};
