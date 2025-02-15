// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AboutPage from './components/about';
import RiskAnalysis from './components/RiskAnalysis';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;
