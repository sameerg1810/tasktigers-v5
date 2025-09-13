import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

import './coupons.css';

const Coupons = ({handleCopen}) => {
  const [coupons, setCoupons] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(
          "https://appsvc-apibackend-dev.azurewebsites.net/v1.0/admin/user-coupons"
        );
        const data = await response.json();
        setCoupons(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCoupons();
  }, []);

  const handleViewCoupon = (couponData) => {
    if(location.pathname === "/cart" ||location.pathname === "/services"){
      handleCopen(couponData)
    }else{
    navigate("/coupon-view", { state: { coupon: couponData } });
    }
  };

  return (
    <div>
      {location.pathname === "/cart" ||location.pathname === "/services" ? null : (
        <div item>
        </div>
      )}
      <div className="coupons-main">
        <h1 className='my-coupons'>My coupons</h1>
        {Array.isArray(coupons) && coupons.length > 0 ? (
          <div className='coupons-flex'>
            {coupons.map((coupon) => (
              <div item xs={12} key={coupon.id}>
                <div
                  className="coupons-container"
                  onClick={() => handleViewCoupon(coupon)}
                  style={{ backgroundImage: `url(${IMAGE_BASE_URL})/coupons-bg.png` }}
                >
                  <div className="coupon-image">
                    <img src={coupon.image} alt={coupon.title} />
                  </div>
                  <div className="c-r">
                    <h2 className="coupon-discount">{coupon.discount} OFF</h2>
                    <h1 className="coupon-title">With {coupon.title}</h1>
                    <p className="coupon-valid">
                      Valid Until:{" "}
                      {new Date(coupon.validTill).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No coupons available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
