import React, { useState, useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import Slider from "react-slick";
import "./applianceRepair.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CategoryContext } from "../../../context/CategoryContext";

const ApplianceRepair = () => {
  const [applianceData, setApplianceData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { locationCat, setSelectedCategoryId, setServingLocations } =
    useContext(CategoryContext);

  const navigate = useNavigate();

  // Fetch appliance data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://appsvc-apibackend-dev.azurewebsites.net/v1.0/admin/user-banners/appliance",
        );
        const data = await response.json();
        setApplianceData(data);
      } catch (error) {
        console.error("Error fetching appliance data:", error);
      }
    };
    fetchData();
  }, []);

  // Custom Next Arrow
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        
        className={`${className} appliance-custom-next-arrow`}
        style={{ ...style, right: "-1.5rem" ,  backgroundImage: `url(${IMAGE_BASE_URL})/nextarrow-2.png`}}
        onClick={onClick}
      ></div>
    );
  };

  // Custom Prev Arrow
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} appliance-custom-prev-arrow`}
        style={{ ...style, left: "-1.7rem", zIndex: 2 ,  backgroundImage: `url(${IMAGE_BASE_URL})/prevarrow-2.png` }}
        onClick={onClick}
      ></div>
    );
  };

  const handleCategory = (id) => {
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === id,
    );
    if (isCategoryInLocation) {
      setSelectedCategoryId(id);
      navigate("/services");
    } else {
      setServingLocations(false);
      navigate("/services");
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4.5,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    afterChange: (index) => setCurrentIndex(index),
    initialSlide: 0, // Ensure it starts at the first slide
    responsive: [
      { breakpoint: 1244, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 850, settings: { slidesToShow: 2.5, slidesToScroll: 1 } },
      { breakpoint: 700, settings: { slidesToShow: 2.3, slidesToScroll: 1 } },
      { breakpoint: 560, settings: { slidesToShow: 2.0, slidesToScroll: 1 } },
      { breakpoint: 500, settings: { slidesToShow: 1.8, slidesToScroll: 1 } },
      { breakpoint: 430, settings: { slidesToShow: 1.6, slidesToScroll: 1 } },
      { breakpoint: 390, settings: { slidesToShow: 1.3, slidesToScroll: 1 } },
      { breakpoint: 360, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="appliance-repair-main-con">
      <h2>AC & Appliance Repair</h2>
      {/* Conditionally render slider only when data is available */}
      {applianceData.length > 0 ? (
        <Slider {...settings} className="appliance-repair-slider">
          {applianceData.map((service) => (
            <div
              key={service._id}
              className="appliance-repair-item"
              onClick={() => handleCategory("6701477d6cdbd8a62eb1bb05")}
            >
              <div className="appliance-repair-image">
                <img
                  src={service.image}
                  alt={service.service}
                  className="carousel-image"
                />
              </div>
              <div className="appliance-repair-name">{service.service}</div>
            </div>
          ))}
        </Slider>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ApplianceRepair;
