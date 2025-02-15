// Updated frontend/src/components/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Add the About Us link */}
      <nav className="top-nav">
        <button 
          className="about-link"
          onClick={() => navigate('/about')}
        >
          About Us
        </button>
      </nav>

      <div className="hero-content">
        <h1 className="hero-title">Leptospirosis Prediction Database</h1>
        <p className="hero-description">
          A comprehensive database for leptospirosis data analysis and prediction.
        </p>
        
        <div className="cta-buttons">
          <button 
            className="cta-button primary"
            onClick={() => navigate('/dashboard')}
          >
            Access Dashboard
          </button>
          <button
            className="cta-button secondary"
            onClick={() => navigate('/risk-analysis')}
          >
            Predictive Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;