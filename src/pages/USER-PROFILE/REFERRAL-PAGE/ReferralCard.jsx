import React, { useState, useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa";
const  ReferraBanner =  `${IMAGE_BASE_URL}/refferal-code.png`;
import "./ReferralCard.css";
import { getReferralCode, createReferralCode } from "../api/referralService"; // Import API methods

const ReferralCard = () => {
  const userId = sessionStorage.getItem("userId"); // Fetch userId from sessionStorage
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const baseReferralURL = "http://localhost:5173?referralCode=";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  const fetchOrCreateReferralCode = async () => {
    try {
      if (!userId) {
        console.error("User ID not found. Please log in.");
        setLoading(false);
        return;
      }

      // Try to fetch an existing referral code
      const response = await getReferralCode(userId);

      if (response.success && response.codes.length > 0) {
        // Use the first referral code from the response
        const code = response.codes[0].code;
        setReferralLink(`${baseReferralURL}${code}`);
      } else {
        console.log("No referral code found. Creating a new one...");

        // Create a new referral code if none exists
        const createResponse = await createReferralCode({
          userId,
          rewardType: "discount",
          rewardValue: 10,
          maxUsage: 5, // Customize max usage as needed
        });

        if (createResponse.success && createResponse.referralCode) {
          setReferralLink(
            `${baseReferralURL}${createResponse.referralCode.code}`,
          );
        } else {
          console.error("Failed to create referral code.");
        }
      }
    } catch (error) {
      console.error("Error fetching or creating referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateReferralCode();
  }, []);

  const templateMessage = `Hi! I found a great service on Task Tigers and thought you'd like it. Use my referral link to get ₹100 off on your first booking: ${referralLink}`;

  return (
    <div className="referral-page">
     
      <div className="referral-card">
        <div className="referral-card-content">
          {loading ? (
            <p>Loading referral information...</p>
          ) : (
            <>
              <h3 className="referral-title">
                Refer A Friend And You’ll Both Get Rewarded!
              </h3>
              <p className="referral-description">
                Get an instant ₹100 voucher to use on Task Tigers' trusted
                services. Share your referral code with your friends and start
                saving today!
              </p>
              <div className="referral-banner">
                <img src={ReferraBanner} alt="Refer a Friend" />
              </div>
              <p className="share-via">Share Via:</p>
              <div className="referral-icons">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    templateMessage,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-wrapper whatsapp"
                >
                  <FaWhatsapp size={18} />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${referralLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-wrapper facebook"
                >
                  <FaFacebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    templateMessage,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-wrapper twitter"
                >
                  <FaTwitter size={18} />
                </a>
                <a
                  href={`https://t.me/share/url?url=${referralLink}&text=${encodeURIComponent(
                    templateMessage,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-wrapper telegram"
                >
                  <FaTelegram size={18} />
                </a>
                <a
                  href={`mailto:?subject=Check this out&body=${encodeURIComponent(
                    templateMessage,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-wrapper email"
                >
                  <FaEnvelope size={18} />
                </a>
              </div>
              <p className="referral-link">
                {referralLink || "Generating referral link..."}
              </p>
              <button onClick={handleCopy} className="copy-button">
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
