import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
    // useParams hook to extract the productId from the URL
    const { productId } = useParams();
    // useNavigate hook for programmatic navigation
    const navigate = useNavigate();

    // State for the fetched product details
    const [product, setProduct] = useState(null);
    // Loading state for API calls
    const [loading, setLoading] = useState(true);
    // Error state for API call failures
    const [error, setError] = useState(null);

    // States for user selections
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    // State for user feedback messages (e.g., "Added to cart!")
    const [message, setMessage] = useState('');

    // useEffect hook to fetch product details when the component mounts or productId changes
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true); // Start loading
            setError(null);   // Clear any previous errors
            setMessage('');   // Clear any previous messages

            try {
                // Fetch details for the specific product ID from the backend
                const res = await fetch(`http://localhost:5000/api/products/${productId}`);

                if (!res.ok) {
                    // If the response is not successful, throw an error
                    const errorDetails = await res.text();
                    throw new Error(`HTTP error! status: ${res.status}, Details: ${errorDetails}`);
                }

                const data = await res.json();
                setProduct(data); // Set the fetched product data
                
                // Set default selected size and color if available
                // Defensive check to ensure data.sizes is an array before accessing its length
                if (Array.isArray(data.sizes) && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                } else {
                    setSelectedSize(''); // Reset if no sizes are available
                }
                // Defensive check to ensure data.colors is an array before accessing its length
                if (Array.isArray(data.colors) && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                } else {
                    setSelectedColor(''); // Reset if no colors are available
                }

            } catch (err) {
                console.error(`Failed to fetch product details for ${productId}:`, err);
                setError('Failed to load product details. Please try again.'); // Set user-friendly error message
            } finally {
                setLoading(false); // End loading
            }
        };

        if (productId) {
            fetchProductDetails(); // Call the fetch function only if productId exists
        }
    }, [productId]); // Dependency array: re-run effect if productId changes

    // Function to handle adding the product to a local cart (localStorage)
    const handleAddToCart = () => {
        if (!product) {
            setMessage('Cannot add to cart: Product data not loaded.');
            return;
        }
        // Validate size and color selection if product has these options
        if (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) {
            setMessage('Please select a size.');
            return;
        }
        if (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor) {
            setMessage('Please select a color.');
            return;
        }

        try {
            // Get current cart items from localStorage
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

            // Create the item object to add to cart
            const itemToAdd = {
                productId: product._id,
                name: product.name,
                imageUrl: product.imageUrl,
                discountedPrice: product.discountedPrice,
                originalPrice: product.originalPrice,
                selectedSize,
                selectedColor,
                quantity,
                vendorName: product.vendorName, // Include vendor name
            };

            // Check if item already exists in cart with same size and color
            const existingItemIndex = cartItems.findIndex(
                (item) =>
                    item.productId === itemToAdd.productId &&
                    item.selectedSize === itemToAdd.selectedSize &&
                    item.selectedColor === itemToAdd.selectedColor
            );

            if (existingItemIndex > -1) {
                // If item exists, update its quantity
                cartItems[existingItemIndex].quantity += quantity;
                setMessage('Quantity updated in cart!');
            } else {
                // Otherwise, add new item to cart
                cartItems.push(itemToAdd);
                setMessage('Item added to cart!');
            }

            // Save updated cart items to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            console.log('Cart updated:', cartItems);

        } catch (e) {
            console.error('Error adding to cart:', e);
            setMessage('Failed to add to cart. Please try again.');
        }
    };

    // Function to handle "Buy Now" action
    const handleBuyNow = () => {
        handleAddToCart(); // Add to cart first
        navigate('/cart'); // Then navigate to a hypothetical cart or checkout page
        // You would typically have a /cart or /checkout route defined in App.js
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
                <div className="text-xl text-gray-700">Loading product details...</div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 font-sans p-4">
                <div className="text-xl text-red-700">{error}</div>
            </div>
        );
    }

    // Render "Product not found" if product data is null after loading
    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-100 font-sans p-4">
                <div className="text-xl text-yellow-700">Product not found.</div>
            </div>
        );
    }

    // Main render for product details
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl w-full bg-white shadow-2xl rounded-xl overflow-hidden md:flex md:flex-row flex-col p-6">

                {/* Product Image Section */}
                <div className="md:w-1/2 flex items-center justify-center p-4">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="rounded-lg shadow-lg object-contain max-h-[500px] w-full"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Available"; }}
                    />
                </div>

                {/* Product Details Section */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            By <span className="font-semibold text-indigo-600">{product.vendorName || 'Unknown Vendor'}</span>
                        </p>

                        {/* Rating & Reviews */}
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400 mr-2">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className="text-xl">
                                        {i < Math.floor(product.rating) ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                            <span className="text-gray-700 text-lg font-medium">
                                {product.rating} ({product.reviews} reviews)
                            </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-baseline mb-6 space-x-3">
                            <span className="text-4xl font-bold text-indigo-700">₹{product.discountedPrice}/-</span>
                            {product.originalPrice && product.originalPrice > product.discountedPrice && (
                                <>
                                    <span className="text-2xl text-gray-500 line-through">₹{product.originalPrice}/-</span>
                                    <span className="text-xl font-semibold text-green-600">{product.discountPercent}% OFF</span>
                                </>
                            )}
                        </div>

                        {/* Category */}
                        <p className="text-lg text-gray-700 mb-4">
                            Category: <span className="font-semibold">{product.category ? product.category.toUpperCase() : 'N/A'}</span>
                        </p>

                        {/* Description (assuming you'll add a description field in your product model) */}
                        {product.description && (
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                        
                        {/* Size Selection */}
                        {/* Added defensive check (product.sizes || []) to ensure it's always an array */}
                        {(Array.isArray(product.sizes) && product.sizes.length > 0) && (
                            <div className="mb-6">
                                <label htmlFor="size-select" className="block text-lg font-medium text-gray-700 mb-2">
                                    Select Size:
                                </label>
                                <select
                                    id="size-select"
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                                >
                                    {/* Added defensive check (product.sizes || []) here as well */}
                                    {(product.sizes || []).map((size, index) => (
                                        <option key={index} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Color Selection */}
                        {/* Added defensive check (product.colors || []) to ensure it's always an array */}
                        {(Array.isArray(product.colors) && product.colors.length > 0) && (
                            <div className="mb-6">
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                    Available Colors:
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {/* Added defensive check (product.colors || []) here as well */}
                                    {(product.colors || []).map((color, index) => (
                                        <span
                                            key={index}
                                            className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out
                                            ${selectedColor === color ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                            title={color} // Add title for accessibility
                                        >
                                            {selectedColor === color && (
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label htmlFor="quantity-input" className="block text-lg font-medium text-gray-700 mb-2">
                                Quantity:
                            </label>
                            <input
                                id="quantity-input"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Ensure quantity is at least 1
                                className="w-24 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base text-center"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={handleAddToCart}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out transform hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out transform hover:scale-105"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <p className={`mt-4 text-center text-lg ${message.includes('Added') || message.includes('updated') ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
