import React, { useState } from 'react';
import axios from 'axios';
import './VendorRegistration.css'; // optional styling

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    location: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/register-vendor-public', formData);
      setMessage(res.data.message || 'Registered successfully!');
      setFormData({ name: '', email: '', username: '', password: '', location: '' });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setMessage(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="vendor-register-container">
      <h2>Vendor Registration</h2>
      <form onSubmit={handleSubmit} className="vendor-form">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default VendorRegistration;
