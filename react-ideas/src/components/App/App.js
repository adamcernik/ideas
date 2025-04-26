import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthContext';

// Components
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import HomePage from '../../pages/HomePage/HomePage';
import LoginPage from '../../pages/AuthPages/LoginPage';
import RegisterPage from '../../pages/AuthPages/RegisterPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';

// Styles
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 