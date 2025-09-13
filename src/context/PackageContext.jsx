import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./AuthContext";


const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const { setHasMembership } = useAuth();
  const [loading, setLoading] = useState(false);
  const toastDisplayedRef = useRef(false); // Reference to track if toast has been shown

  // Function to fetch the user's package based on userId
  const fetchUserPackage = async (userId) => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/user-packages/${userId}`,
      );
      const data = await response.json();

      let hasMembershipStatus = false;

      if (Array.isArray(data) && data.length > 0) {
        hasMembershipStatus = new Date(data[0].expiryDate) > new Date();
      } else if (data && typeof data === "object" && data._id) {
        hasMembershipStatus = new Date(data.expiryDate) > new Date();
      }

      // Update the membership status in AuthContext
      setHasMembership(hasMembershipStatus);

      // Show toast message only if it hasn't been displayed before and user has no active membership
     
    } catch (error) {
      console.error("Error fetching package:", error);
      setHasMembership(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's package when the userId is present in sessionStorage
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      setLoading(true);
      fetchUserPackage(userId);
    }
  }, []);

  return (
    <PackageContext.Provider value={{ loading, fetchUserPackage }}>
      {children}
      <ToastContainer /> {/* ToastContainer to render toasts */}
    </PackageContext.Provider>
  );
};

export const usePackage = () => useContext(PackageContext);
