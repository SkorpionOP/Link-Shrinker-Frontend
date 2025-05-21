import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import './pages/modern.css';

// Import Firebase authentication
import { auth } from './firebase/firebase'; // Assuming firebase.js is in the same directory

// Import pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard'; // Renamed from HomePage based on your App.js
import QRCodeGenerator from './pages/qrGen';
import UrlAnalytics from './pages/UrlAnalytics';
import UrlShortener from './pages/shortUrl'; // ✅ Import Shortener

function App() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uid, setUid] = useState("guest");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid); // Set UID when the user is authenticated
        setIsAuthenticated(true);
      } else {
        setUid("guest"); // Set UID as 'guest' when the user is not logged in
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // No need to manually set UID or isAuthenticated as the auth listener will handle it
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <Link to="/">LinkShortener</Link>
          </div>

          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/shorten" className="nav-link">Shrink</Link>
            <Link to="/qrcode" className="nav-link">QR Code</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </div>

          <div className="mobile-menu-button" onClick={toggleMobileMenu}>
            &#9776;
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/shorten" className="mobile-nav-link" onClick={toggleMobileMenu}>Shrink</Link>
          <Link to="/qrcode" className="mobile-nav-link" onClick={toggleMobileMenu}>QR Code</Link>
          <Link to="/analytics" className="mobile-nav-link" onClick={toggleMobileMenu}>Analytics</Link>
          {isAuthenticated ? (
            <button onClick={() => {handleLogout(); toggleMobileMenu();}} className="mobile-nav-link logout-button">
              Logout
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={toggleMobileMenu}>Login</Link>
          )}
        </div>

        {/* Routes */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage uid={uid} />} />
            <Route path="/shorten" element={<UrlShortener uid={uid} />} />
            <Route path="/login" element={<LoginPage setUid={setUid} />} />
            <Route path="/qrcode" element={<QRCodeGenerator />} />
            <Route path="/analytics" element={<UrlAnalytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;