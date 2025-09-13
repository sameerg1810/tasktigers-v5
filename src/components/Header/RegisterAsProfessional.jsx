import React from 'react';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import Carousel from 'react-material-ui-carousel';
import { Paper } from '@mui/material';
import './RegisterAsProfessional.css';
const phone = `${IMAGE_BASE_URL}/how-b-phone.png`;
const registergif = `${IMAGE_BASE_URL}/Joinus.gif`;
const video1 = `${IMAGE_BASE_URL}/r-s-a-p.mov`;
const playstore = `${IMAGE_BASE_URL}/play-store.svg`;
const applestore = `${IMAGE_BASE_URL}/app-store.svg`;

const RegisterAsProfessional = () => {
  const carouselItems = [
    {
      name: "Partner Testimonial Video #2",
      videoUrl: video1,
      isVideo: true,
    },
    {
      name: "Partner Testimonial Video #3",
      videoUrl: video1,
      isVideo: true,
    },
  ];

  const testimonials = [
  {
    name: "Amit Verma",
    feedback: "TaskTigers has been a blessing for my career. I’ve gained more clients and can manage everything easily through the app.",
  },
  {
    name: "Priya Reddy",
    feedback: "I love the transparency and ease of using TaskTigers. Their support team is always ready to help!",
  },
  {
    name: "Rahul Naidu",
    feedback: "TaskTigers has helped me grow my business by connecting me with verified clients. It’s a great platform for professionals.",
  },
  {
    name: "Sneha Raju",
    feedback: "Being part of TaskTigers has made my work stress-free. The payments are always on time, and the platform is so reliable.",
  },
  {
    name: "Vikram Verma",
    feedback: "I’ve been able to showcase my skills and earn consistently with TaskTigers. Their platform is simply amazing!",
  },
  {
    name: "Anjali Naidu",
    feedback: "TaskTigers has empowered me to work independently while growing my client base. It’s been a wonderful experience!",
  },
  {
    name: "Ramesh Raju",
    feedback: "The booking system and timely payments on TaskTigers are a big plus. It has helped me organize my work better.",
  },
  {
    name: "Shilpa Reddy",
    feedback: "TaskTigers is a fantastic platform for service providers. The trust and support they offer are unmatched!",
  },
  {
    name: "Arun Naidu",
    feedback: "With TaskTigers, I’ve been able to take control of my career and grow at my own pace. Highly recommended!",
  },
  {
    name: "Meena Raju",
    feedback: "Thanks to TaskTigers, I’ve found a platform that values professionals and ensures a seamless experience for everyone.",
  },
];


  function CarouselItem({ item }) {
    return (
      <Paper className="carousel-video">
        {item.isVideo ? (
          <div className="video-container">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="testimonial-video"
            >
              <source src={item.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <h2>{item.name}</h2>
        )}
      </Paper>

    );
  }

  function Testimonial({ testimonial }) {
    return (
      <Paper className="testimonial-box">
        <p className="testimonial-feedback">"{testimonial.feedback}"</p>
        <h3 className="testimonial-name">- {testimonial.name}</h3>
      </Paper>
    );
  }

  return (
    <div className="r-a-p-main-con">
      {/* Main Carousel */}
      <Carousel autoPlay muted className="carousel-buttons">
        {carouselItems.map((item, i) => (
          <CarouselItem key={i} item={item} />
        ))}
      </Carousel>

      {/* How to Become Section */}
      <div className="how-become-t-p">
        <div className="how-content">
          <p className="how-become-text">
            How to Become a <br />
            Partner in <span>TaskTigers</span>
          </p>
          <div className="phone-image">
            <img src={registergif} alt="how-b-phone" />
          </div>
        </div>
        <div className="how-steps">
          <div className="how-sub-steps">
            <p className="number">1</p>
            <h2>Register Yourself</h2>
            <p>Sign up on the Task Tigers platform by providing your details and credentials. Our seamless registration process ensures you're onboarded quickly, so you can start your journey as a verified professional.</p>
          </div>
          <div className="how-sub-steps number2">
            <p className="number">2</p>
            <h2>Provide Your Services</h2>
            <p>Once registered, start accepting service requests in your expertise. Use our platform to manage your bookings efficiently, showcase your skills, and deliver exceptional services to customers.</p>
          </div>
          <div className="how-sub-steps number3">
            <p className="number">3</p>
            <h2>Get Paid Instantly</h2>
            <p>Earn as you work! Task Tigers ensures timely and secure payments directly to your account. Focus on what you do best, and let us take care of the rest.</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials">
        <p className="t-heading">Testimonials</p>
        <h2>What Our Partners Say</h2>
        <div className="testimonial-main-con">
          <Carousel
            className="testimonial-carousel"
            autoPlay
            interval={3000} // Change slide every 3 seconds
            indicators={false} // Hide dots
            navButtonsAlwaysInvisible // Hide navigation buttons
          >
            {testimonials.map((testimonial, i) => (
              <Testimonial key={i} testimonial={testimonial} />
            ))}
          </Carousel>
        </div>
      
      {/* download the app section */}
      
      <div className='d-app-main-section'>
        <div className='d-app-section'>
            <p>Unlock Your Skills</p>
            <h2>Download the App Now!</h2>
            <p>Empower your career and take control of your work-life balance. Join thousands of professionals across India who are using the Task Tigers App to connect with customers, manage bookings, and earn seamlessly.

Download the app today and unlock a world of opportunities!</p>
            <div className='stores'>
                <img src={applestore} alt='Download on the Apple App Store'/>
                <img src={playstore} alt='Get it on Google Play Store'/>
            </div>
        </div>
      </div>
      
      </div>
    </div>
  );
};

export default RegisterAsProfessional;
