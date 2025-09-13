import React, { useContext } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "./womenSaloon.css";
const  Waxing = `${IMAGE_BASE_URL}/Waxing.svg`;
const  Pedicure = `${IMAGE_BASE_URL}/Pedicure.svg`;
const  Manicure = `${IMAGE_BASE_URL}/Manicure.svg`;
const  FacialCleaning = `${IMAGE_BASE_URL}/Facial.svg`;
const  Haircare = `${IMAGE_BASE_URL}/HairCare.svg`;
import { useNavigate } from "react-router-dom";
import { CategoryContext } from "../../../context/CategoryContext";

const spaWomenServiceData = [
  {
    id: 1,
    name: "Waxing",
    image: Waxing,
  },
  {
    id: 2,
    name: "Pedicure",
    image: Pedicure,
  },
  {
    id: 3,
    name: "Manicure",
    image: Manicure,
  },
  {
    id: 4,
    name: "Facial & Cle..",
    image: FacialCleaning,
  },
  {
    id: 5,
    name: "Hair care",
    image: Haircare,
  },
];
const WomenSloon = () => {
  const {
    categoryData,
    locationCat,
    setSelectedCategoryId,
    setServingLocations,
    servingLocations,
  } = useContext(CategoryContext);
  const navigate = useNavigate();

  const handleCategory = (id) => {
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === id,
    );
    if (isCategoryInLocation) {
      setSelectedCategoryId(id);
      navigate("/services");
    } else {
      setServingLocations(false);
      navigate("/notserving");
    }
    setIstoggle(false);
  };
  return (
    <>
      <h2 className="w-s-headding">Saloon for Women</h2>
      <div className="women-saloon-main-con">
        {spaWomenServiceData.map((item) => (
          <div
            onClick={() => handleCategory("6701477d6cdbd8a62eb1bafd")}
            key={item.id}
            className="w-s-sub-con"
          >
            <p>{item.name}</p>
            <img src={item.image} alt="saloon" />
          </div>
        ))}
      </div>
    </>
  );
};

export default WomenSloon;
