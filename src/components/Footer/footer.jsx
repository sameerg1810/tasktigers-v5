import React, { useContext, useEffect, useState } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useLocationPrice } from "../../context/LocationPriceContext";
import { useNavigate } from "react-router-dom";
const logo = `${IMAGE_BASE_URL}/new-logo.png`;
const facebook = `${IMAGE_BASE_URL}/facebook.png`;
const x = `${IMAGE_BASE_URL}/x.png`;
const linkedin = `${IMAGE_BASE_URL}/linkedin.png`;
const instagram = `${IMAGE_BASE_URL}/instagram.png`;
const payments = `${IMAGE_BASE_URL}/payments.png`;
import "./footer.css";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { SubscribeContext } from "../../context/Subscribe";
import { useAuth } from "../../context/AuthContext";
const playstore = `${IMAGE_BASE_URL}/playstore.svg`;
const applestore = `${IMAGE_BASE_URL}/app-store.svg`;

const Footer = () => {
  const navigate = useNavigate();
  const { handleChange, text, errors, successMessage, handleSubscribe } =
  useContext(SubscribeContext);
  
      useEffect(()=>{
          console.log(errors,successMessage,'error in footer')
      },[errors,successMessage])

  const { fetchGeocodeData } = useLocationPrice();
  const [showLocations, setShowLocations] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { updateUserLocation } = useAuth(); // Access AuthContext to update location
  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const checkMobileWidth = () => {
    const mobileCheck = window.innerWidth >= 360 && window.innerWidth <= 600;
    setIsMobile(mobileCheck);

    console.log(mobileCheck, "is mobile"); // Log the result of the check
  };

  useEffect(() => {
    // Check the width on mount
    checkMobileWidth();

    // Add event listener to check on resize
    window.addEventListener("resize", checkMobileWidth);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", checkMobileWidth);
    };
  }, []);

  const toggleLocations = () => {
    setShowLocations(!showLocations);
  };

  const handleDistrictClick = async (district) => {
    console.log(`Footer: Selected district is ${district}`);

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${district}.json?country=in&limit=1&access_token=${MAPBOX_ACCESS_TOKEN}`,
      );

      if (response.data.features.length > 0) {
        const coordinates = response.data.features[0].geometry.coordinates;
        const latitude = coordinates[1];
        const longitude = coordinates[0];

        // Update location globally via AuthContext
        await updateUserLocation(latitude, longitude, district);

        console.log(
          `Footer: Location updated to ${district} (${latitude}, ${longitude})`,
        );

        // Optional: Fetch additional geocode data
        await fetchGeocodeData(latitude, longitude);
        console.log(`Footer: Additional geocode data fetched.`);
      } else {
        console.warn(`Footer: No coordinates found for ${district}`);
      }
    } catch (error) {
      console.error(`Footer: Error fetching location for ${district}`, error);
    }
  };

  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `${AZURE_BASE_URL}/v1.0/core/locations/getalldistricts`,
        );
        setDistricts(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load districts. Please try again later.");
        console.error("Error fetching districts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  // Conditional rendering based on the route and screen size
  if ( isMobile) {
    return (
      <div className="main-footer">
        <div className="top-footer">
          <div >
            <div
              className="t-logo"
              onClick={() => {
                navigate("/");
              }}
            >
              <img src={logo} alt="logo" />
            </div>

            <div className="t-inputs">
              <div className="emaildrop">
                <input
                  className="input"
                  type="email"
                  placeholder=" Email / Phone No"
                  aria-label="Email or Phone Input"
                  value={text}
                  onChange={handleChange}
                />
              </div>
              <div>
                <button
                  className="t-button"
                  onClick={handleSubscribe}
                  aria-label="Subscribe Button"
                >
                  SUBSCRIBE
                </button>
              </div>
            </div>
            {errors && (
              <p style={{ color: "red", marginTop: "-10px" }}>{errors}</p>
            )}
          </div>
          <div className="play">
            <div className="play-apple">
              <p>Download App</p>
              <div className="p-a-store">
                <img src={playstore} alt="playstore" />
                <img src={applestore} alt="applestore" />
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-footer">
          <div className="first-footer">
            <div>
              <p>OUR COMPANY</p>
              <li
                onClick={() => {
                  navigate("/aboutus");
                }}
              >
                About us
              </li>
              <li
                onClick={() => {
                  navigate("/reviews");
                }}
              >
                Reviews
              </li>
              <li
                onClick={() => {
                  navigate("/contact");
                }}
              >
                Contact us
              </li>
              <li
                onClick={() => {
                  navigate("/careers");
                }}
              >
                Careers
              </li>
              <li className="seemore" onClick={toggleLocations}>
                {showLocations ? "Hide locations" : "Serving locations"}
              </li>
            </div>
            <div>
              <p>OUR SERVICES</p>
              <li onClick={() => navigate("/services")}>Cleaning</li>
              <li onClick={() => navigate("/services")}>Plumbing</li>
              <li onClick={() => navigate("/services")}>Carpentry</li>
              <li onClick={() => navigate("/services")}>...more</li>
            </div>
            <div>
              <p
                onClick={() => {
                  navigate("/register-as-a-professional");
                }}
              >
                RGISTER AS A PROFESSIONAL
              </p>
              <li
                onClick={() => {
                  navigate("/privacypolicy");
                }}
              >
                Refund policy
              </li>
              <li
                onClick={() => {
                  navigate("/privacypolicy");
                }}
              >
                Privacy policy
              </li>
              <li
                onClick={() => {
                  navigate("/privacypolicy");
                }}
              >
                Welfare policy
              </li>
              <li onClick={() => navigate("/blogs")}>Blogs</li>
              <li onClick={() => navigate("/terms")}>Terms & Conditions</li>
            </div>
          </div>

          <div className="last-footer">
            <div className="followus">
              <p className="follow-us">Follow us</p>
              <div className="s-m-icons">
                <div className="s-m-i">
                  <img src={facebook} alt="Facebook" />
                </div>
                <div className="s-m-i">
                  <img src={instagram} alt="Instagram" />
                </div>
                <div className="s-m-i">
                  <img src={x} alt="X" />
                </div>
                <div className="s-m-i">
                  <img src={linkedin} alt="LinkedIn" />
                </div>
              </div>
            </div>
            <div className="payment">
              <p>Payment options</p>
              <img src={payments} alt="payments" />
            </div>
          </div>
        </div>

        {showLocations && (
          <div className="locations">
            {loading && <p>Loading locations...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && districts.length > 0 && (
              <>
                {districts.map((district, index) => (
                  <p
                    key={index}
                    onClick={() => handleDistrictClick(district)}
                    className="district-item"
                    role="button"
                    aria-label={`Select ${district}`}
                  >
                    {district}
                  </p>
                ))}
              </>
            )}
            {!loading && !error && districts.length === 0 && (
              <p>No locations available.</p>
            )}
          </div>
        )}
      </div>
    );
  } else if (!isMobile) {
    // new code
    return (
      <>
        <div className="main-footer">
          <div className="left-footer">
            <div className="top-left-footer">
              <div
                className="t-logo"
                onClick={() => {
                  navigate("/");
                }}
              >
                <img src={logo} alt="logo" />
              </div>
              <div className="t-inputs">
                <div className="emaildrop">
                  <input
                    className="input"
                    type="email"
                    placeholder="Email / Phone No"
                    aria-label="Email or Phone Input"
                    value={text}
                    onChange={handleChange} // Handle input change
                  />
                </div>

                <div>
                  <button
                    className="t-button"
                    onClick={handleSubscribe} // Handle subscription on button click
                    aria-label="Subscribe Button"
                    disabled={loading} // Disable the button while loading
                  >
                    {loading ? "Subscribing..." : "SUBSCRIBE"} {/* Show loading text */}
                  </button>
                </div>
              </div>
            </div>
            <div className="bottom-left-footer">
            <div>
              <p className="footer-head">OUR COMPANY</p>
              <li
                onClick={() => {
                  navigate("/aboutus");
                }}
              >
                About us
              </li>
              <li
                onClick={() => {
                  navigate("/reviews");
                }}
              >
                Reviews
              </li>
              <li
                onClick={() => {
                  navigate("/contact");
                }}
              >
                Contact us
              </li>
              <li
                onClick={() => {
                  navigate("/careers");
                }}
              >
                Careers
              </li>
              <li className="seemore" onClick={toggleLocations}>
                {showLocations ? "Hide locations" : "Serving locations"}
              </li>
            </div>
            {/* 2nd column */}
            <div>
              <div>
                <p className="footer-head">OUR SERVICES</p>
                <li onClick={() => navigate("/services")}>Cleaning</li>
                <li onClick={() => navigate("/services")}>Plumbing</li>
                <li onClick={() => navigate("/services")}>Carpentry</li>
                <li onClick={() => navigate("/services")}>...more</li>
              </div>
            </div>
            {/* 3rd column */}
            <div>
               <p className="footer-head" onClick={() => navigate("/terms")}>Terms and  Policies</p>
              <li onClick={() => navigate("/privacypolicy")}>Refund policy</li>
              <li onClick={() => navigate("/privacypolicy")}>Privacy policy</li>
              <li onClick={() => navigate("/privacypolicy")}>Welfare policy</li>
              <li onClick={() => navigate("/blogs")}>Blogs</li>
              
            </div>
            </div>
          </div>
          <div className="right-footer">
          <p onClick={()=>{navigate('/register-as-a-professional')}} className="registerap">Register as a Professional</p>
          <div className="followus">
              <p className="follow-us">Follow us</p>
              <div className="s-m-icons">
                <div className="s-m-i">
                  <img src={facebook} alt="Facebook" />
                </div>
                <div className="s-m-i">
                  <img src={instagram} alt="Instagram" />
                </div>
                <div className="s-m-i">
                  <img src={x} alt="X" />
                </div>
                <div className="s-m-i">
                  <img src={linkedin} alt="LinkedIn" />
                </div>
              </div>
          </div>
          <div className="playstore">
              <p>Download Our App</p>
              <div className="playstore-img">
                <img src={playstore} alt="playstore logo"/>
                <img src={applestore} alt="playstore logo"/>
              </div>
          </div>


          </div>

        </div>
      </>
    );
  }

  return null;
};

export default Footer;
