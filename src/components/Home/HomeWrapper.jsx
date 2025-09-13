import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LZString from "lz-string";
import { toast } from "react-hot-toast"; // React Hot Toast import
import Home from "../../pages/Home/home"; // Adjust the import path for your Home component

const HomeWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    // Extract referral code from the URL query parameters
    const referralCode = currentUrl.searchParams.get("referralCode");

    // Check if the user is logged in (userId exists in sessionStorage)
    const userId = sessionStorage.getItem("userId");

    if (referralCode) {
      // Store the referral code in sessionStorage (compressed)
      const compressedReferralCode = LZString.compress(referralCode);
      sessionStorage.setItem("rflcd", compressedReferralCode);

      console.log("Referral code stored successfully:", referralCode);

      // Remove referralCode from the URL
      currentUrl.searchParams.delete("referralCode");
      window.history.replaceState({}, "", currentUrl.pathname);

      if (userId) {
        // Success Toast Notification if user is logged in
        toast.success("Referral code stored successfully!", {
          duration: 2000,
          position: "top-center",
        });
      } else {
        // Error Toast Notification prompting user to log in
        toast.error("Please log in to save your referral code permanently.", {
          duration: 2000,
          position: "top-center",
        });
      }
    }
  }, [navigate]);

  return <Home />;
};

export default HomeWrapper;
