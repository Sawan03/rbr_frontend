import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './AdminDashboard.css';
import VendorDashboard from './VendorDashboard';
import SuperadminDashboard from './SuperadminDashboard';

// ✅ Define backend base URL for easy reuse
const API_BASE_URL = 'https://rbr-z6sn.onrender.com/v';

const AdminDashboard = () => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const authenticateUser = async () => {
      setLoadingAuth(true);
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);
          setRole(decoded.role);
          setUserId(decoded.id);
          setUsername(decoded.username);

          setLoadingAuth(false);
          setAuthError('');
        } catch (error) {
          console.error('Authentication Error:', error);
          setAuthError('Authentication session invalid. Please log in again.');
          setMessage('Authentication session invalid. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/admin-login';
          setLoadingAuth(false);
        }
      } else {
        console.log('No token found. Redirecting to admin-login.');
        setAuthError('No active session found. Please log in.');
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
        setLoadingAuth(false);
      }
    };

    authenticateUser();
  }, []);

  const handleLogout = async () => {
    const currentToken = localStorage.getItem('token');
    try {
      if (currentToken) {
        await axios.post(`${API_BASE_URL}/api/logout`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        setMessage('Logout successful!');
      }
    } catch (err) {
      console.error('Error during backend logout:', err?.response?.data || err.message);
      setMessage(`Logout failed: ${err.response?.data?.message || err.message}`);
    } finally {
      localStorage.removeItem('token');
      setRole(null);
      setUserId(null);
      setUsername(null);
      setMessage('');
      setAuthError('');
      window.location.href = '/admin-login';
    }
  };

  const renderDashboardContent = () => {
    if (loadingAuth) {
      return <p className="loading-message">Authenticating user...</p>;
    }

    if (authError) {
      return <p className="error-message">{authError}</p>;
    }

    if (role === 'vendor' && userId && username) {
      return <VendorDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    } else if (role === 'admin' && userId && username) {
      return <VendorDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    } else if (role === 'superadmin' && userId && username) {
      return <SuperadminDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    } else {
      return (
        <p className="no-access-message">
          Access Denied: Your role ({role || 'unknown'}) does not permit dashboard access or required user data is missing.
          Please ensure you are logged in with the correct account type.
        </p>
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          🛍️ {
            role === 'superadmin' ? 'Superadmin' :
            role === 'vendor' ? 'Vendor' :
            'Admin'
          } Dashboard
        </h1>
        <div className="header-right">
          {username && !loadingAuth && (
            <div className="user-info">
              Welcome, <span className="username">{username}</span>!
            </div>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <div className="dashboard-main">
        {message && (
          <p className={`status-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
