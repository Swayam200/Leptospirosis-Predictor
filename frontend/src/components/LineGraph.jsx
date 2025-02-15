// frontend/src/components/LineGraph.jsx

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineGraph = ({ data }) => {
  // Build a mapping of country codes to country names
  const countriesMap = {};
  data.forEach(item => {
    countriesMap[item.country_code] = item.country_name;
  });
  // Convert to an array for the dropdown (each object has a code and name)
  const countries = Object.entries(countriesMap).map(([code, name]) => ({ code, name }));

  // Set the initial selected country to the first in the list (if any)
  const [selectedCountry, setSelectedCountry] = useState(countries[0] ? countries[0].code : '');

  // Filter and sort data for the selected country
  const filteredData = data
    .filter(item => item.country_code === selectedCountry)
    .sort((a, b) => a.year - b.year);

  return (
    <div>
      <h3>Line Graph</h3>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="country-select" style={{ marginRight: '10px' }}>
          Select Country:
        </label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      <h4>{countriesMap[selectedCountry]} - Year-wise Leptospirosis Rate</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="leptospirosis_rate" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraph;
