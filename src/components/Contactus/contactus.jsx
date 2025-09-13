import React, { useState } from 'react';
import './contactus.css';
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

const Contactus = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
  };

  return (
    <>
      <div className='contactus'>
        <h1 className='g-i-t'>Contact Us</h1>
        <p className='g-i-t-sub'>Any question or remarks? Just write us a message!</p>
        <div className='g-i-t-form'>
          <form onSubmit={handleSubmit}>
            <div className='name-number'>
            <FormControl fullWidth margin="normal">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className='input-field'
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                label="Mobile Number"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                className='input-field'
                required
              />
            </FormControl>
            </div>
           

            <FormControl fullWidth margin="normal">
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className='input-field'
                required
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField
                label="Message"
                name="message"
                multiline
                rows={3}
                value={formData.message}
                onChange={handleChange}
                className='input-field'
                required
              />
            </FormControl>

            <button type="submit" className='submit-button'>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contactus;
