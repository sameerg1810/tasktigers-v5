import React, { useState, useEffect, useContext } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const vip = '${IMAGE_BASE_URL}/vip.svg'
import axios from "axios";
import Slider from "react-slick"; // Import the slider for the carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CartContext } from "../../context/CartContext"; // Import CartContext
import { Tabs } from "antd"; // Import Tabs component from Ant Design
import FAQ from "./FAQ"; // Import the FAQ component
import "./IEpopup.css";

const { TabPane } = Tabs;

const IEpopup = ({ isOpen, onClose, serviceId }) => {
  const [serviceDetails, setServiceDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext); // Access the addToCart function from CartContext

  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    if (isOpen && serviceId) {
      const fetchServiceDetails = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${AZURE_BASE_URL}/v1.0/core/inclusion-exclusion`
          );

          const filteredDetails = response.data.filter(
            (item) => item.serviceId && item.serviceId._id === serviceId
          );

          setServiceDetails(filteredDetails);
        } catch (error) {
          setError("Failed to load service details. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchServiceDetails();
    }
  }, [isOpen, serviceId]);

  const getUniqueDescription = (details) => {
    const descriptions = details.map((item) => item.description || "");
    const nonEmptyDescriptions = descriptions.filter(
      (desc) => desc.trim() !== ""
    );
    const uniqueDescriptions = [...new Set(nonEmptyDescriptions)];
    return uniqueDescriptions.join(". ");
  };
  const settings = {
    dots: true, // Adds navigation dots at the bottom
    infinite: true, // Loop through slides infinitely
    speed: 500, // Speed of the transition between slides
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Enable auto-sliding
    autoplaySpeed: 3000, // Speed of auto-sliding (3 seconds)
    arrows: true, // Enable next/prev buttons
  };

  if (!isOpen || !serviceId) return null;

  return (
    <div className="ie-popup-overlay" onClick={onClose}>
      <div className="ie-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="ie-popup-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="ie-popup-content">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : serviceDetails.length > 0 ? (
            <>
              <h2>{serviceDetails[0].serviceId.name}</h2>
              <div className="service-description">
                {getUniqueDescription(serviceDetails)}.
              </div>
              {/* Auto-Carousel for Banners */}
              {serviceDetails[0].bannerImages &&
              serviceDetails[0].bannerImages.length > 0 ? (
                <Slider {...settings} className="carousel-container">
                  {serviceDetails[0].bannerImages.map((image, index) => (
                    <div key={index}>
                      {image && ( // Check if the image URL exists
                        <img
                          src={image}
                          alt={`Banner ${index + 1}`}
                          className="ie-popup-banner-image"
                        />
                      )}
                    </div>
                  ))}
                </Slider>
              ) : (
                <p>No banners available</p> // Fallback if no banner images are available
              )}
              {/* VIP Membership Section */}
              <div className="vip-membership">
                <img src={vip} alt="VIP Icon" />
                <p>Exclusive VIP Membership Benefits</p>
              </div>
              {/* Start of the Tabs for Inclusions/Exclusions */}
              <Tabs defaultActiveKey="1" className="ie-tabs">
                <TabPane tab="Inclusions" key="1">
                  <div className="ie-tab-content">
                    {serviceDetails[0].inclusions.length > 0 ? (
                      <ul className="ie-list ie-inclusions-list">
                        {serviceDetails[0].inclusions.map(
                          (inclusion, itemIndex) => (
                            <li key={itemIndex} className="ie-list-item">
                              <span className="item-icon">✔️</span>{" "}
                              <span className="item-text">{inclusion}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No Inclusions</p>
                    )}
                  </div>
                </TabPane>
                <TabPane tab="Exclusions" key="2">
                  <div className="ie-tab-content">
                    {serviceDetails[0].exclusions.length > 0 ? (
                      <ul className="ie-list ie-exclusions-list">
                        {serviceDetails[0].exclusions.map(
                          (exclusion, exIndex) => (
                            <li key={exIndex} className="ie-list-item">
                              <span className="item-icon">❌</span>{" "}
                              <span className="item-text">{exclusion}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No Exclusions</p>
                    )}
                  </div>
                </TabPane>
              </Tabs>
              {/* FAQ Component */}
              <FAQ serviceId={serviceId} /> {/* Include the FAQ component */}
            </>
          ) : (
            <p>No service details available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IEpopup;
