import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileIcon.css';

const ProfileIcon = () => {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="profile-icon-container" ref={dropdownRef}>
      <div className="profile-icon" onClick={toggleDropdown}>
        {currentUser && currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName || 'User'} 
            className="profile-image"
          />
        ) : (
          <div className="profile-placeholder">
            {currentUser && currentUser.displayName 
              ? currentUser.displayName.charAt(0).toUpperCase() 
              : '?'}
          </div>
        )}
      </div>
      
      {isDropdownOpen && (
        <div className="profile-dropdown">
          {currentUser ? (
            <>
              <div className="profile-info">
                <p className="profile-name">{currentUser.displayName || 'User'}</p>
                <p className="profile-email">{currentUser.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                Profile
              </Link>
              <Link to="/my-ideas" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                My Ideas
              </Link>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileIcon; 