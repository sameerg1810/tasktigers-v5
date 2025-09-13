import React from 'react';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const image1 = `${IMAGE_BASE_URL}/home-carousel-1.svg`;
const image2 = `${IMAGE_BASE_URL}/home-carousel-2.svg`;
const image3 = `${IMAGE_BASE_URL}/home-carousel-3.svg`;
const image4 = `${IMAGE_BASE_URL}/home-carousel-4.svg`;
import './Home_carousel.css'

const Homecarousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Sample carousel items
  const carouselItems = [
    { image: image1 },
    { image: image2 },
    { image: image3 },
    { image: image4 },
  ];

  
  return (
    <div style={{ margin: '0px' }}>
      <Slider {...settings}>
        {carouselItems.map((item, index) => (
          <div key={index} style={{ height: '100vh', position: 'relative' }} className='image-con'>
            <img
              src={item.image}
              alt={`Slide ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // Ensures the image scales proportionally to fit
                borderRadius: '10px',
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Homecarousel;
