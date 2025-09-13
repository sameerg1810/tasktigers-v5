import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './couponviewpage.css'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

const CouponViewPage = () => {
  const location = useLocation();
  const navigate=useNavigate()
  const { coupon } = location.state || {}; // Destructure coupon from state
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('Coupon code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy the coupon code', err);
      });
  };
  const couponapply=(codecopon)=>{
    //   sameer need to do code here
    navigate('/cart',{state:{codecopon}})
    //alert('coupon applied')
  }

  const historyNavigate=()=>{
    navigate(-1)
  } 
  return (
    
    <Box sx={{display:'flex' ,justifyContent:"center"}}>
      {coupon ? (
        <div className='coupon-main-con'>
          <KeyboardBackspaceIcon sx={{cursor:"pointer"}} onClick={historyNavigate}/>
           <div className='coupon-image-title'>
                 <div className='coupon-image'>
                    <img src={coupon.image} alt='coupon image'/>
                </div>
                <p className='title-style'>{coupon.discount} OFF <br/>{coupon.title}</p>
           </div>
           <p className='c-v-sub-title'>{coupon.subTitle} </p>
           <p className='c-v-description'>{coupon.description}</p>
          
           <div className='apply-copy'>
           <p className='coupon-code-name'>Code : {coupon.couponCode}</p>
           <div onClick={() => handleCopyCode(coupon.couponCode)}>
           <ContentCopyIcon/>
           </div>
           
           </div>
           <div className='apply-button' >
           <p onClick={()=>couponapply(coupon.couponCode)}>Apply</p>

           </div>
          
        </div>
      ) : (
        <p>No coupon data available.</p>
      )}
    </Box>
  );
};

export default CouponViewPage;
