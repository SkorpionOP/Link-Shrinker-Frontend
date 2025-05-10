import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './pages/modern.css';

// Import Firebase authentication
import { auth } from './firebase/firebase'; // Assuming firebase.js is in the same directory
import { onAuthStateChanged } from 'firebase/auth';

// Import pages
import LoginPage from './pages/Login';
import HomePage from './pages/HomePage';
import QRCodeGenerator from './pages/qrGen';
import UrlAnalytics from './pages/UrlAnalytics';
import UrlShortener from './pages/shortUrl';

function App() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uid, setUid] = useState("guest");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); // Start loading when checking auth state
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        setUid(user.uid);
        setIsAuthenticated(true);
        console.log('Authenticated:', { uid: user.uid, token });
      } else {
        localStorage.removeItem('authToken');
        setUid("guest");
        setIsAuthenticated(false);
        console.log('Not authenticated, uid set to guest');
      }
      setIsLoading(false); // Stop loading once auth state is resolved
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('authToken');
      // onAuthStateChanged will handle setting uid and isAuthenticated
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

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
            ☰
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/shorten" className="mobile-nav-link" onClick={toggleMobileMenu}>Shrink</Link>
          <Link to="/qrcode" className="mobile-nav-link" onClick={toggleMobileMenu}>QR Code</Link>
          <Link to="/analytics" className="mobile-nav-link" onClick={toggleMobileMenu}>Analytics</Link>
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="mobile-nav-link logout-button">
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
            <Route path="/analytics" element={<UrlAnalytics uid={uid} />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<h2>404: Page Not Found</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
