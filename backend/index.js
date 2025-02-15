const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection – adjust with your credentials
const pool = new Pool({
  user: 'postgres',          // your PostgreSQL user
  host: 'localhost',
  database: 'lepto_db',     // your database name
  password: '123#Nath',  // your database password
  port: 5432,
});

// Endpoint: Fetch all leptospirosis data
app.get('/api/leptospirosis', async (req, res) => {
  try {
    const leptoQuery = 'SELECT * FROM leptospirosis_data ORDER BY year, country_code';
    const leptoResult = await pool.query(leptoQuery);
    res.json(leptoResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Fetch all risk analysis data
app.get('/api/riskanalysis', async (req, res) => {
  try {
    const riskQuery = 'SELECT Year, Country, Predicted_Rate, Risk_Percentage, Risk_Level, Primary_Factor, Recommendations FROM riskanalysis ORDER BY Year, Country';
    const riskResult = await pool.query(riskQuery);
    res.json(riskResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Optional) Endpoint: Fetch predictions from your model
app.get('/api/prediction', async (req, res) => {
  try {
    // Replace this with your model prediction logic
    const prediction = { outbreak: false, details: "No outbreak predicted" };
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (For deployment) Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
