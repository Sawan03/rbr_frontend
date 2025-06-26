import React from 'react'; // No need for useState, useEffect anymore in App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import your components
import HeroSection from './components/HeroSection';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import ProductDetailPage from './components/ProductDetailPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard'; // This component will handle its own authentication check
import ResponsibilitySection from './components/ResponsibilitySection';
import FooterSection from './components/FooterSection';
import VendorRegistration from './components/VendorRegistration';

function App() {
  // As discussed, the isAuthenticated state and its useEffect are no longer needed here.
  // AdminDashboard is now fully responsible for checking authentication and performing redirects.

  return (
    <Router>
      <Routes>
        {/* 🏠 Home Route - Publicly accessible for general visitors */}
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <CategorySection />
              <ProductSection />
              <ResponsibilitySection />
              <FooterSection />
            </>
          }
        />

        {/* 📦 Product Detail Route - Publicly accessible for viewing individual products */}
        <Route path="/products/:productId" element={<ProductDetailPage />} />

        {/* 📝 Vendor Registration Route - Publicly accessible for new vendor sign-ups */}
        <Route path="/vendor-register" element={<VendorRegistration />} />

        {/* 🔐 Admin Login Route - Publicly accessible for login */}
        {/* AdminLogin component will internally navigate to /dashboard upon successful login. */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* 📊 Admin Dashboard Route - Protected by the AdminDashboard component itself */}
        {/* The AdminDashboard component will internally handle checking for a valid token
            and user role, redirecting to /admin-login if access is not authorized. */}
        <Route
          path="/dashboard"
          element={<AdminDashboard />}
        />

        {/* 🚫 Optional 404 Route for unmatched paths */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;