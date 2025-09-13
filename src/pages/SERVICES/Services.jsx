import React, { useContext, useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "./Services.css";
import { CategoryContext } from "../../context/CategoryContext";
const bannerimage = `${IMAGE_BASE_URL}/all-components-banner.png`;
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import LoginComponent from "../../components/LoginComponent";
import ReactDOM from "react-dom";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@mui/material";
import { Diversity1Outlined, Diversity1Sharp } from "@mui/icons-material";
import FAQ from "./FAQ";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const InfoIcon = `${IMAGE_BASE_URL}/info.svg`;
import Bannerimage from "./Bannerimage";
import CancelIcon from '@mui/icons-material/Cancel';

const Services = () => {
  const navigate = useNavigate();
  const {
    categoryData,
    locationCat,
    locationSubCat,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedSubCategoryId,
    setSelectedSubCategoryId,
    locationServices = [],
  } = useContext(CategoryContext);
  const { isAuthenticated, hasMembership, userId } = useAuth();
  const { handleCart } = useContext(CartContext);

  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeVariant, setActiveVariant] = useState("");
  const [addedServices, setAddedServices] = useState({});
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [varientSubCategories, setVarientSubCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [inclusiondata, setInclusiondata] = useState(null);
  const [activeTab, setActiveTab] = useState("inclusions");


  // State for handling the popup visibility and selected service
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // State for confirmation popup visibility
  const [isAddedPopupVisible, setAddedPopupVisible] = useState(false);

  // categories length function
  const handleViewMore = () => {
    setShowAllCategories(!showAllCategories);
  };
  const [isLoginVisible, setLoginVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const subCategories = locationSubCat.filter(
      (subCat) =>
        subCat.categoryId === selectedCategoryId &&
        subCat.variantName === activeVariant,
    );
    setFilteredSubCategories(subCategories);
    setActiveIndex(null);
    setSelectedSubCategoryId("");
  }, [selectedCategoryId, locationSubCat, activeVariant]);

  useEffect(() => {
    if (filteredSubCategories.length > 0 && !selectedSubCategoryId) {
      const firstSubCategory = filteredSubCategories[0];
      setSelectedSubCategoryId(firstSubCategory._id);
      setActiveSubCategory(firstSubCategory.name);
      setActiveIndex(0);
    }
  }, [filteredSubCategories, selectedSubCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      handleCategoryClick(selectedCategoryId);
    }
  }, [selectedCategoryId]);



  const handleCategoryClick = (id) => {
    setShowDropdown(false);

    // Check if the category is in the selected location.
    const isCategoryInLocation = locationCat?.some((locCat) => locCat._id === id);

    if (isCategoryInLocation) {
      setSelectedCategoryId(id);
      localStorage.setItem('selectedCategoryId', id); // Persist selectedCategoryId in localStorage

      const selectedCategory = categoryData.find((cat) => cat._id === id);
      if (selectedCategory && selectedCategory.uiVariant) {
        setSelectedVariants(selectedCategory.uiVariant);
      }
    }
  };

  useEffect(() => {
    const persistedCategoryId = localStorage.getItem('selectedCategoryId'); // Retrieve selectedCategoryId from localStorage
    console.log(persistedCategoryId, 'sessioncatid')
    if (persistedCategoryId) {
      handleCategoryClick(persistedCategoryId)
    }
  }, [locationCat, navigate]);

  //  set first one as active varient by defaultly
  useEffect(() => {
    if (selectedVariants.length > 0) {
      setActiveVariant(selectedVariants[0]);
    } else {
      setActiveVariant("");
    }
  }, [selectedVariants, selectedCategoryId]);

  // chnage selected varients
  const handleVariantClick = (variant) => {
    // console.log(variant, "selected varient");
    setActiveVariant(variant);
  };


  //add to cart functionality

  const handleAddToCart = (serviceId, categoryId, subCategoryId, priceToUse) => {
    if (!isAuthenticated) {
      setLoginVisible(true); // Trigger login modal visibility
      return;
    }

    // Add the item to the cart and check if it was successfully added
    const addedToCart = handleCart(serviceId, categoryId, subCategoryId, priceToUse);
    
    // Show toast notification


  };

  // Popup functionality
  const handleServiceClick = (service, serviceid) => {
    setSelectedService(service);
    setPopupVisible(true);
    setSelectedServiceId(serviceid);
  };

  // fetching inclusion and exclusion data
  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const fetchinclusion = async () => {
      try {
        const response = await fetch(
          `${AZURE_BASE_URL}/v1.0/core/inclusion-exclusion/service/${selectedServiceId}`,
        );

        // Await the JSON response
        const data = await response.json();

        // Set the resolved data in state
        setInclusiondata(data);
        console.log(data, "inclusiondata"); // Log the resolved data for debugging
      } catch (err) {
        console.warn(err); // Log the error for debugging
      }
    };

    if (selectedServiceId) {
      fetchinclusion(); // Call the function only if selectedServiceId is valid
    }
  }, [selectedServiceId]);


  const closePopup = () => {
    setPopupVisible(false);
    setSelectedService(null);
  };

  const closeAddedPopup = () => {
    setAddedPopupVisible(false);
  };

  const handleAddFromPopup = (service) => {
    // Add service to cart and close the popup
    handleCart(
      service._id,
      service.categoryId._id,
      service.subCategoryId._id,
      2,
    );
    setAddedPopupVisible(true); // Show confirmation popup
    setPopupVisible(false); // Close the service popup
    console.log(
      "cart added items",
      serviceId,
      categoryId,
      subCategoryId,
      priceToUse,
    );
  };

  const closeModal = () => {
    setLoginVisible(false); // Close login modal
  };



  return (
    <div className="services">
      {/* LoginComponent Modal */}
      {isLoginVisible &&
        document.getElementById("modal-root") &&
        ReactDOM.createPortal(
          <div className="modalOverlay" onClick={closeModal}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
              <LoginComponent onLoginSuccess={closeModal} />
            </div>
          </div>,
          document.getElementById("modal-root"),
        )}

      {/* mobile category disply */}
      <div className="mobile-cat-display">
        {categoryData &&
          categoryData
            // Move the selected category to the top
            .sort((a, b) => {
              if (a._id === selectedCategoryId) return -1;
              if (b._id === selectedCategoryId) return 1;
              return a.slno - b.slno; // Sort the rest by slno
            })
            .map((item) => (
              <div className="cat-list-ser-page" key={item._id}>
                <p
                  onClick={() => handleCategoryClick(item._id)}
                  style={{
                    fontWeight: selectedCategoryId === item._id ? "bold" : "normal",
                  }}
                >
                  {item.name}
                </p>
              </div>
            ))}
      </div>


      {/* Top category display */}

      <div className="cat-ser-page">
        {/* Render initial categories or limited view */}
        {categoryData &&
          [
            ...categoryData.filter((item) => item._id === selectedCategoryId), // Selected category
            ...categoryData
              .filter((item) => item._id !== selectedCategoryId)
              .sort((a, b) => a.slno - b.slno), // Rest sorted by slno
          ]
            .slice(0, 6) // Limit the combined array to 6 items
            .map((item) => (
              <div className="cat-list-ser-page" key={item._id}>
                <p
                  onClick={() => handleCategoryClick(item._id)}
                  style={{
                    fontWeight: selectedCategoryId === item._id ? "bold" : "normal",
                  }}
                >
                  {item.name}
                </p>
              </div>
            ))}


        {/* View More/Less button */}
        <p className="view-more" onClick={toggleDropdown}>
          {showDropdown ? "View Less" : "View More"}
        </p>

        {/* Dropdown for all categories */}
        {showDropdown && (
          <div className="dropdown-container">
            {categoryData &&
              categoryData
                .sort((a, b) => a.slno - b.slno)
                .map((item) => (
                  <div className="dropdown-item" key={item._id}>
                    <p
                      onClick={() => handleCategoryClick(item._id)}
                      style={{
                        fontWeight:
                          selectedCategoryId === item._id ? "bold" : "normal",
                      }}
                    >
                      {item.name}
                    </p>
                  </div>
                ))}
          </div>
        )}
      </div>

      {/* mobile varients display */}
      {selectedVariants != "None" && (
        <div className="ui-varients-main-con-mobile">
          {selectedVariants.map((variant, index) => (
            <div
              key={index}
              className={`variant-item ${activeVariant === variant ? "active-variant" : ""
                }`}
              onClick={() => handleVariantClick(variant)}
            >
              {variant}
            </div>
          ))}
        </div>
      )}

      {/* Subcategories and services display */}
      <div className="subcat-service-display">
        <div className="subcat-display">
          {filteredSubCategories &&
            filteredSubCategories
              .sort((a, b) => a.slno - b.slno)
              .map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item._id}
                    className={`subcat-sub-con ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setActiveIndex(index);
                      setActiveSubCategory(item.name);
                      setSelectedSubCategoryId(item._id);
                    }}
                  >
                    <img src={item.imageKey} alt="subcat image" />
                    <p>
                      {item.name.length > 100
                        ? `${item.name.slice(0, 120)}...`
                        : item.name}
                    </p>
                  </div>
                );
              })}
        </div>

        {/* Display selected category variants */}
        <div className="services-con">
          {selectedVariants != "None" && (
            <div className="ui-varients-main-con">
              {selectedVariants.map((variant, index) => (
                <div
                  key={index}
                  className={`variant-item ${activeVariant === variant ? "active-variant" : ""
                    }`}
                  onClick={() => handleVariantClick(variant)}
                >
                  {variant}
                </div>
              ))}
            </div>
          )}

          <div className="banner-image">
            <Bannerimage />
          </div>

          <div className="service-display">
            {locationServices.map((item) => {
              const isAdded = addedServices[item.service._id];
              return (
                <div className="services-sub-dispaly" key={item.service._id}>
                  <div className="service-image">
                    <img
                      src={item.service.image}
                      alt="service image"

                    />
                    <div onClick={() => handleServiceClick(item, item.service._id)} className="moreinfo"><img src={InfoIcon} alt="info" /></div>
                  </div>

                  <p className="service-name">
                    {item.service.name.length > 100
                      ? `${item.service.name.slice(0, 100)}...`
                      : item.service.name}
                  </p>


                  <div className="price">


                    <p className="service-price">
                      {item.districtPrice.offerPrice &&
                        Object.keys(item.districtPrice.offerPrice).length > 0 &&
                        item.districtPrice.offerPrice[activeVariant] &&
                        item.districtPrice.offerPrice[activeVariant] <
                        (item.districtPrice.price[activeVariant] || Infinity) ? (
                        <>
                          <span style={{ textDecoration: "line-through", marginRight: "8px" }}>
                            &#8377; {item.districtPrice.price[activeVariant] || "N/A"}
                          </span>
                          <span>
                            &#8377; {item.districtPrice.offerPrice[activeVariant]}
                          </span>
                        </>
                      ) : (
                        <span>
                          &#8377; {item.districtPrice.price[activeVariant] || "N/A"}
                        </span>
                      )}
                    </p>

                  </div>
                  <div
                    onClick={() => {
                      const { offerPrice = {}, price = {} } = item.districtPrice || {};
                      const priceToUse =
                        offerPrice[activeVariant] &&
                          offerPrice[activeVariant] < (price[activeVariant] || Infinity)
                          ? offerPrice[activeVariant]
                          : price[activeVariant] || 0; // Fallback to 0 if no price is available

                      handleAddToCart(
                        item.service._id,
                        item.service.categoryId._id,
                        item.service.subCategoryId._id,
                        priceToUse
                      );
                    }}
                  >
                    <div
                      className="add-button"
                    >
                      ADD
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Detail Popup */}

      {isPopupVisible && selectedService && (
        
        <div className="popup-overlay" onClick={closePopup}>
           
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <div className="title-close">
          <h2 className="popup-title">{selectedService.service.name}</h2>
          <div onClick={closePopup}>
            <CancelIcon/>
            {/* cancel */}
          </div>
          </div>
           
            <div className="popup-body">
           
              <div className="popup-image">
                <img src={selectedService.service.image} alt="service image" />
              </div>
              <div className="popup-description">
                <p>{selectedService.service.description}</p>
                {/* <p>Price: &#8377; {selectedService.districtPrice.price[activeVariant] || "N/A"}</p> */}
                <span style={{ textDecoration: "line-through", marginRight: "40px" }}>
                            &#8377; {selectedService.districtPrice.price[activeVariant] || "N/A"}
                </span>
                          <span>
                            &#8377; {selectedService.districtPrice.offerPrice[activeVariant]}
                </span>
              </div>
            </div>
           

            {/* Inclusion and Exclusion Tabs */}
            {/* Inclusion and Exclusion Tabs */}
            {(inclusiondata?.[0]?.inclusions?.length > 0 ||
              inclusiondata?.[0]?.exclusions?.length > 0) && (
                <div className="popup-inclusion">
                  <div className="tabs-container">
                    <div className="tabs">
                      {inclusiondata?.[0]?.inclusions?.length > 0 && (
                        <button
                          className={`tab-button ${activeTab === "inclusions" ? "active" : ""}`}
                          onClick={() => setActiveTab("inclusions")}
                        >
                          Inclusions
                        </button>
                      )}
                      {inclusiondata?.[0]?.exclusions?.length > 0 && (
                        <button
                          className={`tab-button ${activeTab === "exclusions" ? "active" : ""}`}
                          onClick={() => setActiveTab("exclusions")}
                        >
                          Exclusions
                        </button>
                      )}
                    </div>

                    <div className="tab-content">
                      {activeTab === "inclusions" &&
                        inclusiondata?.[0]?.inclusions?.length > 0 && (
                          <div className="inclusion-list">
              
                            {inclusiondata[0].inclusions.map((item, index) => (
                              <div key={index} className="list-item-inclusion">
                                <p>&bull; {item}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      {activeTab === "exclusions" &&
                        inclusiondata?.[0]?.exclusions?.length > 0 && (
                          <div className="exclusion-list">
        
                            {inclusiondata[0].exclusions.map((item, index) => (
                              <div key={index} className="list-item-inclusion">
                                <p>&bull; {item}</p>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

            <div className="faq-tabs">
              <FAQ serviceId={selectedServiceId} />
            </div>

            <div className="popup-buttons">
            <button
  className="add-to-cart-popup"
  onClick={() => {
    const { offerPrice = {}, price = {} } = selectedService.districtPrice || {};

    const priceToUse =
      offerPrice[activeVariant] &&
      offerPrice[activeVariant] < (price[activeVariant] || Infinity)
        ? offerPrice[activeVariant]
        : price[activeVariant] || 0; // Fallback to 0 if no price is available

    handleAddToCart(
      selectedService.service._id,
      selectedService.service.categoryId._id,
      selectedService.service.subCategoryId._id,
      priceToUse
    );

    // Close popup after adding to cart
    closePopup();
  }}
>
  Add to Cart
</button>

              <button className="close-popup" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
