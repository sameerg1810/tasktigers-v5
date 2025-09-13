import React from 'react'
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import './getexperts.css'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
const gemain = `${IMAGE_BASE_URL}/g-e-main-img.png`
const gesub1 = `${IMAGE_BASE_URL}/g-e-sub-1.png`
const gesub2 = `${IMAGE_BASE_URL}/g-e-sub-2.png`
const gesub3 = `${IMAGE_BASE_URL}/g-e-sub-3.png`
import { CategoryContext } from '../../../context/CategoryContext'


const Getexperts = () => {

       const navigate = useNavigate();
       const { locationCat, setSelectedCategoryId } =
         useContext(CategoryContext);

     const handleCategory = (id) => {
          // console.log(id,'categoryid')
          // const isCategoryInLocation = locationCat?.some(
          //   (locCat) => locCat._id === id,
          // );
          // if (isCategoryInLocation) {
           
          //   setSelectedCategoryId(id);
          //   navigate("/services");
          // } 
          // else{
           
          //   navigate('/services')
          // }
        };
  return (
     <>
         <div className='g-e-main-con'  style={{ backgroundImage: `url(${IMAGE_BASE_URL})/get-experience-bg.png` }} >
             <h2>Get Expert Services, Delivered at <span>Your Doorstep</span></h2>
             <div className='g-e-main-p'>
             <p>At Task Tigers, we bring you a seamless blend of convenience and quality by connecting you with highly skilled professionals across various services. Whether it’s fixing a leaky pipe, refreshing your home with a new coat of paint, or indulging in premium beauty and wellness treatments, our experts ensure every task is completed with precision and excellence. Experience hassle-free, top-notch services tailored to your needs. Your comfort, our priority!</p>
             </div>
             
             <div className='g-e-main-image' onClick={handleCategory('6701477d6cdbd8a62eb1bb05')}>
                  <img src={gemain} alt='get experts main image'/>
             </div>
             <div className='g-e-sub-img-con'>
                  <div className='g-e-sub-img-sub-con'  onClick={handleCategory('6701477d6cdbd8a62eb1baf9')}>
                       <img src={gesub1} alt='subimage'/>
                       <h3>Home Cleaning</h3>
                       <p>Transform your living spaces with our professional home cleaning services. From dusting and mopping to organizing and sanitizing, Task Tigers ensures your home is spotless and inviting. Let us handle the chores while you enjoy a clean and healthy environment. </p>
                       
                  </div>
                  <div className='g-e-sub-img-sub-con'  onClick={handleCategory('6701477d6cdbd8a62eb1baf9')}>
                       <img src={gesub2} alt='subimage'/>
                       <h3>Kitchen Cleaning</h3>
                       <p>Say goodbye to greasy surfaces and messy kitchens! Our expert kitchen cleaning services include deep cleaning of countertops, cabinets, and appliances to leave your kitchen sparkling and hygienic. Task Tigers helps you maintain a kitchen that’s ready for your culinary adventures. </p>
                       
                  </div>
                  <div className='g-e-sub-img-sub-con'  onClick={handleCategory('6701477d6cdbd8a62ebbafd')}>
                       <img src={gesub3} alt='subimage'/>
                       <h3>Facial & Makeup</h3>
                       <p>Indulge in a rejuvenating beauty experience with our premium facial and makeup services. Whether it's a quick refresh or a glamorous makeover, Task Tigers brings professional salon services to your doorstep. Look and feel your best with ease and convenience </p>
                       
                  </div>
             </div>
         </div>
     </>
  )
}

export default Getexperts