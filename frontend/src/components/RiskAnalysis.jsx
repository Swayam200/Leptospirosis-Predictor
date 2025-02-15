import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const MedicalRiskAnalysisDashboard = () => {
  const [baseCountry, setBaseCountry] = useState("");
  const [compareCountry, setCompareCountry] = useState("");
  const [riskData, setRiskData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (country, isComparison = false) => {
    try {
      const response = await fetch("http://localhost:5000/api/riskanalysis");
      const data = await response.json();
      const filteredData = data.filter(
        (entry) => entry.country.toLowerCase() === country.toLowerCase()
      );

      if (filteredData.length === 0) {
        throw new Error(`No data available for ${country}`);
      }

      const formattedData = filteredData.map((entry) => ({
        ...entry,
        comparison_risk_percentage: isComparison ? entry.risk_percentage : null,
      }));

      if (isComparison) {
        setRiskData((prev) =>
          prev.map((d, index) => ({
            ...d,
            comparison_risk_percentage: formattedData[index]?.risk_percentage || null,
          }))
        );
      } else {
        setRiskData(formattedData);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    }
  };

  const handleBaseAnalysis = () => fetchData(baseCountry);
  const handleAddComparison = () => fetchData(compareCountry, true);

  const calculateYAxisDomain = () => {
    if (riskData.length === 0) return [0, 100];

    const allRisks = riskData.flatMap((entry) => [
      entry.risk_percentage,
      entry.comparison_risk_percentage,
    ]).filter((risk) => risk !== null && !isNaN(risk));

    const minRisk = Math.min(...allRisks);
    const maxRisk = Math.max(...allRisks);
    
    const padding = (maxRisk - minRisk) * 0.1;
    return [
      Math.max(0, Math.floor(minRisk - padding)),
      Math.ceil(maxRisk + padding)
    ];
  };

  const getHighestRiskYear = () => {
    if (riskData.length === 0) return null;

    let maxRisk = -Infinity;
    let maxRiskEntry = null;

    riskData.forEach(entry => {
      const primaryRisk = Number(entry.risk_percentage);
      if (!isNaN(primaryRisk) && primaryRisk > maxRisk) {
        maxRisk = primaryRisk;
        maxRiskEntry = {
          year: entry.year,
          risk: primaryRisk,
          isComparison: false
        };
      }
      const comparisonRisk = Number(entry.comparison_risk_percentage);
      if (!isNaN(comparisonRisk) && comparisonRisk > maxRisk) {
        maxRisk = comparisonRisk;
        maxRiskEntry = {
          year: entry.year,
          risk: comparisonRisk,
          isComparison: true
        };
      }
    });

    if (!maxRiskEntry) return null;

    const formattedRisk = Number(maxRiskEntry.risk).toFixed(1);
    return `${maxRiskEntry.year} (${formattedRisk}%) ${
      maxRiskEntry.isComparison ? '- Comparison' : '- Primary'
    }`;
  };

  const calculateAverageRisk = () => {
    if (riskData.length === 0) return '0.0';

    let primarySum = 0;
    let primaryCount = 0;
    let comparisonSum = 0;
    let comparisonCount = 0;

    riskData.forEach(entry => {
      const primaryRisk = Number(entry.risk_percentage);
      if (!isNaN(primaryRisk)) {
        primarySum += primaryRisk;
        primaryCount++;
      }
      const comparisonRisk = Number(entry.comparison_risk_percentage);
      if (!isNaN(comparisonRisk)) {
        comparisonSum += comparisonRisk;
        comparisonCount++;
      }
    });

    const totalSum = primarySum + comparisonSum;
    const totalCount = primaryCount + comparisonCount;

    if (totalCount === 0) return '0.0';

    return (totalSum / totalCount).toFixed(1);
  };

  return (
    <div style={styles.container}>
      {/* BioBytes Header */}
      <div style={styles.headerContainer} onClick={() => navigate('/')}>
        <img 
          src="/logo-placeholder.png" 
          alt="BioBytes Logo" 
          style={styles.logo} 
        />
        <h1 style={styles.brandTitle}>BioBytes</h1>
      </div>

      <h2 style={styles.header}>Clinical Risk Analysis Dashboard</h2>

      <div style={styles.controlPanel}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter Primary Country"
            value={baseCountry}
            onChange={(e) => setBaseCountry(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleBaseAnalysis} style={styles.primaryButton}>
            Analyze Primary
          </button>
        </div>
        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Compare with Country"
            value={compareCountry}
            onChange={(e) => setCompareCountry(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddComparison} style={styles.secondaryButton}>
            Add Comparison
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {riskData.length > 0 && (
        <div style={styles.chartContainer}>
          <LineChart
            width={800}
            height={400}
            data={riskData}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccecee" />
            <XAxis
              dataKey="year"
              label={{
                value: "Year",
                position: "bottom",
                offset: 0,
                style: styles.axisLabel,
              }}
              tick={styles.axisTick}
            />
            <YAxis
              domain={calculateYAxisDomain()}
              label={{
                value: "Risk Percentage (%)",
                angle: -90,
                position: "left",
                style: styles.axisLabel,
              }}
              tick={styles.axisTick}
            />
            <Tooltip
              contentStyle={styles.tooltip}
              itemStyle={styles.tooltipItem}
            />
            <Legend wrapperStyle={styles.legend} />
            <Line
              type="monotone"
              dataKey="risk_percentage"
              name="Primary Risk"
              stroke="#095d7e"
              strokeWidth={2}
              dot={{ fill: "#095d7e", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="comparison_risk_percentage"
              name="Comparison Risk"
              stroke="#14967f"
              strokeWidth={2}
              dot={{ fill: "#14967f", strokeWidth: 1 }}
            />
          </LineChart>

          <div style={styles.metricsContainer}>
            <div style={styles.metricCard}>
              <h3 style={styles.metricTitle}>Highest Risk Year</h3>
              <p style={styles.metricValue}>{getHighestRiskYear()}</p>
            </div>
            <div style={styles.metricCard}>
              <h3 style={styles.metricTitle}>Average Risk</h3>
              <p style={styles.metricValue}>{calculateAverageRisk()}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "auto",
    backgroundColor: "#f1f9ff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(9, 93, 126, 0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    cursor: "pointer",
    padding: "1rem",
    backgroundColor: "#095d7e",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    ":hover": {
      backgroundColor: "#0a6b8a",
    },
  },
  logo: {
    height: "50px",
    width: "auto",
  },
  brandTitle: {
    color: "#e2fcd6",
    margin: 0,
    fontSize: "2rem",
    fontWeight: "600",
  },
  header: {
    color: "#095d7e",
    textAlign: "center",
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
    fontWeight: "600",
    padding: "1rem",
    backgroundColor: "#ccecee",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(9, 93, 126, 0.1)",
  },
  controlPanel: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  inputGroup: {
    flex: 1,
    display: "flex",
    gap: "0.5rem",
    minWidth: "300px",
    maxWidth: "400px",
  },
  input: {
    padding: "0.8rem",
    borderRadius: "6px",
    border: "2px solid #14967f",
    flex: 1,
    fontSize: "1rem",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    outline: "none",
  },
  primaryButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#14967f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    ":hover": {
      backgroundColor: "#0d7a6a",
    },
  },
  secondaryButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#095d7e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    ":hover": {
      backgroundColor: "#07455e",
    },
  },
  chartContainer: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(9, 93, 126, 0.1)",
  },
  axisLabel: {
    fontSize: "0.9rem",
    color: "#095d7e",
    fontWeight: "500",
  },
  axisTick: {
    fontSize: "0.8rem",
    color: "#14967f",
  },
  tooltip: {
    backgroundColor: "#ffffff",
    border: "2px solid #ccecee",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(9, 93, 126, 0.1)",
    padding: "0.8rem",
  },
  tooltipItem: {
    fontSize: "0.9rem",
    color: "#095d7e",
  },
  legend: {
    paddingTop: "1rem",
    color: "#095d7e",
  },
  metricsContainer: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
    justifyContent: "center",
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#e2fcd6",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(9, 93, 126, 0.1)",
    maxWidth: "300px",
  },
  metricTitle: {
    color: "#095d7e",
    fontSize: "1rem",
    marginBottom: "0.5rem",
    fontWeight: "600",
  },
  metricValue: {
    color: "#14967f",
    fontSize: "1.4rem",
    fontWeight: "700",
  },
  error: {
    color: "#e74c3c",
    backgroundColor: "#f1f9ff",
    textAlign: "center",
    margin: "1rem 0",
    padding: "1rem",
    borderRadius: "6px",
    border: "2px solid #e74c3c",
    fontWeight: "500",
  },
};

export default MedicalRiskAnalysisDashboard;