import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductSection.css';

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('https://rbr-z6sn.onrender.com/v/api/products');
        if (!res.ok) {
          const errorDetails = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, Details: ${errorDetails}`);
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products for ProductSection:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const handleProductCardClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="product-section-wrapper">
      <div className="product-header">
        <h2 className="product-title">BEST SELLERS</h2>
        <button className="view-more-btn">VIEW MORE</button>
      </div>

      <div className="product-grid-container">
        {loading ? (
          <div className="loading-message">Loading best sellers...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product._id}
                onClick={() => handleProductCardClick(product._id)}
              >
                <div className="product-image-container">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x400/EEE/333?text=Image+Not+Available';
                    }}
                  />
                  <div className="wishlist-icon" title="Add to Wishlist">
                    ❤️
                  </div>
                </div>

                <div className="product-details">
                  <div className="product-meta">
                    <div className="rating">
                      <span className="star-icon">⭐</span> {product.rating || 0} ({product.reviews || 0})
                    </div>
                    <div className="category">{product.category ? product.category.toUpperCase() : 'N/A'}</div>
                  </div>

                  <h3 className="name">{product.name}</h3>

                  <div className="price-section">
                    <span className="price">₹{product.discountedPrice}/-</span>
                    <span className="strike">₹{product.originalPrice}/-</span>
                    <span className="offer">{product.discountPercent}% OFF</span>
                  </div>

                  <div className="size-info">
                    Size: {product.sizes?.length > 0 ? product.sizes.join(', ') : 'N/A'}
                  </div>

                  <div className="colors-selector">
                    {product.colors?.length > 0 ? (
                      product.colors.map((color, index) => (
                        <span
                          key={index}
                          className="color-dot"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))
                    ) : (
                      <span className="no-colors">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products-message">No products found. Please check your backend.</div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;
