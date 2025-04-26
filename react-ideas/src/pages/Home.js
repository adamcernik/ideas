import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <h1>Idea Exchange Platform</h1>
        <p>Share and collaborate on business ideas between UX Designer and Product Manager</p>
        
        {!currentUser ? (
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        )}
      </div>
      
      <div className="features">
        <div className="feature">
          <h2>Share Ideas</h2>
          <p>Submit your business ideas and get feedback from the community.</p>
        </div>
        <div className="feature">
          <h2>Collaborate</h2>
          <p>Work together with other professionals to refine and improve ideas.</p>
        </div>
        <div className="feature">
          <h2>Find Inspiration</h2>
          <p>Browse existing ideas to spark your own creativity and innovation.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 