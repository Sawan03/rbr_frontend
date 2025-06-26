import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Ensure this is correctly imported
import './AdminDashboard.css'; // Your existing CSS
import VendorDashboard from './VendorDashboard'; // Import the new components
import SuperadminDashboard from './SuperadminDashboard';

const AdminDashboard = () => {
  // Initialize states to null to indicate that values are not yet determined
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  // State to track if authentication check is in progress
  const [loadingAuth, setLoadingAuth] = useState(true);
  // State to hold authentication specific errors
  const [authError, setAuthError] = useState('');
  // Global message for the dashboard (success/error messages from child components)
  const [message, setMessage] = useState('');

  // useEffect to handle user authentication when the component mounts
  useEffect(() => {
    const authenticateUser = async () => {
      setLoadingAuth(true); // Start authentication loading
      const token = localStorage.getItem('token'); // Get the token directly from local storage

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // IMPORTANT: These lines are crucial. They now correctly match your JWT payload.
          setRole(decoded.role);        // Sets 'vendor' from your token
          setUserId(decoded.id);        // Sets '685c3f918a26d1c1d830dac9' from your token
          setUsername(decoded.username);  // Sets 'rahul' from your token

          setLoadingAuth(false); // Authentication successful, stop loading
          setAuthError(''); // Clear any previous authentication errors
        } catch (error) {
          console.error('Authentication Error: Failed to decode token or token invalid:', error);
          setAuthError('Authentication session invalid. Please log in again.'); // Specific error for invalid token
          setMessage('Authentication session invalid. Please log in again.');
          localStorage.removeItem('token'); // Clear invalid token
          // Redirect to login page
          window.location.href = '/admin-login';
          setLoadingAuth(false); // Authentication failed, stop loading
        }
      } else {
        // No token found, user is not logged in
        console.log('No token found. Redirecting to admin-login.');
        setAuthError('No active session found. Please log in.');
        localStorage.removeItem('token'); // Ensure no stale token remains
        // Redirect to login page
        window.location.href = '/admin-login';
        setLoadingAuth(false); // Authentication check complete (failed)
      }
    };

    authenticateUser();
    // Empty dependency array ensures this effect runs only once when the component mounts
  }, []);

  // Handler for user logout
  const handleLogout = async () => {
    const currentToken = localStorage.getItem('token');
    try {
      if (currentToken) {
        // Attempt to log out on the backend (optional, but good practice for session invalidation)
        await axios.post('http://localhost:5000/api/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        setMessage('Logout successful!'); // Provide feedback
      }
    } catch (err) {
      console.error('Error during backend logout:', err?.response?.data || err.message);
      setMessage(`Logout failed: ${err.response?.data?.message || err.message}`);
    } finally {
      // Clear token and all user-related states from frontend regardless of backend logout success/failure
      localStorage.removeItem('token');
      setRole(null);
      setUserId(null);
      setUsername(null);
      setMessage('');
      setAuthError('');
      // Redirect to admin login page
      window.location.href = '/admin-login';
    }
  };

  // Conditional rendering function for the main dashboard content based on role and loading status
  const renderDashboardContent = () => {
    // 1. Show loading state while authentication is in progress
    if (loadingAuth) {
      return <p className="loading-message">Authenticating user...</p>;
    }

    // 2. Show authentication error if something went wrong during token decoding/validation
    if (authError) {
      return <p className="error-message">{authError}</p>;
    }

    // 3. Render the specific dashboard based on the determined role
    // IMPORTANT: 'vendor' role is now explicitly handled
    if (role === 'vendor' && userId && username) {
      return <VendorDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    }
    // If you have an 'admin' role that also uses the VendorDashboard, keep this check
    // Otherwise, you might map 'admin' to a different dashboard or remove this block.
    else if (role === 'admin' && userId && username) {
        return <VendorDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    }
    // Render SuperadminDashboard for the 'superadmin' role
    else if (role === 'superadmin' && userId && username) {
      return <SuperadminDashboard userId={userId} username={username} token={localStorage.getItem('token')} setMessage={setMessage} />;
    }
    // Fallback: If role is determined but doesn't match any known dashboard types,
    // or if userId/username are somehow null after authentication (shouldn't happen if token is valid)
    else {
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
            role === 'superadmin' ? 'Superadmin' : // Title for superadmin
            role === 'vendor' ? 'Vendor' :         // Title for vendor
            'Admin'                                // Default title if role is not yet determined or different
          } Dashboard
        </h1>
        <div className="header-right">
          {/* Display username only if it's available and authentication is complete */}
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
        {/* Display global messages */}
        {message && <p className={`status-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        {/* Render the appropriate dashboard content */}
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;