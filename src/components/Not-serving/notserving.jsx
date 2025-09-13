import React from 'react'
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import './notserving.css'
import { useNavigate } from 'react-router-dom'
const  notserving =  `${IMAGE_BASE_URL}/not-serving.png`

const Notserving = () => {
    const navigate = useNavigate()
  return (
    <>
    <div className='not-serving-main'>
       <div className='not-serving-img-con'>
         <img src={notserving} alt='not serving'/>
       </div>
       <p>We are not serving this location at this time ..</p>
       <button onClick={()=>{navigate('/')}}>OK</button>
    </div>
   
    </>
  )
}

export default Notserving