import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HeroSection.css';

import footwear from '../assets/footwear.png';
import searchIcon from '../assets/search.png';
import userIcon from '../assets/user.png';
import cartIcon from '../assets/cart.png';
import rbrLogo from '../assets/RBR.png';

const API_BASE_URL = 'https://rbr-z6sn.onrender.com/v';

const HeroSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/products?category=Mens`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="hero-wrapper">
      {/* Navigation */}
      <header className="navbar">
        <div className="nav-left">
          <a href="#">MEN</a>
          <a href="#">WOMEN</a>
          <a href="#">NEW ARRIVALS</a>
        </div>
        <div className="logo">
          <img src={rbrLogo} alt="RBR Logo" className="logo-img" />
        </div>
        <div className="nav-right">
          <a href="/search">
            <img src={searchIcon} alt="Search" className="nav-icon" />
          </a>
          <a href="/profile">
            <img src={userIcon} alt="User" className="nav-icon" />
          </a>
          <a href="/cart">
            <img src={cartIcon} alt="Cart" className="nav-icon" />
          </a>
        </div>
      </header>

      {/* Sale Banner */}
      <div className="sale-banner">
        <span>
          <strong>Spring Sale - Up to 50% off</strong>&nbsp;
          Use code <span className="code">RBR20</span> for 20% off
        </span>
      </div>

      {/* Hero Main */}
      <main className="hero-section">
        <div className="hero-right">
          <img src={footwear} alt="Footwear" />
        </div>
        <div className="hero-left">
          <h1>Step into Style<br />with RBR Footwear</h1>
          <p>Elevate your style with RBR Footwear, where comfort meets modern design.</p>
          <div className="btn-group">
            <button className="btn-shop">SHOP NOW</button>
            <button className="btn-explore">EXPLORE COLLECTIONS</button>
          </div>
        </div>
      </main>

      {/* Optional: Display fetched products */}
      {/* 
      <div className="product-preview">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} />
            <p>{product.name}</p>
          </div>
        ))}
      </div>
      */}
    </div>
  );
};

export default HeroSection;
