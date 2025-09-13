import React, { useContext } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "../Women-saloon/womenSaloon.css";
const  saloon1 = `${IMAGE_BASE_URL}/spa-1.png`;
const  saloon2 = `${IMAGE_BASE_URL}/spa-2.png`;
const  saloon3 = `${IMAGE_BASE_URL}/spa-3.png`;
const  saloon4 = `${IMAGE_BASE_URL}/spa-4.png`;
const Therapy = `${IMAGE_BASE_URL}/Therapy.svg`;
import { useNavigate } from "react-router-dom";
import { CategoryContext } from "../../../context/CategoryContext";

const spaWomenServiceData = [
  {
    id: 1,
    name: "Head massage",
    image: saloon2,
  },
  {
    id: 2,
    name: "Pain relif",
    image: saloon4,
  },
  {
    id: 3,
    name: "Natural skincare",
    image: saloon3,
  },
  {
    id: 4,
    name: "Body massage",
    image: saloon1,
  },
  {
    id: 5,
    name: "Therapy",
    image: Therapy,
  },
];

const SpaWomen = () => {
  const { locationCat, setSelectedCategoryId, setServingLocations } =
    useContext(CategoryContext);
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
  };
  return (
    <>
      <h2 className="w-s-headding">Spa for Women</h2>
      <div className="women-saloon-main-con">
        {spaWomenServiceData.map((item) => (
          <div
            onClick={() => handleCategory("6701477d6cdbd8a62ebbafd")}
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

export default SpaWomen;
