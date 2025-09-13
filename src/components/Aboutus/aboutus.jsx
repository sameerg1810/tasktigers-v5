import React from 'react';
import './aboutus.css';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
const pro1 =  `${IMAGE_BASE_URL}/dir-pro-pic.png`;
const aboutus =  `${IMAGE_BASE_URL}/task-tigers-aboutus.png`;

const Aboutus = () => {
  return (
    <>
      <div className="aboutus-main">
        <div className="about-us-top">
          
          <div className="a-u-img">
            <img src={aboutus} alt="Task Tigers About Us" />
          </div>
          <div className="a-u-content">
            <h1>About Us</h1>
            <p>
              Welcome to <strong>Task Tigers</strong>, your one-stop destination for trusted, on-demand home services. 
              As India’s emerging marketplace for professional home services, Task Tigers connects skilled and verified service 
              providers with customers who need reliable solutions—all at the tap of a button.
              <br />
              <br />
              Our platform offers a wide range of services spanning <strong>16+ categories</strong> and dozens of specialized tasks. 
              From home cleaning, electrical repairs, plumbing, and carpentry to personal care services like beauty, salon, 
              and fitness sessions, Task Tigers is here to make your life easier and your home happier.
            </p>
        </div>
        </div>
        <h2>Our Vision</h2>
          
            <p>
              We are on a mission to empower local professionals while delivering exceptional service experiences to customers 
              across India. Task Tigers isn’t just a platform—it’s a community where skilled service providers thrive, and customers 
              enjoy hassle-free services tailored to their needs.
            </p>
            <h2>What Sets Task Tigers Apart?</h2>
            <ul>
              <li>
                <strong>A Marketplace of Experts:</strong> We onboard and verify professionals from various fields, ensuring only the 
                best in their profession serve our customers. Whether you need a plumber, painter, or yoga instructor, Task Tigers has you covered.
              </li>
              <li>
                <strong>Diverse Services:</strong> With 16+ categories and growing, we cater to every aspect of home management, including 
                cleaning, repairs, fitness, beauty, and much more.
              </li>
              <li>
                <strong>Seamless Booking:</strong> Book services in just a few clicks through our intuitive platform—no waiting, no hassle.
              </li>
              <li>
                <strong>Trust & Safety:</strong> All service providers go through a strict verification process, so you can rest assured 
                you’re in safe hands.
              </li>
              <li>
                <strong>Customer-Centric:</strong> Our top priority is making every service experience smooth, reliable, and delightful for you.
              </li>
            </ul>
            <h2>Why Choose Task Tigers?</h2>
            <ul>
              <li>
                <strong>Convenience at Your Fingertips:</strong> Explore, book, and manage services anytime, anywhere.
              </li>
              <li>
                <strong>Empowering Professionals:</strong> We provide skilled individuals with a platform to grow and succeed.
              </li>
              <li>
                <strong>Quality & Affordability:</strong> Enjoy premium services at prices designed to fit your budget.
              </li>
              <li>
                <strong>Tech-Driven Excellence:</strong> Powered by innovative technology, our platform ensures smooth communication, transparency, and on-time delivery.
              </li>
            </ul>
            <h2>Join the Task Tigers Revolution</h2>
            <p>
              As a fast-growing startup, we’re proud to partner with thousands of professionals and customers who trust us to deliver excellence. 
              With every booking, we’re building a legacy of reliability, innovation, and outstanding service quality.
              <br />
              <br />
              So whether it’s fixing a leaky tap, deep-cleaning your home, or indulging in a relaxing beauty session, <strong>Task Tigers</strong> is here 
              to simplify your life. 
              <br />
              <br />
              <strong>Join the movement today and experience the difference. With Task Tigers, the name says it all!</strong>
            </p>
       
        {/*<div className="aboutus-bottom">
          <div className="about-owners">
            <img src={pro1} alt="profile" />
            <p className="dir-name">Taask</p>
            <p className="dir-disg">CEO of Task Tigers</p>
          </div>
          <div className="about-owners">
            <img src={pro1} alt="profile" />
            <p className="dir-name">Tigers</p>
            <p className="dir-disg">COO of Task Tigers</p>
          </div>
          <div className="about-owners">
            <img src={pro1} alt="profile" />
            <p className="dir-name">Tiger Team</p>
            <p className="dir-disg">CTO of Task Tigers</p>
          </div>
        </div>*/}
      </div>
    </>
  );
};

export default Aboutus;
