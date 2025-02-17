import React, { useState } from 'react';
import './DataTable.css';

const DataTable = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [filters, setFilters] = useState({
    year: '',
    country_code: '',
    leptospirosis_rate: { min: '', max: '' },
    temperature_celsius: { min: '', max: '' },
    relative_humidity: { min: '', max: '' }
  });

  const handleSort = (columnKey) => {
    let direction = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleFilterChange = (key, value, type = 'exact') => {
    setFilters(prev => {
      if (type === 'exact') {
        return { ...prev, [key]: value };
      } else {
        return {
          ...prev,
          [key]: { ...prev[key], [type]: value }
        };
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      year: '',
      country_code: '',
      leptospirosis_rate: { min: '', max: '' },
      temperature_celsius: { min: '', max: '' },
      relative_humidity: { min: '', max: '' }
    });
    setSearchQuery('');
  };

  const filteredData = data.filter((row) => {
    if (!row.country_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.year && row.year.toString() !== filters.year) {
      return false;
    }
    if (filters.country_code && !row.country_code.toLowerCase().includes(filters.country_code.toLowerCase())) {
      return false;
    }
    const rangeFilters = [
      { key: 'leptospirosis_rate', value: filters.leptospirosis_rate },
      { key: 'temperature_celsius', value: filters.temperature_celsius },
      { key: 'relative_humidity', value: filters.relative_humidity }
    ];
    return rangeFilters.every(({ key, value }) => {
      if (value.min && parseFloat(row[key]) < parseFloat(value.min)) return false;
      if (value.max && parseFloat(row[key]) > parseFloat(value.max)) return false;
      return true;
    });
  });

  let sortedData = [...filteredData];
  if (sortConfig.key !== '') {
    sortedData.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        return sortConfig.direction === 'ascending' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
    });
  }

  return (
    <div className="data-table-container">
      <h2 className="table-title">Data Table</h2>
      
      <div className="search-reset-container">
        <input
          type="text"
          placeholder="Search by country name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button onClick={resetFilters} className="reset-button">
          Reset Filters
        </button>
      </div>

      <div className="filters-section">
        {/* Year Filter */}
        <div className="filter-card filter-year">
          <label>Year</label>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            placeholder="Filter by year"
          />
        </div>

        {/* Country Code Filter */}
        <div className="filter-card filter-country">
          <label>Country Code</label>
          <input
            type="text"
            value={filters.country_code}
            onChange={(e) => handleFilterChange('country_code', e.target.value)}
            placeholder="Filter by code"
          />
        </div>

        {/* Range Filters */}
        <div className="filter-card filter-leptospirosis">
          <label>Leptospirosis Rate</label>
          <div className="range-inputs">
            <input
              type="number"
              value={filters.leptospirosis_rate.min}
              onChange={(e) => handleFilterChange('leptospirosis_rate', e.target.value, 'min')}
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.leptospirosis_rate.max}
              onChange={(e) => handleFilterChange('leptospirosis_rate', e.target.value, 'max')}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-card filter-temperature">
          <label>Temperature Celsius</label>
          <div className="range-inputs">
            <input
              type="number"
              value={filters.temperature_celsius.min}
              onChange={(e) => handleFilterChange('temperature_celsius', e.target.value, 'min')}
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.temperature_celsius.max}
              onChange={(e) => handleFilterChange('temperature_celsius', e.target.value, 'max')}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-card filter-humidity">
          <label>Relative Humidity</label>
          <div className="range-inputs">
            <input
              type="number"
              value={filters.relative_humidity.min}
              onChange={(e) => handleFilterChange('relative_humidity', e.target.value, 'min')}
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.relative_humidity.max}
              onChange={(e) => handleFilterChange('relative_humidity', e.target.value, 'max')}
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {[
                'year', 'country_code', 'country_name', 't2m', 'd2m', 'tp',
                'leptospirosis_rate', 'temperature_celsius', 'dew_point_celsius', 'relative_humidity'
              ].map((column) => (
                <th key={column} onClick={() => handleSort(column)}>
                  {column.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {sortConfig.key === column && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
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
    </div>
  );
};

export default DataTable;