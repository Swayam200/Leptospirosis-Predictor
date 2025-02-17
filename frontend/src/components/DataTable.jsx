import React, { useState } from 'react';

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
    <div className="w-full max-w-[95vw] mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Data Table</h2>
      
      <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
    <div className="flex-grow max-w-md">
      <input
        type="text"
        placeholder="Search by country name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
    <button
      onClick={resetFilters}
      className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
    >
      Reset Filters
    </button>
  </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {/* Year Filter */}
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <label className="block text-sm font-semibold text-gray-800 mb-2">Year</label>
      <input
        type="number"
        value={filters.year}
        onChange={(e) => handleFilterChange('year', e.target.value)}
        placeholder="Filter by year"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>

          {/* Country Code Filter */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <label className="block text-sm font-semibold text-gray-800 mb-2">Country Code</label>
      <input
        type="text"
        value={filters.country_code}
        onChange={(e) => handleFilterChange('country_code', e.target.value)}
        placeholder="Filter by code"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>

          {/* Range Filters */}
          {['leptospirosis_rate', 'temperature_celsius', 'relative_humidity'].map((field) => (
      <div key={field} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters[field].min}
            onChange={(e) => handleFilterChange(field, e.target.value, 'min')}
            placeholder="Min"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <input
            type="number"
            value={filters[field].max}
            onChange={(e) => handleFilterChange(field, e.target.value, 'max')}
            placeholder="Max"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    ))}
  </div>


        {/* Table Section */}
        <div className="border rounded shadow">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    'year', 'country_code', 'country_name', 't2m', 'd2m', 'tp',
                    'leptospirosis_rate', 'temperature_celsius', 'dew_point_celsius', 'relative_humidity'
                  ].map((column) => (
                    <th
                      key={column}
                      onClick={() => handleSort(column)}
                      className="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 whitespace-nowrap"
                    >
                      {column.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      {sortConfig.key === column && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, index) => (
                  <tr 
                    key={`${row.id}-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3 whitespace-nowrap">{row.year}</td>
                    <td className="p-3 whitespace-nowrap">{row.country_code}</td>
                    <td className="p-3 whitespace-nowrap">{row.country_name}</td>
                    <td className="p-3 whitespace-nowrap">{row.t2m}</td>
                    <td className="p-3 whitespace-nowrap">{row.d2m}</td>
                    <td className="p-3 whitespace-nowrap">{row.tp}</td>
                    <td className="p-3 whitespace-nowrap">{row.leptospirosis_rate}</td>
                    <td className="p-3 whitespace-nowrap">{row.temperature_celsius}</td>
                    <td className="p-3 whitespace-nowrap">{row.dew_point_celsius}</td>
                    <td className="p-3 whitespace-nowrap">{row.relative_humidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;