import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    // In a real app, this would make an API call to authenticate
    // and get user data from the server
    
    // For demo purposes, we'll just store the user data
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  // Register function
  const register = (userData) => {
    // In a real app, this would make an API call to create a new user
    // For demo purposes, we'll just simulate success and log the user in
    return login({
      id: Math.random().toString(36).substr(2, 9),
      ...userData
    });
  };

  // Context value
  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 