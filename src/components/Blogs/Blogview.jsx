import React from 'react';
import './Blogview.css'
import { useLocation } from 'react-router-dom'; // Import useLocation to retrieve passed data

const Blogview = () => {
  const location = useLocation(); // Use useLocation to access the passed state
  const { blog } = location.state; // Get the blog data from location state

  return (
    <div className='blog-view'>
      {/* <div className='video'>
        <video autoplay muted loop>
          <source src={blog.video} type="video/mp4" />
        </video>
      </div> */}
      <p className='blog-tittle'>{blog.title}</p>
      <div className='blog-image'>
         <img src={blog.image} alt='blogimage'/>
      </div>
      <p className='blog-subject'>{blog.subject}</p>
      <p className='blog-des'>{blog.text}</p>


    </div>
  );
};

export default Blogview;
