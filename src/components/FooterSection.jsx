// src/components/FooterSection.jsx
import React from 'react';
import './FooterSection.css';
import menImg from '../assets/men.png';
import womenImg from '../assets/women.png';
import kidsImg from '../assets/kids.png';
import dressImg from '../assets/dress.png';
import shoesImg from '../assets/shoes.png';
import jewelleryImg from '../assets/jewellery.png';

const categories = [
  { title: 'MEN', image: menImg },
  { title: 'WOMEN', image: womenImg },
  { title: 'KIDS', image: kidsImg },
  { title: 'DRESS', image: dressImg },
  { title: 'SHOES', image: shoesImg },
  { title: 'JEWELLERY', image: jewelleryImg },
];

const FooterSection = () => {
  return (
    <div className="footer-section">
      <h2 className="footer-title">SHOP BY CATEGORY</h2>

      <div className="footer-category-grid">
        {categories.map((cat, idx) => (
          <div className="footer-category-card" key={idx}>
            <img src={cat.image} alt={cat.title} className="footer-category-image" />
            <h3 className="footer-category-label">{cat.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterSection;
