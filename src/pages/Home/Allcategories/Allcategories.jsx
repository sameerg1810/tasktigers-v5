import React, { useEffect, useState, useContext } from 'react';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import './Allcategories.css';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from '../../../context/CategoryContext';
const Banner = `${IMAGE_BASE_URL}/all-components-banner.png`;

const Allcategories = () => {
  const navigate = useNavigate();
  const { categoryData, locationCat, setSelectedCategoryId, setServingLocations } =
    useContext(CategoryContext);
  const [data, setData] = useState(null);

  // Sync `data` state with `categoryData` from context
  useEffect(() => {
    if (categoryData) {
      setData(categoryData);
    }
  }, [categoryData]);

  const handleCategory = (id) => {
    console.log(id,'catid')
    const isCategoryInLocation = locationCat?.some(
      (locCat) => locCat._id === id
    );
    if (isCategoryInLocation) {
      setSelectedCategoryId(id);
      navigate('/services');
    } else {
      setServingLocations(false);
      navigate('/services');
    }
  };

  return (
    <div className="all-c-container">
      <p className="all-category-headding">Choose your category</p>
      <div className="all-main-category-con">
        {data &&
          data
            .sort((a, b) => a.slno - b.slno) // Sort the data based on slno
       // Slice the first 8 items
            .map((item, index) => (
              <React.Fragment key={item._id}>
                <div
                  className="all-sub-cat-con"
                  onClick={() => handleCategory(item._id)}
                >
                  <div className="all-cat-img">
                    <img src={item.imageKey} alt={item.name} />
                  </div>
                  <div className="main-cat-service-content">
                    <p>{item.name}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
      </div>
      <div className="all-components-banner">
        <img src={Banner} alt="all components banner" />
      </div>
    </div>
  );
};

export default Allcategories;
