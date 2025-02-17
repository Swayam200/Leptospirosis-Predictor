// index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection – adjust with your credentials or use environment variables
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',           // your PostgreSQL user
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'lepto_db',     // your database name
  password: process.env.PG_PASSWORD || '123#Nath',      // your database password
  port: process.env.PG_PORT || 5432,
});

// =====================
// Existing Endpoints
// =====================

// Fetch all leptospirosis data
app.get('/api/leptospirosis', async (req, res) => {
  try {
    const leptoQuery = 'SELECT * FROM leptospirosis_data ORDER BY year, country_code';
    const leptoResult = await pool.query(leptoQuery);
    res.json(leptoResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all risk analysis data (from the "riskanalysis" table)
app.get('/api/riskanalysis', async (req, res) => {
  try {
    const riskQuery = `
      SELECT Year, Country, Predicted_Rate, Risk_Percentage, Risk_Level, Primary_Factor, Recommendations 
      FROM riskanalysis 
      ORDER BY Year, Country
    `;
    const riskResult = await pool.query(riskQuery);
    res.json(riskResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch predictions from your model (placeholder)
app.get('/api/prediction', async (req, res) => {
  try {
    // Replace this with your actual model prediction logic
    const prediction = { outbreak: false, details: "No outbreak predicted" };
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// Endpoints Converted from server.js
// (Now using PostgreSQL and nested under /api/riskanalysis)
// =========================================

// GET /api/riskanalysis/countries
app.get('/api/riskanalysis/countries', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT Country FROM riskanalysis ORDER BY Country';
    const result = await pool.query(query);
    const countries = result.rows.map(row => row.country || row.Country);
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/riskanalysis/predictions/:country
app.get('/api/riskanalysis/predictions/:country', async (req, res) => {
  try {
    const query = 'SELECT * FROM riskanalysis WHERE Country = $1 ORDER BY Year';
    const values = [req.params.country];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/riskanalysis/chat
app.post('/api/riskanalysis/chat', async (req, res) => {
  try {
    const { message } = req.body;
    // Get distinct countries from the riskanalysis table (attribute in lowercase)
    const countryQuery = 'SELECT DISTINCT country FROM riskanalysis';
    const countriesResult = await pool.query(countryQuery);
    const countries = countriesResult.rows.map(row => row.country);

    // Look for a country mentioned in the message (case-insensitive)
    const mentionedCountry = countries.find(country =>
      message.toLowerCase().includes(country.toLowerCase())
    );

    if (mentionedCountry) {
      // Retrieve risk details for the mentioned country (using the earliest record)
      const predictionQuery = 'SELECT * FROM riskanalysis WHERE country = $1 ORDER BY year LIMIT 1';
      const predictionResult = await pool.query(predictionQuery, [mentionedCountry]);

      if (predictionResult.rows.length === 0) {
        res.json({ response: "I couldn't find that information." });
      } else {
        const prediction = predictionResult.rows[0];
        res.json({
          response: `For ${mentionedCountry}, the risk level is ${prediction.risk_level} (${prediction.risk_percentage}%). ${prediction.recommendations}`,
          data: prediction
        });
      }
    } else {
      res.json({
        response: "I can help you understand Leptospirosis risks. Which European Country would you like to know about?"
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// =====================
// Serve static assets for production
// =====================
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// =====================
// Start the Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
