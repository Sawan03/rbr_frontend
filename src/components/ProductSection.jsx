import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import './ProductSection.css';
// Import heart icon (assuming it's an SVG or a component, e.g., from Lucide React)
// Example: import { Heart } from 'lucide-react';

const ProductSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null);    // State for error messages
    const navigate = useNavigate(); // Initialize useNavigate hook for programmatic navigation

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true); // Set loading to true when fetching starts
            setError(null);   // Clear any previous errors

            try {
                // Fetch all products for the best sellers section
                // This route is now public after our backend changes
                const res = await fetch('http://localhost:5000/api/products');

                if (!res.ok) {
                    // If response is not OK (e.g., 404, 500), throw an error
                    const errorDetails = await res.text(); // Get response body for more info
                    throw new Error(`HTTP error! status: ${res.status}, Details: ${errorDetails}`);
                }

                const data = await res.json();
                setProducts(data); // Set the fetched products
            } catch (err) {
                console.error('Failed to fetch products for ProductSection:', err);
                setError('Failed to load products. Please try again later.'); // Set an error message for the user
            } finally {
                setLoading(false); // Set loading to false once fetching is complete (success or error)
            }
        };

        fetchAllProducts(); // Call the fetch function
    }, []); // Empty dependency array means this runs once on component mount

    // Function to handle click on a product card, navigating to its detail page
    const handleProductCardClick = (productId) => {
        // Navigate to the product detail page using the product's ID
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
                    // Display loading message while products are being fetched
                    <div className="loading-message">Loading best sellers...</div>
                ) : error ? (
                    // Display error message if fetching failed
                    <div className="error-message">{error}</div>
                ) : products.length > 0 ? (
                    // Render product cards if products array is not empty
                    <div className="product-grid">
                        {products.map((product) => (
                            <div
                                className="product-card"
                                key={product._id} // Unique key for each product is essential
                                onClick={() => handleProductCardClick(product._id)} // Make the card clickable
                            >
                                <div className="product-image-container">
                                    <img src={product.imageUrl} alt={product.name} className="product-img" />
                                    <div className="wishlist-icon">
                                        {/* You can replace this with an actual heart icon component or SVG */}
                                        ❤️
                                    </div>
                                </div>

                                <div className="product-details">
                                    <div className="product-meta">
                                        <div className="rating">
                                            <span className="star-icon">⭐</span> {product.rating} ({product.reviews})
                                        </div>
                                        <div className="category">{product.category ? product.category.toUpperCase() : 'N/A'}</div>
                                    </div>
                                    <h3 className="name">{product.name}</h3>

                                    <div className="price-section">
                                        <span className="price">₹{product.discountedPrice}/-</span>
                                        <span className="strike">₹{product.originalPrice}/-</span>
                                        <span className="offer">{product.discountPercent}% OFF</span>
                                    </div>

                                    <div className="size-info">Size {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'N/A'}</div>

                                    <div className="colors-selector">
                                        {product.colors && product.colors.length > 0 ? (
                                            product.colors.map((color, index) => (
                                                <span
                                                    key={index} // Key for color dots
                                                    className="color-dot"
                                                    style={{ backgroundColor: color }}
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
                    // Display message if no products are found after loading
                    <div className="no-products-message">No products found. Please check your backend.</div>
                )}
            </div>
        </div>
    );
};

export default ProductSection;