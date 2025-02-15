// frontend/src/components/DataTable.jsx

import React, { useState } from 'react';

const DataTable = ({ data }) => {
  // State for the search query and sorting configuration
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  // Function to update sorting when a header is clicked
  const handleSort = (columnKey) => {
    let direction = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Filter data based on the search query (searching in country_name)
  const filteredData = data.filter((row) =>
    row.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort the filtered data based on the sort configuration
  let sortedData = [...filteredData];
  if (sortConfig.key !== '') {
    sortedData.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // If values are numbers, compare numerically
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      } else {
        // Compare as strings (case insensitive)
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      }
    });
  }

  return (
    <div>
      <h3>Data Table</h3>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by country name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
      />

      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort('year')}>
              Year {sortConfig.key === 'year' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('country_code')}>
              Country Code {sortConfig.key === 'country_code' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('country_name')}>
              Country Name {sortConfig.key === 'country_name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('t2m')}>
              T2M {sortConfig.key === 't2m' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('d2m')}>
              D2M {sortConfig.key === 'd2m' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('tp')}>
              TP {sortConfig.key === 'tp' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('leptospirosis_rate')}>
              Leptospirosis Rate {sortConfig.key === 'leptospirosis_rate' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('temperature_celsius')}>
              Temperature (°C) {sortConfig.key === 'temperature_celsius' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('dew_point_celsius')}>
              Dew Point (°C) {sortConfig.key === 'dew_point_celsius' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
            <th onClick={() => handleSort('relative_humidity')}>
              Relative Humidity {sortConfig.key === 'relative_humidity' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.id}>
              <td>{row.year}</td>
              <td>{row.country_code}</td>
              <td>{row.country_name}</td>
              <td>{row.t2m}</td>
              <td>{row.d2m}</td>
              <td>{row.tp}</td>
              <td>{row.leptospirosis_rate}</td>
              <td>{row.temperature_celsius}</td>
              <td>{row.dew_point_celsius}</td>
              <td>{row.relative_humidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
