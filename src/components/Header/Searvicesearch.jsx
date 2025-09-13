import React, { useContext, useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import './Servicesearch.css';
import { CategoryContext } from '../../context/CategoryContext';
import { useNavigate } from 'react-router-dom';


const Servicesearch = () => {
  const navigate = useNavigate();
  const { categoryData, setSelectedCategoryId } = useContext(CategoryContext);
  const [servicesSearchDropdown, setServicesSearchDropdown] = useState(false);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]); // Store matched services
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [serchService, setSerchService] = useState(false);




  const handleServicesSearch = () => {
    setServicesSearchDropdown(true)
}

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fetch subcategories
  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${AZURE_BASE_URL}/v1.0/core/sub-categories`);
        const result = await response.json();
        if (Array.isArray(result)) {
          setSubCategoryData(result);
        } else {
          setSubCategoryData([]);
        }
      } catch (error) {
        setError("Failed to load subcategories.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [categoryData]);

  // Fetch services
  useEffect(() => {
    const AZURE_BASE_URL = import.meta.env.VITE_AZURE_BASE_URL;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${AZURE_BASE_URL}/v1.0/core/services`);
        const data = await response.json();
        setServiceData(data);
      } catch (error) {
        setError("Failed to load services.");
        setServiceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [subCategoryData]);

  // Search service term
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setSerchService(true);

      // Filter services based on searchTerm
      const matchedServices = serviceData.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) // Match searchTerm in service name
      );
      setFilteredServices(matchedServices);
    } else {
      setSerchService(false);
      setFilteredServices([]);
    }
    // console.log(serviceData,'service')
  }, [searchTerm, serviceData]);

  const handleCategory = (id) => {
    setSelectedCategoryId(id);
    navigate(`/services`);
    setServicesSearchDropdown(false);
  };

  const handleServicesearchdropdown = () => {
    setSerchService(false);
    setSearchTerm("");
  };

  return (
    <>


      {setServicesSearchDropdown &&
        <div
          className="service-search-main-con"
        >
          {/* <div className="service-search-header">
         <p>What Services do you need?</p>
         
       </div> */}

          <div className="search-service">
            <input
              type="text"
              placeholder="Search your service"
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button>Search</button>
            <ClearIcon
              className="closeicon"
              fontSize="large"
              sx={{ color: 'white' }}
              onClick={()=>{navigate('/')}}
            />
          </div>

          {serchService && (
            <div className="search-service-dropdown">
              <p className="back-t-c" onClick={handleServicesearchdropdown}>
                Back to Categories
              </p>
              <div className="service-search-by-letter">
                {/* Display matched services */}
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div key={service._id} className="matched-service-item" onClick={() => handleCategory(service.categoryId)}>
                      <p>{service.name}</p>
                    </div>
                  ))
                ) : (
                  <p>No matching services found.</p>
                )}
              </div>
            </div>
          )}

          <div className="service-search-cat-con">
            {categoryData.map((categoryItem) => (
              <div
                key={categoryItem._id}
                className="category-item"
                onClick={() => handleCategory(categoryItem._id)}
              >
                <p className="category-item-name">{categoryItem.name}</p>
                <div className="subcategory-item">
                  {subCategoryData
                    .filter((subCategory) => subCategory.categoryId === categoryItem._id)
                    .map((subCategoryItem) => (
                      <div key={subCategoryItem._id}>
                        <p className="subcategorydata">{subCategoryItem.name},</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      }

    </>

  );
};

export default Servicesearch;
