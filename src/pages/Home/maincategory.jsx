import React, { useContext, useEffect, useState } from "react";
import "./maincategory.css";
import { useNavigate } from "react-router-dom";
import { CategoryContext } from "../../context/CategoryContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Homecarousel from "./Home_carousel";

const Maincategory = () => {
  const navigate = useNavigate();
  const { categoryData, locationCat, setSelectedCategoryId ,setServingLocations , servingLocations,selectedCategoryId } =
    useContext(CategoryContext);
  const [data, setData] = useState(null);


  useEffect(() => {
    if (categoryData) {
      setData(categoryData);
    }
  }, [categoryData]);

  const handleCategory = (id) => {
    console.log(id,'categoryid')
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === id,
    );
    if (isCategoryInLocation) {
     
      setSelectedCategoryId(id);
      navigate("/services");
    } 
    else{
     
      navigate('/notserving')
    }
  };


  useEffect(()=>{
    console.log(categoryData,'slno')
    console.log(selectedCategoryId,'selected')
     
  },[setSelectedCategoryId])

  return (
    <>
       <p className='main-text'>The best home cleaning services</p>
      <div className="task-tigers">
        <div className="main-category-con">
          {data &&
            data
              .sort((a, b) => a.slno - b.slno) // Sort the data based on slno
              .slice(0, 8)
              .map((item, index) => (
                <React.Fragment key={item._id}>
                  <div
                    className="sub-cat-con"
                    onClick={() => handleCategory(item._id)}
                  >
                    <div className="main-cat-img">
                      <img src={item.imageKey} alt={item.name} />
                    </div>
                    <div className="main-cat-service-content">
                      <p>{item.name}</p>
                    </div>
                  </div>

                  {/* Add "View All Categories" button at 9th place */}
                  {index === 7 && (
                    <div
                      className="sub-cat-con view-all-button"
                      onClick={() => {
                        navigate('/all-categories');
                      }}
                    >
                      <div className="view-all-content">
                        <p>View All Categories</p>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

        </div>

        <div className="carousel-con">
              <Homecarousel/>
        </div>
      </div>
     
    </>
  );
};

export default Maincategory;
