import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Blogs.css";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook
// 
  useEffect(() => {
    const fetchBlogs = async () => {
      const backendApiUrl = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(`${backendApiUrl}/v1.0/admin/blogs`);
        const data = await response.json();
        setBlogs(data);
        console.log(data, " blogs data ");
      } catch (err) {
        console.log(err);
      }
    };
    fetchBlogs();
  }, []);

  // Function to handle the view blog logic
  const handleviewblog = (blogitem) => {
    console.log("Blog clicked", blogitem);
    // Navigate to the Blogview component and pass the blog data via state
    navigate("/blogview", { state: { blog: blogitem } });
  };

  return (
    <>
     <h2 style={{textAlign:"center"}}>Blogs</h2>
     <div className="blogs">
     
     {blogs.map((blogitem) => (
       <div key={blogitem.id} className="blogs-sub-con">
         <div className="blogs-image" onClick={() => handleviewblog(blogitem)}>
           <img src={blogitem.image} alt={blogitem.title} />
         </div>
         <h1 className="title-blog">{blogitem.title}</h1>
       </div>
     ))}
   </div>
    </>
   
  );
};

export default Blogs;
