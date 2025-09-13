import React from "react";
import CartSummary from "../components/cart/CartSummary";
import "./CartPage.css"; // Import the CSS file for styling
import { useLocation } from "react-router-dom";

const CartPage = () => {
  const {state}=useLocation()
  return (
    <div className="cart-page">
      <CartSummary fullWidth state={state} />
    </div>
  );
};
  
export default CartPage;
