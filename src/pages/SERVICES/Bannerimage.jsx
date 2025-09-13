import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from '../../context/CategoryContext';
import './Services.css'

const Bannerimage = () => {
  const navigate = useNavigate();
  const { selectedSubCategoryId } = useContext(CategoryContext);
  const [subcatImage, setSubcatImage] = useState([]);

  const fetchsubcatImage = async () => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
    try {
      const response = await fetch(
        `${AZURE_BASE_URL}/v1.0/admin/subcategory-banner/${selectedSubCategoryId}`
      );
      const data = await response.json();

      console.log("subcat image response:", data);

      // Filter the correct subcategory from the response
      const filteredData = data?.data?.filter(item => item.subCategoryId === selectedSubCategoryId);

      if (filteredData.length > 0) {
        setSubcatImage(filteredData);
      } else {
        setSubcatImage([]); // Reset if no matching data
      }

    } catch (err) {
      console.log("Error fetching subcategory image:", err);
    }
  };

  useEffect(() => {
    if (selectedSubCategoryId) {
      fetchsubcatImage();
    }
  }, [selectedSubCategoryId]);

  useEffect(() => {
    console.log(subcatImage, "Updated subcatImage state");
  }, [subcatImage]);

  return (
    <div className='sub-cat-banner-image'>
      {subcatImage.length > 0 ? (
        <img src={subcatImage[0].image} alt="banner-image" />
      ) : (
        <p>No image available</p>
      )}
    </div>
  );
};

export default Bannerimage;
