import React, { useState, useEffect } from 'react';
import NavbarWeatherInfo from '../components/navbarWeatherInfo';

const Navbar = () => {
  return (
      <>
      <div style={{ display: 'flex', padding: '1rem' }}>
        <NavbarWeatherInfo />
      </div>
      </>
  );
};

export default Navbar;
