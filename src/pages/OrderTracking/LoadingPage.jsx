import React, { useEffect } from "react";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import "./LoadingPage.css";
const SearchGif = `${IMAGE_BASE_URL}/Search.gif`;
import { Button } from "@mui/material";
import { useOrderHistory } from "../../context/OrderHistoryContext";

const LoadingPage = () => {
    const {
      selectedOrderId,
      setSelectedOrderId,
      setSelectedProviderId,
      setCurrentOrderStatus,
      setAllOrders,
      setAllOrderhistories,
    } = useOrderHistory();

    useEffect(()=>{
     console.log(selectedOrderId,'selected order id')
    },[selectedOrderId])

  const cancelBooking=()=>{
    console.log(selectedOrderId,'selected order id') 
  }

  return (
    <div className="loading-page">
      <div className="loading-content">
        <img src={SearchGif} alt="Searching for provider" />
        <h2>
          Your Order has been made and we are matching with a best provider
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </h2>
        <Button
          variant="outlined"
          sx={{
            color: "white",
            backgroundColor:'black',
            borderColor: "black",
            "&:hover": {
              backgroundColor: "white",
              color: "black",
            },
          }}
          onClick={cancelBooking}
        >
          Cancel Booking
        </Button>
      </div>
    </div>
  );
};

export default LoadingPage;
