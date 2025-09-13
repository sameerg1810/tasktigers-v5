import React, { useEffect } from "react";
import "./Howitworks.css";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL; // Make sure this is in your .env file

const howitworks1 = `${IMAGE_BASE_URL}/h-i-w-1.png`;
const howitworks2 = `${IMAGE_BASE_URL}/h-i-w-2.png`;
const howitworks3 = `${IMAGE_BASE_URL}/h-i-w-3.png`;
const howitworks4 = `${IMAGE_BASE_URL}/h-i-w-4.png`;
const dashedline = `${IMAGE_BASE_URL}/dashedline.png`;


const Howitworks = () => {

  useEffect(()=>{
    console.log( IMAGE_BASE_URL,'IMAGE base url')
  },[])

  return (
    
    <div className="how-it-works-main-con">
        <div className="h-i-w-headding">
            <h2>How it works ?</h2>
            <p>Effortlessly book services with Task Tigers in just a few steps!</p>
        </div>
        <div className="h-i-w-main">
            {/* <img src={dashedline} alt="dashedline" className="dashedline"/> */}
            <div className="h-i-w-sub-con">
              <div className="h-i-w-img">
              <img src={howitworks1} className="img1" alt="how it works"/>
              </div>
             
              <h1>Book a service</h1>
              <div className="h-i-w-p">
              <p>Discover a wide range of services tailored to your needs. With just a few taps, schedule your service at a time that suits you best—fast, easy, and convenient.</p>
              </div>
            
            </div>
            <div className="h-i-w-sub-con">
            <div className="h-i-w-img">
              <img src={howitworks2} className="img2" alt="how it works"/>
              </div>
              <h1>Get Confirmation</h1>
              <div className="h-i-w-p">
              <p>Stay in the loop with instant booking confirmations and real-time updates. We notify you as soon as a verified expert is assigned to your task, ensuring transparency and trust at every step.</p>
              </div>
            </div>
            <div className="h-i-w-sub-con">
            <div className="h-i-w-img">
              <img src={howitworks3} alt="how it works"/>
            </div>
              <h1>Technician Arrives</h1>
              <div className="h-i-w-p">
              <p>Our trained and background-verified professionals arrive punctually, equipped with everything needed to get the job done with precision and care. Sit back and watch the experts handle it!</p>
               </div>
            </div>
            <div className="h-i-w-sub-con">
            <div className="h-i-w-img">
              <img src={howitworks4} alt="how it works"/>
            </div>
              <h1>Service Done</h1>
              <div className="h-i-w-p">
              <p>Your satisfaction is our goal! After completing the task, our professionals ensure everything is perfect before leaving. Share your feedback to help us keep raising the bar on quality.</p>
              </div>
            </div>
        </div>
      
    </div>
  );
};

export default Howitworks;
