// frontend/src/components/MapView.jsx

import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'leaflet/dist/leaflet.css';

const MapView = ({ data }) => {
  // Extract available years from data and sort them
  const years = Array.from(new Set(data.map(d => Number(d.year)))).sort((a, b) => a - b);
  const [selectedYear, setSelectedYear] = useState(years[0] || new Date().getFullYear());

  // Filter data for the selected year
  const yearData = data.filter(d => Number(d.year) === selectedYear);

  // Helper: Map leptospirosis_rate to a color from green (low) to red (high)
  const getColor = (rate) => {
    const lower = 0.0206145;
    const upper = 7.76796;
    const normalized = Math.min(Math.max((rate - lower) / (upper - lower), 0), 1);
    const red = Math.floor(255 * normalized);
    const green = Math.floor(255 * (1 - normalized));
    return `rgb(${red}, ${green}, 0)`;
  };

  // Dictionary mapping European country ISO codes to approximate coordinates.
  // Ensure that the keys match the values in your data's `country_code` field.
  const countryCoordinates = {
    'GB': [55.3781, -3.4360],     // United Kingdom
    'DK': [56.2639, 9.5018],       // Denmark
    'SE': [60.1282, 18.6435],      // Sweden
    'FI': [61.9241, 25.7482],      // Finland
    'EE': [58.5953, 25.0136],      // Estonia
    'NL': [52.1326, 5.2913],       // Netherlands
    'LV': [56.8796, 24.6032],      // Latvia
    'LT': [55.1694, 23.8813],      // Lithuania
    'PL': [51.9194, 19.1451],      // Poland
    'CZ': [49.8175, 15.4730],      // Czechia
    'DE': [51.1657, 10.4515],      // Germany
    'BE': [50.5039, 4.4699],       // Belgium
    'RO': [45.9432, 24.9668],      // Romania
    'LU': [49.8153, 6.1296],       // Luxembourg
    'SK': [48.6690, 19.6990],      // Slovakia
    'AT': [47.5162, 14.5501],      // Austria
    'CY': [35.1264, 33.4299],      // Cyprus
    'HU': [47.1625, 19.5033],      // Hungary
    'SI': [46.1512, 14.9955],      // Slovenia
    'IT': [41.8719, 12.5674],      // Italy
    'BG': [42.7339, 25.4858],      // Bulgaria
    'GR': [39.0742, 21.8243],      // Greece
    'ES': [40.4637, -3.7492],      // Spain
    'MT': [35.9375, 14.3754],      // Malta
    'FR': [46.6034, 1.8883],       // France
    'HR': [45.1000, 15.2000],      // Croatia
  };

  // Return coordinates for a given country code; fallback to central Europe if not found
  const getCoordinates = (countryCode) => {
    return countryCoordinates[countryCode] || [54, 15];
  };

  return (
    <div>
      <h3>Map View</h3>
      <div style={{ margin: '20px 0' }}>
        <p>Select Year: {selectedYear}</p>
        <Slider
          min={years[0] || 2000}
          max={years[years.length - 1] || 2020}
          value={selectedYear}
          marks={years.reduce((acc, year) => ({ ...acc, [year]: year }), {})}
          onChange={(value) => setSelectedYear(value)}
          step={1}
        />
      </div>
      <MapContainer 
        center={[54, 15]} 
        zoom={4} 
        style={{ height: '400px', width: '100%' }}
        // Limit the view to Europe (rough bounds)
        maxBounds={[[34, -25], [72, 45]]} 
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {yearData.map((row) => {
          const [lat, lng] = getCoordinates(row.country_code);
          return (
            <CircleMarker
              key={row.id}
              center={[lat, lng]}
              radius={10}
              color={getColor(row.leptospirosis_rate)}
            >
              <Popup>
                <strong>{row.country_name}</strong>
                <br />Leptospirosis Rate: {row.leptospirosis_rate}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
