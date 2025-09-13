import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import LZString from "lz-string";
import { useLocationPrice } from "../context/LocationPriceContext";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const { customPriceData, districtPriceData } = useLocationPrice();

  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [locationCat, setLocationCat] = useState([]);
  const [locationSubCat, setLocationSubCat] = useState([]);
  const [locationServices, setLocationServices] = useState([]);
  const [locationCustom, setLocationCustom] = useState([]);
  const [servingLocations, setServingLocations] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchedCategoryId, setSearchedCategoryId] = useState(null);
  const [searchedSubCategoryId, setSearchedSubCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  //  find active categoryname to set as params
  useEffect(() => {
    if (selectedCategoryId && categoryData.length) {
      const selectedCategory = categoryData.find(
        (category) => category._id === selectedCategoryId
      );
      if (selectedCategory) {
        setSelectedCategoryName(selectedCategory.name); // Update the selected category name
      }
    }
  }, [selectedCategoryId, categoryData]);
  
  // Store selectedCategoryName in sessionStorage after it changes
  useEffect(() => {
    if (selectedCategoryName) {
      sessionStorage.setItem('catname', selectedCategoryName); // Store category name in sessionStorage
    }
  }, [selectedCategoryName]);
  

  // Retrieve searchedSubCategoryId from cookies on initialization
  useEffect(() => {
    const compressedSubCategoryId = Cookies.get("searchedSubCategoryId");
    if (compressedSubCategoryId) {
      const decompressedId = LZString.decompress(compressedSubCategoryId);
      if (decompressedId) {
        setSearchedSubCategoryId(decompressedId);
      }
    }
  }, []);

  // Store searchedSubCategoryId in cookies whenever it changes
  useEffect(() => {
    if (searchedSubCategoryId) {
      const compressedId = LZString.compress(searchedSubCategoryId);
      Cookies.set("searchedSubCategoryId", compressedId, { expires: 7 }); // Set expiry as 7 days
    }
  }, [searchedSubCategoryId]);


  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
      setLoading(true);
  
      try {
        const response = await fetch(`${AZURE_BASE_URL}/v1.0/core/categories`);
        const result = await response.json();
  
        if (Array.isArray(result) && result.length > 0) {
          // Filter categories where isActive is true
          const activeCategories = result.filter((category) => category.isActive === true);
  
          if (activeCategories.length > 0) {
            setCategoryData(activeCategories);
            setSelectedCategoryId(activeCategories[0]._id); // Default to the first active category
          } else {
            setError("No active categories available.");
          }
        } else {
          setError("No categories available.");
        }
      } catch (error) {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);
  

  // Update selected category and subcategory IDs when searched IDs change
  useEffect(() => {
    if (searchedCategoryId) {
      setSelectedCategoryId(searchedCategoryId);
      setSearchedCategoryId(null); // Reset after setting
    }
    if (searchedSubCategoryId) {
      setSelectedSubCategoryId(searchedSubCategoryId);
      setSearchedSubCategoryId(null); // Reset after setting
    }
  }, [searchedCategoryId, searchedSubCategoryId]);

  // Fetch subcategories based on selected category
  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
  
    if (selectedCategoryId) {
      const fetchSubCategories = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${AZURE_BASE_URL}/v1.0/core/sub-categories/category/${selectedCategoryId}`
          );
          const result = await response.json();
  
          if (Array.isArray(result) && result.length > 0) {
            // Filter subcategories where isActive is true
            const activeSubCategories = result.filter((subCategory) => subCategory.isActive === true);
  
            if (activeSubCategories.length > 0) {
              setSubCategoryData(activeSubCategories);
            } else {
              setSubCategoryData([]);
              setError("No active subcategories available.");
            }
          } else {
            setSubCategoryData([]);
            setError("No subcategories available.");
          }
        } catch (error) {
          setError("Failed to load subcategories.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchSubCategories();
    }
  }, [selectedCategoryId]);
  

  // Fetch services based on selected category and subcategory
  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;
  
    if (selectedCategoryId && selectedSubCategoryId) {
      const fetchServices = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${AZURE_BASE_URL}/v1.0/core/services/filter/${selectedCategoryId}/${selectedSubCategoryId}`
          );
          const data = await response.json();
  
          if (Array.isArray(data) && data.length > 0) {
            // Filter services where isActive is true
            const activeServices = data.filter((service) => service.isActive === true);
  
            if (activeServices.length > 0) {
              setServicesData(activeServices);
            } else {
              setServicesData([]);
              setError("No active services available.");
            }
          } else {
            setServicesData([]);
            setError("No services available.");
          }
        } catch (error) {
          setError("Failed to load services.");
          setServicesData([]); // Fallback to empty array on error
        } finally {
          setLoading(false);
        }
      };
  
      fetchServices();
    }
  }, [selectedCategoryId, selectedSubCategoryId]);
  
  
  
  // Match categories with pricing data
  useEffect(() => {
    if (categoryData.length && (districtPriceData || customPriceData)) {
      const matchedCategories = categoryData.filter(
        (cat) =>
          districtPriceData?.some((record) => record.category === cat.name) ||
          customPriceData?.some((record) => record.category === cat.name),
      );
      setLocationCat(matchedCategories);
    }
  }, [categoryData, districtPriceData, customPriceData]);


  // Match subcategories with pricing data based on selected category
  useEffect(() => {
    if (
      subCategoryData.length &&
      selectedCategoryId &&
      (districtPriceData || customPriceData)
    ) {
      const matchedSubCategories = subCategoryData.filter((subCat) => {
        // Check if selectedCategoryId matches categoryId in subCategoryData
        const isCategoryMatched = subCat.categoryId === selectedCategoryId;
  
        // Check if subCat.name matches with subcategory in districtPriceData or customPriceData
        const isSubCategoryMatched =
          districtPriceData?.some((record) => record.subcategory === subCat.name) ||
          customPriceData?.some((record) => record.subcategory === subCat.name);
  
        // Both conditions must be true
        return isCategoryMatched && isSubCategoryMatched;
      });
      setLocationSubCat(matchedSubCategories);
    }
  }, [subCategoryData, selectedCategoryId, districtPriceData, customPriceData, setLocationSubCat]);
  

  // Match services with pricing data
  useEffect(() => {
    if (Array.isArray(servicesData) && Array.isArray(districtPriceData)) {
      const matched = servicesData.reduce((acc, service) => {
        const matchingDistrict = districtPriceData.find(
          (record) =>
            record.servicename === service?.name &&
            record.subcategory === service?.subCategoryId?.name,
        );

        if (matchingDistrict) {
          acc.push({
            service,
            districtPrice: matchingDistrict,
          });
        }
        return acc;
      }, []);
      setLocationServices(matched);
      console.log(matched,'service data in context')
    } else {
      console.warn(
        "Expected servicesData and districtPriceData to be arrays, but received:",
        { servicesData, districtPriceData },
      );
    }
  }, [servicesData, districtPriceData, selectedSubCategoryId , selectedSubCategoryId]);


  // Match services with custom price data
  useEffect(() => {
    if (Array.isArray(servicesData) && Array.isArray(customPriceData)) {
      const matched = servicesData.reduce((acc, service) => {
        const matchingCustomPrice = customPriceData.find(
          (record) => record.servicename === service?.name,
        );

        if (matchingCustomPrice) {
          acc.push({
            service,
            customPrice: matchingCustomPrice,
          });
        }
        return acc;
      }, []);

      setLocationCustom(matched);
    } else {
      console.warn(
        "Expected servicesData and customPriceData to be arrays, but received:",
        { servicesData, customPriceData },
      );
      setLocationCustom([]);
    }
  }, [servicesData, customPriceData, selectedSubCategoryId]);


  return (
    <CategoryContext.Provider
      value={{
        categoryData,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedCategoryName,
        selectedSubCategoryId,
        setSelectedSubCategoryId,
        setSearchedCategoryId,
        setSearchedSubCategoryId,
        subCategoryData,
        servicesData,
        locationCat,
        locationSubCat,
        locationServices,
        locationCustom,
        servingLocations,
        setServingLocations,
        error,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
