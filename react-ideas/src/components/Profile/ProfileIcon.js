import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import AuthContext from '../Auth/AuthContext';
import './ProfileIcon.css';

const ProfileIcon = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  // If user is not authenticated, show login link
  if (!isAuthenticated) {
    return (
      <div className="profile-icon-container">
        <Link to="/login" className="login-link">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-icon-container" ref={dropdownRef}>
      <div className="profile-icon" onClick={toggleDropdown}>
        {user?.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={`${user.name}'s profile`} 
            className="user-avatar" 
          />
        ) : (
          <div className="default-avatar">
            <FaUser />
          </div>
        )}
      </div>

      {dropdownOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
          <div className="dropdown-items">
            <Link 
              to="/profile" 
              className="dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              Profile
            </Link>
            <Link 
              to="/settings" 
              className="dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              Settings
            </Link>
            <button 
              className="logout-button dropdown-item" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon; 