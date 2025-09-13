import React, { useState, useEffect } from "react";
import "./homeblogs.css";
import { useNavigate } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

const Homeblogs = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  // Fetching blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      const backendApiUrl = import.meta.env.VITE_AZURE_BASE_URL;
      try {
        const response = await fetch(`${backendApiUrl}/v1.0/admin/blogs`);
        const data = await response.json();
        setBlogs(data);
        console.log(data, "blogs data");
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();
  }, []);

  // Format date to "August, 8, 2023"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  return (
    <>
      <div className="home-blogs">
        <p className="o-b-header">OUR BLOGS</p>
        <div className="n-b-main-con">
          {Array.isArray(blogs) && blogs.length > 0 ? (
            blogs.slice(0, 1).map((blog, index) => (
              <div className="n-b-1st" key={index}>
                <div className="n-b-image">
                  <img src={blog.image} alt={blog.title || "Blog Image"} />
                </div>

                <p className="n-b-title">{blog.title}</p>
                <p className="n-b-text">{`${blog.text.slice(0, 700)}...`}</p>
                <div className="calendar-m-i">
                  <CalendarMonthOutlinedIcon />
                  <p className="n-b-date">{formatDate(blog.updatedAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No blogs available</p>
          )}
          <div className="my-s-blog">
            {/* second blogs */}
            {Array.isArray(blogs) && blogs.length > 0 ? (
              blogs.slice(1, 3).map((blog, index) => (
                <div className="n-b-2nd" key={index}>
                  <div
                    className="n-b-2nd-image"
                    onClick={() => {
                      navigate("/blogs");
                    }}
                  >
                    <img src={blog.image} alt={blog.title || "Blog Image"} />
                  </div>
                  <div className="n-b-2nd-content">
                    <p className="n-b-title">{blog.title}</p>
                    <p className="n-b-text">{`${blog.text.slice(0, 90)}...`}</p>
                    <div className="calendar-m-i">
                      <CalendarMonthOutlinedIcon />
                      <p className="n-b-2nd-date">
                        {formatDate(blog.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No blogs available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Homeblogs;
