import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      setMessage('');

      try {
        const res = await fetch(`https://rbr-z6sn.onrender.com/v/api/products/${productId}`);
        if (!res.ok) {
          const errorDetails = await res.text();
          throw new Error(`HTTP error! status: ${res.status}, Details: ${errorDetails}`);
        }

        const data = await res.json();
        setProduct(data);

        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize('');
        }

        if (Array.isArray(data.colors) && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        } else {
          setSelectedColor('');
        }
      } catch (err) {
        console.error(`Failed to fetch product details for ${productId}:`, err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) {
      setMessage('Cannot add to cart: Product data not loaded.');
      return;
    }
    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) {
      setMessage('Please select a size.');
      return;
    }
    if (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor) {
      setMessage('Please select a color.');
      return;
    }

    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const itemToAdd = {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        discountedPrice: product.discountedPrice,
        originalPrice: product.originalPrice,
        selectedSize,
        selectedColor,
        quantity,
        vendorName: product.vendorName,
      };

      const existingItemIndex = cartItems.findIndex(
        (item) =>
          item.productId === itemToAdd.productId &&
          item.selectedSize === itemToAdd.selectedSize &&
          item.selectedColor === itemToAdd.selectedColor
      );

      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity;
        setMessage('Quantity updated in cart!');
      } else {
        cartItems.push(itemToAdd);
        setMessage('Item added to cart!');
      }

      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error adding to cart:', e);
      setMessage('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-xl text-gray-700">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
        <div className="text-xl text-red-700">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100 p-4">
        <div className="text-xl text-yellow-700">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4 font-sans">
      <div className="max-w-6xl w-full bg-white shadow-2xl rounded-xl overflow-hidden md:flex p-6">
        <div className="md:w-1/2 flex items-center justify-center p-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="rounded-lg shadow-lg object-contain max-h-[500px] w-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Available';
            }}
          />
        </div>

        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-4">
              By <span className="font-semibold text-indigo-600">{product.vendorName || 'Unknown Vendor'}</span>
            </p>

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

            <div className="flex items-baseline mb-6 space-x-3">
              <span className="text-4xl font-bold text-indigo-700">₹{product.discountedPrice}/-</span>
              {product.originalPrice > product.discountedPrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">₹{product.originalPrice}/-</span>
                  <span className="text-xl font-semibold text-green-600">{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="text-lg text-gray-700 mb-4">
              Category: <span className="font-semibold">{product.category?.toUpperCase() || 'N/A'}</span>
            </p>

            {product.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            )}

            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label htmlFor="size-select" className="block text-lg font-medium text-gray-700 mb-2">
                  Select Size:
                </label>
                <select
                  id="size-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="block w-full p-3 border border-gray-300 rounded-md shadow-sm"
                >
                  {product.sizes.map((size, index) => (
                    <option key={index} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">Available Colors:</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <span
                      key={index}
                      className={`w-10 h-10 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all
                        ${selectedColor === color ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      {selectedColor === color && (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="quantity-input" className="block text-lg font-medium text-gray-700 mb-2">
                Quantity:
              </label>
              <input
                id="quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 p-3 border border-gray-300 rounded-md text-center"
              />
            </div>
          </div>

          <div className="mt-8 space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow transition hover:scale-105"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto px-6 py-3 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow transition hover:scale-105"
            >
              Buy Now
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 text-center text-lg font-semibold ${
                message.includes('added') || message.includes('updated') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
