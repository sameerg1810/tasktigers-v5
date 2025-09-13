import React, { useContext, useEffect, useState } from "react";
import "./CartFooter.css";
import { CartContext } from "../../context/CartContext";
import PropTypes from "prop-types";

const CartFooter = ({ onNext }) => {
  const { totalItems, totalPrice , discountValue ,afterDiscountPrice , basicTotalPrice} = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  // checking console of items
  useEffect(() => {
    console.log(totalPrice, "totalprice");
  }, [totalPrice]);

    useEffect(()=>{
     console.log(basicTotalPrice,'basic total price in context')
    },[])

  // Trigger loading effect on totalItems or totalPrice change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Small delay for loading effect

    return () => clearTimeout(timer); // Clear timeout if component unmounts or dependencies change
  }, [totalItems, totalPrice]);

  return (
    <div className="cart-total">
      <h2>Cart Total</h2>
      
        {loading ? (
          <div className="loading-spinner"></div> // Show spinner when loading
        ) : (
          <>
          <div className="pricing-con">
            <div className="total-items-cart">
                <h2>Sub Total :</h2>
                <p>₹ {basicTotalPrice}</p>
            </div>
            {
              discountValue>0 && (
                  <div className="discount-value">
                    <h2>Package Discount :</h2>
                    <p>₹ {discountValue}</p>
                  </div>
              )
            }
           
            {
              afterDiscountPrice>0 && 
                (
                  <div className="discount-value">
                  <h2>Coupon Discount :</h2>
                  <p>₹ {afterDiscountPrice}</p>
              </div>
                )
            }
           
            <div className="total-value"> 
                <h2>Total :</h2>
                <p>₹ {totalPrice.toFixed(2)}</p>
            </div>
          </div>
          {/* ₹  */}  
          </>
        )}
     
      <div className="cart-total-button">
        <button className="go-to-address-btn" onClick={() => onNext("address")}>
          Confirm address
        </button>
      </div>
    </div>
  );
};

CartFooter.propTypes = {
  onNext: PropTypes.func.isRequired, // Defines onNext as a required function prop
};

export default CartFooter;
