import React from 'react';
import './CategorySection.css';

import sneakers from '../assets/sneaker.png';
import sports from '../assets/Sport.png';
import formals from '../assets/formal.png';
import garmentIcon from '../assets/garment.png';

// ✅ Define category data as a constant outside the component
const categories = [
  { name: 'Sneakers', img: sneakers, type: 'full' },
  { name: 'Sports', img: sports, type: 'full' },
  { name: 'Formals', img: formals, type: 'full' },
  { name: 'Garments', img: garmentIcon, type: 'card' },
];

const CategorySection = () => {
  return (
    <div className="category-wrapper">
      <h2 className="category-heading">EXPLORE OUR CATEGORIES</h2>
      <div className="category-row">
        {categories.map(({ name, img, type }, index) => (
          type === 'full' ? (
            <img
              key={index}
              src={img}
              alt={name}
              className="category-image"
            />
          ) : (
            <div className="garment-card" key={index}>
              <img src={img} alt={name} className="garment-icon" />
              <p className="garment-label">
                EXPLORE<br />GARMENT<br />CATEGORIES
              </p>
              <span className="garment-arrow">→</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
