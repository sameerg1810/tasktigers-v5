import React, { useEffect, useRef, useState } from "react";
import "./Profile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMapMarkerAlt,
  faClipboardList,
  faBoxOpen,
  faTag,
  faBell,
  faSignOutAlt,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "./user-profile";
import Addresses from "./ADDRESSES/addresses";
import Bookings from "./BOOKINGS/Bookings";
import Packages from "./PACKAGES/Packages";
import Coupons from "./COUPONS/Coupons";
import Notifications from "./NotificationsPage";
import MobileProfile from "./MobileProfile";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import ReferralCard from "./REFERRAL-PAGE/ReferralCard";

const Profile = () => {
  const [activeRoute, setActiveRoute] = useState(
    "userprofile" || localStorage.getItem("activeSidebarPath"),
  );
  const [isMobileView, setIsMobileView] = useState(false);
  const activePathRef = useRef(activeRoute);
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(
        window.matchMedia("(min-width: 360px) and (max-width: 600px)").matches,
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("activeSidebarPath", activePathRef.current);
  }, [activeRoute]);

  const handleNavClick = (path) => {
    if (path === "logout") {
      confirmAlert({
        title: "Confirm Logout",
        message: "Are you sure you want to log out?",
        buttons: [
          {
            label: "Yes",
            onClick: () => logout(),
          },
          {
            label: "No",
          },
        ],
      });
    } else {
      setActiveRoute(path);
    }
    activePathRef.current = path;
    setActiveRoute(path);
  };

  const renderComponent = () => {
    if (isMobileView && activeRoute === "userprofile") {
      return <MobileProfile />;
    }

    switch (activeRoute) {
      case "userprofile":
        return <UserProfile />;
      case "addresses":
        return <Addresses />;
      case "bookings":
        return <Bookings />;
      case "packages":
        return <Packages />;
      case "coupons":
      case "coupon-view":
        return <Coupons />;
      case "notifications":
        return <Notifications />;
      case "referral":
        return <ReferralCard />;
      default:
        return <div>Please select a valid option from the sidebar.</div>;
    }
  };
  return (
    <div className="user-profile">
      <div className="sidebar">
        <ul>
          <li>
            <button
              className={activeRoute === "userprofile" ? "active" : ""}
              onClick={() => handleNavClick("userprofile")}
            >
              <FontAwesomeIcon icon={faUser} className="icon" /> Account
            </button>
          </li>
          <li>
            <button
              className={activeRoute === "addresses" ? "active" : ""}
              onClick={() => handleNavClick("addresses")}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" /> My
              Addresses
            </button>
          </li>
          <li>
            <button
              className={activeRoute === "bookings" ? "active" : ""}
              onClick={() => handleNavClick("bookings")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="icon" /> My
              Bookings
            </button>
          </li>
          <li>
            <button
              className={activeRoute === "packages" ? "active" : ""}
              onClick={() => handleNavClick("packages")}
            >
              <FontAwesomeIcon icon={faBoxOpen} className="icon" /> My Packages
            </button>
          </li>
          <li>
            <button
              className={
                activeRoute === "coupons" || activeRoute === "coupon-view"
                  ? "active"
                  : ""
              }
              onClick={() => handleNavClick("coupons")}
            >
              <FontAwesomeIcon icon={faTag} className="icon" /> My Coupons
            </button>
          </li>
          <li>
            <button
              className={activeRoute === "notifications" ? "active" : ""}
              onClick={() => handleNavClick("notifications")}
            >
              <FontAwesomeIcon icon={faBell} className="icon" /> My
              Notifications
            </button>
          </li>
          <li>
            <button
              className={activeRoute === "referral" ? "active" : ""}
              onClick={() => handleNavClick("referral")}
            >
              <FontAwesomeIcon icon={faGift} className="icon" /> My Refferals
            </button>
          </li>
          <li>
            <button onClick={() => handleNavClick("logout")}>
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Log Out
            </button>
          </li>
        </ul>
      </div>
      <div className="profile-route">{renderComponent()}</div>
    </div>
  );
};

export default Profile;
