import React, { useState, useEffect } from 'react';
import axios from 'axios';


const VendorDashboard = ({ userId, username, token, setMessage }) => {
  const [tab, setTab] = useState('addProduct'); // Default tab for vendor
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const initialProduct = {
    name: '',
    productType: 'Shoes',
    category: 'Mens',
    imageUrl: '',
    originalPrice: '',
    discountedPrice: '',
    discountPercent: '',
    rating: '',
    reviews: '',
    sizes: '',
    colors: '',
  };
  const [product, setProduct] = useState(initialProduct);
  const [productType, setProductType] = useState('Shoes');

  // Effect to fetch products when 'manageProducts' tab is active
  useEffect(() => {
    if (tab === 'manageProducts') {
      fetchProducts();
    }
  }, [tab, userId, token]);

  // Effect to fetch orders when 'orders' tab is active
  useEffect(() => {
    if (tab === 'orders') {
      fetchOrders();
    }
  }, [tab, userId, token]);

  const fetchProducts = async () => {
    try {
      const url = `https://rbr-z6sn.onrender.com/v/api/products?vendorId=${userId}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      console.log('Vendor Dashboard: Products fetched successfully.');
    } catch (err) {
      console.error('Vendor Dashboard Error: Failed to fetch products:', err);
      setMessage('❌ Failed to fetch products.');
    }
  };

  const fetchOrders = async () => {
    try {
      const url = `https://rbr-z6sn.onrender.com/v/api/orders?vendorId=${userId}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      console.log('Vendor Dashboard: Orders fetched successfully.');
    } catch (err) {
      console.error('Vendor Dashboard Error: Failed to fetch orders:', err);
      setMessage('❌ Failed to fetch orders.');
    }
  };

  const handleProductTypeChange = (e) => {
    const type = e.target.value;
    setProductType(type);
    setProduct({
      ...product,
      productType: type,
      category: type === 'Shoes' ? 'Mens' : 'Womens',
    });
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...product,
        vendorId: userId,
        vendorName: username,
        sizes: product.sizes.split(',').map((s) => s.trim()).filter(s => s !== '').map(Number),
        colors: product.colors.split(',').map((c) => c.trim()).filter(c => c !== ''),
        originalPrice: Number(product.originalPrice),
        discountedPrice: Number(product.discountedPrice),
        discountPercent: Number(product.discountPercent),
        rating: Number(product.rating),
        reviews: Number(product.reviews),
      };

      let res;
      if (editingProduct) {
        res = await axios.put(`https://rbr-z6sn.onrender.com/v/api/products/${editingProduct._id}`, payload, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Product updated successfully!');
        setEditingProduct(null);
      } else {
        res = await axios.post('https://rbr-z6sn.onrender.com/v/api/products', payload, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Product added successfully!');
      }

      if (res.status === 201 || res.status === 200) {
        setProduct({
          ...initialProduct,
          productType,
          category: productType === 'Shoes' ? 'Mens' : 'Womens',
        });
        fetchProducts(); // Refresh vendor's product list
      }
    } catch (err) {
      console.error('Vendor Dashboard Error: Failed to save product:', err);
      setMessage(`❌ Failed to save product: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditProduct = (productToEdit) => {
    setEditingProduct(productToEdit);
    setProduct({
      name: productToEdit.name,
      productType: productToEdit.productType,
      category: productToEdit.category,
      imageUrl: productToEdit.imageUrl,
      originalPrice: productToEdit.originalPrice,
      discountedPrice: productToEdit.discountedPrice,
      discountPercent: productToEdit.discountPercent,
      rating: productToEdit.rating,
      reviews: productToEdit.reviews,
      sizes: productToEdit.sizes.join(', '),
      colors: productToEdit.colors.join(', '),
    });
    setProductType(productToEdit.productType);
    setTab('addProduct');
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://rbr-z6sn.onrender.com/v/api/products/${productId}`, {
{
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        console.error('Vendor Dashboard Error: Failed to delete product:', err);
        setMessage(`❌ Failed to delete product: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  return (
    <>
      <nav className="dashboard-sidebar">
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => { setTab('addProduct'); setEditingProduct(null); setProduct(initialProduct); }}
              className={`sidebar-button ${tab === 'addProduct' ? 'active' : ''}`}
            >
              ➕ Add Product
            </button>
          </li>
          <li>
            <button
              onClick={() => setTab('manageProducts')}
              className={`sidebar-button ${tab === 'manageProducts' ? 'active' : ''}`}
            >
              📝 Manage Products
            </button>
          </li>
          <li>
            <button
              onClick={() => setTab('orders')}
              className={`sidebar-button ${tab === 'orders' ? 'active' : ''}`}
            >
              📦 View Your Orders
            </button>
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        {/* Add/Edit Product Section */}
        {tab === 'addProduct' && (
          <div className="tab-section add-product-section">
            <h2 className="section-title">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <div className="form-group">
              <label htmlFor="product-type-select" className="form-label">Product Type:</label>
              <select
                id="product-type-select"
                value={productType}
                onChange={handleProductTypeChange}
                className="form-select"
              >
                <option value="Shoes">Shoes</option>
                <option value="Dresses">Dresses</option>
              </select>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="category-select" className="form-label">Category:</label>
                <select
                  id="category-select"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {productType === 'Shoes' ? (
                    <>
                      <option value="Mens">Mens</option>
                      <option value="Womens">Womens</option>
                      <option value="Kids">Kids</option>
                    </>
                  ) : (
                    <>
                      <option value="Casual">Casual</option>
                      <option value="Formal">Formal</option>
                      <option value="Party">Party</option>
                    </>
                  )}
                </select>
              </div>
              {Object.keys(initialProduct).map(
                (key) =>
                  key !== 'productType' &&
                  key !== 'category' && (
                    <div className="form-group" key={key}>
                      <label htmlFor={key} className="form-label sr-only">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </label>
                      <input
                        id={key}
                        name={key}
                        type={['originalPrice', 'discountedPrice', 'discountPercent', 'rating', 'reviews'].includes(key) ? 'number' : 'text'}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        value={product[key]}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  )
              )}
              <button type="submit" className="submit-button">
                {editingProduct ? 'Update Product' : `Add ${productType}`}
              </button>
              {editingProduct && (
                <button type="button" onClick={() => { setEditingProduct(null); setProduct(initialProduct); }} className="cancel-edit-button">
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        )}

        {/* Manage Products Section */}
        {tab === 'manageProducts' && (
          <div className="tab-section manage-products-section">
            <h2 className="section-title">📝 Your Products</h2>
            {products.length === 0 ? (
              <p className="no-data-message">You have not added any products yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discounted Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{p.productType}</td>
                        <td>{p.category}</td>
                        <td>${p.originalPrice}</td>
                        <td>${p.discountedPrice}</td>
                        <td className="product-actions">
                          <button onClick={() => handleEditProduct(p)} className="action-button edit-button">Edit</button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="action-button delete-button">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Section */}
        {tab === 'orders' && (
          <div className="tab-section orders-section">
            <h2 className="section-title">📦 Your Orders</h2>
            {orders.length === 0 ? (
              <p className="no-data-message">No orders found.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.productName}</td>
                        <td>{order.customerName}</td>
                        <td><span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default VendorDashboard;
