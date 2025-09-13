
import React from 'react';
import { AddressAutofill } from '@mapbox/search-js-react'
import './careers.css'
const Careers=()=>{
  const [value, setValue] = React.useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };


  return (
    <form className='careers'>
      <AddressAutofill accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}>
        <input
          autoComplete="shipping address-line1"
          value={value}
          onChange={handleChange}
        />
      </AddressAutofill>
    </form>
  );
}
export default Careers