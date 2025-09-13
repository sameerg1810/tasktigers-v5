import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { auth } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast, Toaster } from "react-hot-toast";
import useUserLocation from "../hooks/useUserLocation";
import CaptchaComponent from "../components/Security/CaptchaComponent";
import { useLocationPrice } from "../context/LocationPriceContext";
import LZString from "lz-string";
import { fetchUserPackage as fetchUserPackageAPI } from "./userpackage-api.js";
import { fetchAddress } from "../components/Header/MyLocation.jsx";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const userIdRef = useRef(null);
  const [userCity, setUserCity] = useState(
    sessionStorage.getItem("selectedCity") || null,
  );
  const userLocationRef = useRef({ latitude: null, longitude: null });
  const { fetchGeocodeData } = useLocationPrice();
  const {
    location: userLocation,
    error: locationError,
    setLocation: setUserLocation,
  } = useUserLocation();

  const phoneRef = useRef(null);
  const compressedPhoneRef = LZString.compress(phoneRef);
  sessionStorage.setItem("compressedPhone", compressedPhoneRef);
  const otpRef = useRef(null);
  const [hasValidPackage, setHasValidPackage] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);

  useEffect(() => {
    console.log(user, "user in auth context");
  }, [user]);



  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${
          import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
        }`,
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data,'mapbox cityname')
        if (data.features && data.features.length > 0) {
          const city = data.features.find((feature) =>
            feature.place_type.includes("place"),
          );
          return city ? city.text : "Unknown location";
        }
      } else {
        console.warn("Failed to fetch city name from Mapbox.");
      }
    } catch (error) {
      console.warn("Error fetching city name from Mapbox:", error);
    }
    return "Unknown location";
  };

  useEffect(() => {
    if (userLocation && !sessionStorage.getItem("selectedCity")) {
      const { latitude, longitude } = userLocation;
      fetchCityName(latitude, longitude).then((city) => {
        setUserCity(city);
        userLocationRef.current = { latitude, longitude };
        if (latitude && longitude) {
          fetchGeocodeData(latitude, longitude);
        }
      });
    }
  }, [userLocation, fetchGeocodeData]);

  useEffect(() => {
    if (userCity && sessionStorage.getItem("selectedCity") !== userCity) {
      sessionStorage.setItem("selectedCity", userCity);
      window.location.reload();
    }
  }, [userCity]);

  useEffect(() => {
    if (userCity) {
      sessionStorage.setItem("selectedCity", userCity);
    }
  }, [userCity]);

  const updateUserLocation = async (latitude, longitude) => {
    try {
      console.log(
        `updateUserLocation: Updating to Latitude: ${latitude}, Longitude: ${longitude}`,
      );

      // Validate coordinates
      if (!latitude || !longitude) {
        console.warn(
          "updateUserLocation: Invalid latitude or longitude provided.",
        );
        return;
      }

      // Update location in ref and sessionStorage
      userLocationRef.current = { latitude, longitude };
      sessionStorage.setItem("latitude", latitude);
      sessionStorage.setItem("longitude", longitude);
      console.log(
        "updateUserLocation: Updated latitude and longitude in sessionStorage.",
      );

      // Fetch city name and formatted address using fetchAddress
      const { formattedAddress, cityName, error } = await fetchAddress(
        latitude,
        longitude,
      );

      if (error) {
        console.error("updateUserLocation: Failed to fetch address:", error);
        return;
      }

      // Update city in state and sessionStorage
      if (cityName) {
        // console.log(`updateUserLocation: City fetched: ${cityName}`);
        setUserCity(cityName);
        sessionStorage.setItem("selectedCity", cityName);
      } else {
        console.warn(
          "updateUserLocation: City name could not be fetched. Retaining current city.",
        );
      }

      // Update CurrentAddress in sessionStorage
      if (formattedAddress) {
        const fullAddress = formattedAddress.replace(cityName, "").trim();
        sessionStorage.setItem(
          "CurrentAddress",
          LZString.compress(fullAddress),
        );
        console.log(
          `updateUserLocation: CurrentAddress updated to: ${fullAddress}`,
        );
      } else {
        console.warn(
          "updateUserLocation: Formatted address could not be fetched.",
        );
      }

      // Fetch geocode data
      console.log("updateUserLocation: Fetching geocode data...");
      await fetchGeocodeData(latitude, longitude);
      console.log("updateUserLocation: Geocode data fetched successfully.");
    } catch (error) {
      console.error("updateUserLocation: Error updating user location:", error);
    }
  };

  const fetchUserInfo = async (userId) => {
    try {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/userAuth/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        const errorData = await response.json();
        console.warn(
          "Error fetching user info:",
          response.status,
          response.statusText,
          errorData,
        );
      }
    } catch (error) {
      console.warn("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    const storedJwtToken = sessionStorage.getItem("jwtToken");
    const storedUserId = sessionStorage.getItem("userId");
    const storedExpirationTime = sessionStorage.getItem("expirationTime");
    userIdRef.current = storedUserId;
    if (storedJwtToken && storedUserId && storedExpirationTime) {
      const currentTime = Date.now();

      if (currentTime < storedExpirationTime) {
        fetchUserInfo(storedUserId).then((userInfo) => {
          setUser(userInfo);
          setIsAuthenticated(true);
          setSessionTimeout(storedExpirationTime - currentTime);
        });
      } else {
        logout();
      }
    }
  }, []);

  const sendOtp = async ({ phone }) => {
    try {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/userAuth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        console.log("OTP sent successfully:", data);
      } else {
        console.warn("Error sending OTP:", data.message);
      }
    } catch (error) {
      console.warn("Error in sendOtp:", error);
    }
  };

  const verifyOtp = async (otp) => {
    otpRef.current = otp;
    console.log("OTP stored:", otpRef.current);
  };

  const login = async ({
    phone,
    otp,
    email,
    name,
    displayName,
    photoURL,
    providerId,
  }) => {
    const userInfo = googleUser || {};
    const loginData = {
      phone,
      otp: isNaN(otp) ? otp : Number(otp),
      email: email || userInfo.email,
      name: name || userInfo.name,
      displayName: displayName || userInfo.displayName,
      photoURL: photoURL || userInfo.photoURL,
      providerId: providerId || userInfo.providerId,
    };

    try {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/users/userAuth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);

        const compressedPhone = LZString.compress(data.user.phone);
        sessionStorage.setItem("compressedPhone", compressedPhone);
        const expirationTime = Date.now() + 12 * 60 * 60 * 1000;
        sessionStorage.setItem("jwtToken", data.token);
        sessionStorage.setItem("userId", data.user._id);
        sessionStorage.setItem("expirationTime", expirationTime);

        setSessionTimeout(12 * 60 * 60 * 1000);
        setUser(data.user);
        setIsAuthenticated(true);
        userIdRef.current = data.user._id;

        return true;
      } else {
        const errorData = await response.json();
        console.warn("Login failed", response.status, errorData);
      }
    } catch (error) {
      console.warn("Error during login:", error);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("addressState");
    localStorage.removeItem("cachedServices");
    localStorage.removeItem("categoryData");
    localStorage.removeItem("customPriceData");
    localStorage.removeItem("districtPriceData");
    localStorage.removeItem("recentSearches");
    localStorage.removeItem("rzp_checkout_anon_id");
    localStorage.removeItem("rzp_device_id");
    localStorage.removeItem("userPincode");
    localStorage.removeItem("userId");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("expirationTime");
    sessionStorage.clear();

    setUser(null);
    setIsAuthenticated(false);
    setHasValidPackage(false);
    setHasMembership(false);
    userIdRef.current = null;

    if (timeoutId) clearTimeout(timeoutId);
    setTimeoutId(null);

    window.location.reload();
  };
  const setSessionTimeout = (expiresIn) => {
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      if (!captchaVerified) {
        showCaptcha();
      } else {
        logout();
      }
    }, expiresIn - 20000);
    setTimeoutId(newTimeoutId);
  };

  const showCaptcha = () => {
    confirmAlert({
      title: "Verify You're Human",
      message: (
        <CaptchaComponent
          onVerify={(isVerified) => {
            setCaptchaVerified(isVerified);
            if (isVerified) {
              const newExpirationTime = Date.now() + 60 * 60 * 1000;
              sessionStorage.setItem("expirationTime", newExpirationTime);
              setSessionTimeout(60 * 60 * 1000);
              toast.success("CAPTCHA verified. Session extended.");
            }
          }}
        />
      ),
      buttons: [
        {
          label: "Close",
          onClick: () => logout(),
        },
      ],
      closeOnClickOutside: false,
    });
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userInfo = {
        email: user.email,
        name: user.displayName,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: user.providerData[0].providerId,
      };

      setGoogleUser(userInfo);
      // toast.success("Google Sign-In successful.");
    } catch (error) {
      console.warn("Google Sign-In error:", error);
    }
  };

  const fetchUserPackage = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const data = await fetchUserPackageAPI(userId);

      let hasMembershipStatus = false;

      if (Array.isArray(data) && data.length > 0) {
        hasMembershipStatus = new Date(data[0].expiryDate) > new Date();
      } else if (data && typeof data === "object" && data._id) {
        hasMembershipStatus = new Date(data.expiryDate) > new Date();
      }

      setHasMembership(hasMembershipStatus);
      setHasMembership(true);

      if (hasMembershipStatus) {
        // toast.success("You have an active membership!");
      } else {
        console.warn("You do not have an active membership.");
      }
    } catch (error) {
      console.warn("Error fetching package:", error);
      setHasMembership(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: userIdRef.current,
        userLocation,
        userCity,
        fetchCityName,
        setUserLocation,
        updateUserLocation,
        hasMembership,
        setHasMembership,
        login,
        isAuthenticated,
        sendOtp,
        loginWithGoogle,
        googleUser,
        logout,
        fetchUserInfo,
        hasValidPackage,
        setHasValidPackage,
        fetchUserPackage,
        verifyOtp,
        phoneRef,
        otpRef,
      }}
    >
      {children}
      {locationError && <p>{locationError}</p>}
      <Toaster limit={1} /> {/* This line limits to one toast */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
