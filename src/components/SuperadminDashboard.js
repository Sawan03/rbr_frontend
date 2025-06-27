import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperadminDashboard = ({ userId, username, token, setMessage }) => {
  const [tab, setTab] = useState('manageVendors'); // Default tab for superadmin
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(''); // For adding product for a specific vendor

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


  // Effect to fetch vendors when 'manageVendors' or 'addProduct' tab is active
  useEffect(() => {
    if (tab === 'manageVendors' || tab === 'addProduct') {
      fetchVendors();
    }
  }, [tab, token]);

  // Effect to fetch orders when 'orders' tab is active
  useEffect(() => {
    if (tab === 'orders') {
      fetchOrders();
    }
  }, [tab, token]);


  const fetchVendors = async () => {
    try {
    const res = await axios.get('https://rbr-z6sn.onrender.com/v/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
      console.log('Superadmin Dashboard: Vendors fetched successfully.');
      if (res.data.length > 0 && !selectedVendor) {
        const approvedVendors = res.data.filter(v => v.isApproved);
        if (approvedVendors.length > 0) {
          setSelectedVendor(approvedVendors[0]._id);
        }
      }
    } catch (err) {
      console.error('Superadmin Dashboard Error: Failed to fetch vendors:', err);
      setMessage('❌ Failed to fetch vendors.');
    }
  };

  const fetchOrders = async () => {
    try {
      // Superadmin fetches all orders
     const url = 'https://rbr-z6sn.onrender.com/v/api/orders';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      console.log('Superadmin Dashboard: Orders fetched successfully.');
    } catch (err) {
      console.error('Superadmin Dashboard Error: Failed to fetch orders:', err);
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
    if (!selectedVendor) {
      setMessage('Please select a vendor to add the product.');
      return;
    }
    try {
      const payload = {
        ...product,
        vendorId: selectedVendor,
        vendorName: vendors.find(v => v._id === selectedVendor)?.username || 'N/A',
        sizes: product.sizes.split(',').map((s) => s.trim()).filter(s => s !== '').map(Number),
        colors: product.colors.split(',').map((c) => c.trim()).filter(c => c !== ''),
        originalPrice: Number(product.originalPrice),
        discountedPrice: Number(product.discountedPrice),
        discountPercent: Number(product.discountPercent),
        rating: Number(product.rating),
        reviews: Number(product.reviews),
      };

      await axios.post('https://rbr-z6sn.onrender.com/v/api/products', payload, {

        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Product added successfully!');
      setProduct({
        ...initialProduct,
        productType,
        category: productType === 'Shoes' ? 'Mens' : 'Womens',
      });
    } catch (err) {
      console.error('Superadmin Dashboard Error: Failed to add product:', err);
      setMessage(`❌ Failed to add product: ${err.response?.data?.message || err.message}`);
    }
  };

  const approveVendor = async (id) => {
    try {
      await axios.put(`https://rbr-z6sn.onrender.com/v/api/approve-vendor/${id}`, {}, {

        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Vendor approved!');
      fetchVendors();
    } catch (err) {
      console.error('Superadmin Dashboard Error: Failed to approve vendor:', err);
      setMessage(`❌ Failed to approve vendor: ${err.response?.data?.message || err.message}`);
    }
  };

  const rejectVendor = async (id) => {
    try {
      await axios.delete(`https://rbr-z6sn.onrender.com/v/api/reject-vendor/${id}`, {

        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Vendor removed!');
      fetchVendors();
    } catch (err) {
      console.error('Superadmin Dashboard Error: Failed to remove vendor:', err);
      setMessage(`❌ Failed to remove vendor: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <>
      <nav className="dashboard-sidebar">
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => setTab('manageVendors')}
              className={`sidebar-button ${tab === 'manageVendors' ? 'active' : ''}`}
            >
              🧑‍💼 Manage Vendors
            </button>
          </li>
          <li>
            <button
              onClick={() => { setTab('addProduct'); setProduct(initialProduct); }}
              className={`sidebar-button ${tab === 'addProduct' ? 'active' : ''}`}
            >
              ➕ Add Product (for a Vendor)
            </button>
          </li>
          <li>
            <button
              onClick={() => setTab('orders')}
              className={`sidebar-button ${tab === 'orders' ? 'active' : ''}`}
            >
              📦 View All Orders
            </button>
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        {/* Add Product Section */}
        {tab === 'addProduct' && (
          <div className="tab-section add-product-section">
            <h2 className="section-title">➕ Add New Product</h2>
            <div className="form-group">
              <label htmlFor="vendor-select" className="form-label">Vendor:</label>
              <select
                id="vendor-select"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a vendor</option>
                {vendors.length > 0 ? (
                  vendors.filter(v => v.isApproved).map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.username} ({vendor.location})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No approved vendors</option>
                )}
              </select>
            </div>
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
                Add {productType}
              </button>
            </form>
          </div>
        )}

        {/* Orders Section */}
        {tab === 'orders' && (
          <div className="tab-section orders-section">
            <h2 className="section-title">📦 All Orders</h2>
            {orders.length === 0 ? (
              <p className="no-data-message">No orders found.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Vendor</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.vendorName || 'N/A'}</td>
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

        {/* Manage Vendors Section */}
        {tab === 'manageVendors' && (
          <div className="tab-section manage-vendors-section">
            <h2 className="section-title">🧑‍💼 Manage Vendors</h2>
            {vendors.length === 0 ? (
              <p className="no-data-message">No vendors registered yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor._id}>
                        <td>{vendor.username}</td>
                        <td>{vendor.location}</td>
                        <td>
                          <span className={`vendor-status ${vendor.isApproved ? 'approved' : 'pending'}`}>
                            {vendor.isApproved ? '✅ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="vendor-actions">
                          {!vendor.isApproved && (
                            <button onClick={() => approveVendor(vendor._id)} className="action-button approve-button">Approve</button>
                          )}
                          <button onClick={() => rejectVendor(vendor._id)} className="action-button reject-button">Reject</button>
                        </td>
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

export default SuperadminDashboard;
