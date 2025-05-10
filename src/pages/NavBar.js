import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import './NavBar.css'; // You'll need to create this CSS file

const NavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Navigate to home page after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">Shrinkoo</Link>
      </div>
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/shrink" className="navbar-link">Shrink</Link>
        </li>
        <li className="navbar-item">
          <Link to="/qr-code" className="navbar-link">QR Code</Link>
        </li>
        <li className="navbar-item">
          <Link to="/analytics" className="navbar-link">Analytics</Link>
        </li>
        <li className="navbar-item">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="navbar-link logout-button">Logout</button>
          ) : (
            <Link to="/login" className="navbar-link">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
