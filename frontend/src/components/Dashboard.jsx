// frontend/src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from './DataTable';
import MapView from './MapView';
import LineGraph from './LineGraph';
import './Dashboard.css';
import logo from './img/biobites.jpg';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('table');
  const navigate = useNavigate();

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/api/leptospirosis')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Logo and Title - Clicking navigates to the Landing Page */}
      <div className="dashboard-header" onClick={() => navigate('/')}>
        <img src={logo} alt="BioBytes Logo" className="logo" />
        <h1 className="title">Biobytes</h1>
      </div>

      <h2>Dashboard</h2>

      {/* Tabs Navigation */}
      <div className="tabs">
        <button className={activeTab === 'table' ? 'active' : ''} onClick={() => setActiveTab('table')}>
          Data Table
        </button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>
          Map View
        </button>
        <button className={activeTab === 'graph' ? 'active' : ''} onClick={() => setActiveTab('graph')}>
          Line Graph
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'table' && (
          <div className="data-table-container" style={{ overflowX: 'auto' }}> {/* Added container for DataTable */}
            <DataTable data={data} />
          </div>
        )}
        {activeTab === 'map' && <MapView data={data} />}
        {activeTab === 'graph' && <LineGraph data={data} />}
      </div>
    </div>
  );
};

export default Dashboard;