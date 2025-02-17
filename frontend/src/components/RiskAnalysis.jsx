import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import logo from "./img/biobites.jpg";

const MedicalRiskAnalysisDashboard = () => {
  const navigate = useNavigate();
  const [fullData, setFullData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [selectedComparisonCountries, setSelectedComparisonCountries] = useState([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [report, setReport] = useState("");
  const [queryType, setQueryType] = useState("");
  const [activeCountries, setActiveCountries] = useState([]);

  const euCountries = [
    "United Kingdom", "Denmark", "Sweden", "Finland", "Estonia", "Netherlands",
    "Latvia", "Lithuania", "Poland", "Czechia", "Germany", "Belgium", "Romania",
    "Luxembourg", "Slovakia", "Austria", "Cyprus", "Hungary", "Slovenia", "Italy",
    "Bulgaria", "Greece", "Spain", "Malta", "France", "Croatia",
  ];

  const colors = ["#095d7e", "#14967f", "#e67e22", "#8e44ad", "#2ecc71", "#e74c3c", "#3498db"];
  const getColor = (index) => colors[index % colors.length];

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/riskanalysis");
        const data = await response.json();
        setFullData(data);
      } catch (err) {
        console.error("Error fetching full data:", err);
      }
    };
    fetchFullData();
  }, []);

  // Filter available countries based on search text
  const filteredCountries = euCountries.filter((country) =>
    country.toLowerCase().includes(countryFilter.toLowerCase())
  );

  const toggleCountrySelection = (country) => {
    setSelectedComparisonCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((c) => c !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  // Helper functions to compute report data
  const getHighestRiskFromData = (data) => {
    let maxRisk = -Infinity;
    let maxRiskYear = null;
    data.forEach((entry) => {
      const risk = Number(entry.risk_percentage);
      if (!isNaN(risk) && risk > maxRisk) {
        maxRisk = risk;
        maxRiskYear = entry.year;
      }
    });
    return maxRiskYear ? `${maxRiskYear} (${maxRisk.toFixed(1)}%)` : "N/A";
  };

  const calculateAverageRiskFromData = (data) => {
    let sum = 0;
    let count = 0;
    data.forEach((entry) => {
      const risk = Number(entry.risk_percentage);
      if (!isNaN(risk)) {
        sum += risk;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : "0.0";
  };

  // Calculate y-axis domain based on current riskData
  const calculateYAxisDomain = () => {
    if (riskData.length === 0) return [0, 100];

    let allRisks = [];
    if (riskData[0] && riskData[0].hasOwnProperty("risk_percentage")) {
      allRisks = riskData
        .map((entry) => entry.risk_percentage)
        .filter((risk) => risk !== null && !isNaN(risk));
    } else {
      riskData.forEach((entry) => {
        Object.keys(entry).forEach((key) => {
          if (key !== "year") {
            const risk = entry[key];
            if (risk !== null && !isNaN(risk)) {
              allRisks.push(risk);
            }
          }
        });
      });
    }
    const minRisk = Math.min(...allRisks);
    const maxRisk = Math.max(...allRisks);
    const padding = (maxRisk - minRisk) * 0.1;
    return [
      Math.max(0, Math.floor(minRisk - padding)),
      Math.ceil(maxRisk + padding),
    ];
  };

  // Legacy analysis functions
  const fetchDataForCountry = (country, isComparison = false) => {
    if (!fullData || fullData.length === 0) return;
    const filtered = fullData.filter(
      (entry) => entry.country.toLowerCase() === country.toLowerCase()
    );
    if (filtered.length === 0) {
      alert(`No data available for ${country}`);
      return;
    }
    setRiskData(filtered);
    setReport(
      `Country: ${country}\nHighest Risk Year: ${getHighestRiskFromData(
        filtered
      )}\nAverage Risk: ${calculateAverageRiskFromData(filtered)}%\nRecommendations: ${
        filtered[0]?.recommendations || "N/A"
      }\nRisk Factor Analysis: ${filtered[0]?.risk_factor_analysis || "N/A"}`
    );
  };

  // --- Chatbot processing ---
  const processChatInput = (message) => {
    let mentionedCountries = [];
    euCountries.forEach((ctry) => {
      if (message.toLowerCase().includes(ctry.toLowerCase())) {
        mentionedCountries.push(ctry);
      }
    });
    mentionedCountries = [...new Set(mentionedCountries)];

    const yearMatch = message.match(/\b(19|20)\d{2}\b/);
    const mentionedYear = yearMatch ? yearMatch[0] : null;

    if (mentionedCountries.length === 0) {
      const botMessage = {
        sender: "bot",
        text:
          "Please mention at least one valid EU country from: " +
          euCountries.join(", "),
      };
      setChatHistory((prev) => [...prev, botMessage]);
      return;
    }

    if (mentionedCountries.length === 1) {
      const country = mentionedCountries[0];
      let filteredData = fullData.filter(
        (entry) => entry.country.toLowerCase() === country.toLowerCase()
      );
      let currentQueryType = "single";
      if (mentionedYear) {
        filteredData = filteredData.filter(
          (entry) => entry.year.toString() === mentionedYear
        );
        currentQueryType = "yearSpecific";
      }
      setRiskData(filteredData);
      setActiveCountries([country]);
      setQueryType(currentQueryType);

      let reportText = `Country: ${country}\n`;
      if (mentionedYear) {
        reportText += `Year: ${mentionedYear}\nLeptospirosis Data: ${
          filteredData[0]?.leptospirosis || "N/A"
        }\n`;
      }
      reportText += `Highest Risk Year: ${getHighestRiskFromData(
        filteredData
      )}\nAverage Risk: ${calculateAverageRiskFromData(filteredData)}%\nRecommendations: ${
        filteredData[0]?.recommendations || "N/A"
      }\nRisk Factor Analysis: ${
        filteredData[0]?.risk_factor_analysis || "N/A"
      }`;
      setReport(reportText);

      const botMessage = {
        sender: "bot",
        text:
          "Here is the analysis for " +
          country +
          (mentionedYear ? " for year " + mentionedYear : ""),
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } else if (mentionedCountries.length > 1) {
      let filteredData = fullData.filter((entry) =>
        mentionedCountries
          .map((c) => c.toLowerCase())
          .includes(entry.country.toLowerCase())
      );
      if (mentionedYear) {
        filteredData = filteredData.filter(
          (entry) => entry.year.toString() === mentionedYear
        );
        setQueryType("yearSpecificComparison");
      } else {
        setQueryType("multiComparison");
      }
      if (!mentionedYear) {
        const grouped = {};
        filteredData.forEach((entry) => {
          if (!grouped[entry.year]) grouped[entry.year] = { year: entry.year };
          grouped[entry.year][entry.country] = entry.risk_percentage;
        });
        setRiskData(Object.values(grouped));
      } else {
        const pivot = { year: mentionedYear };
        filteredData.forEach((entry) => {
          pivot[entry.country] = entry.risk_percentage;
        });
        setRiskData([pivot]);
      }
      setActiveCountries(mentionedCountries);

      let reportText = `Countries: ${mentionedCountries.join(", ")}\n`;
      if (mentionedYear) {
        reportText += `Year: ${mentionedYear}\n`;
      }
      mentionedCountries.forEach((country) => {
        const countryData = filteredData.filter(
          (entry) => entry.country.toLowerCase() === country.toLowerCase()
        );
        reportText += `\n${country}:\n  Highest Risk Year: ${getHighestRiskFromData(
          countryData
        )}\n  Average Risk: ${calculateAverageRiskFromData(
          countryData
        )}%\n  Recommendations: ${
          countryData[0]?.recommendations || "N/A"
        }\n  Risk Factor Analysis: ${
          countryData[0]?.risk_factor_analysis || "N/A"
        }\n`;
      });
      setReport(reportText);

      const botMessage = {
        sender: "bot",
        text:
          "Here is the comparative analysis for " +
          mentionedCountries.join(", ") +
          (mentionedYear ? " for year " + mentionedYear : ""),
      };
      setChatHistory((prev) => [...prev, botMessage]);
    }
  };

  const handleSendChat = () => {
    if (chatInput.trim() === "") return;
    const userMessage = { sender: "user", text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    processChatInput(chatInput);
    setChatInput("");
  };

  // Multi‑country comparison using the filter system
  const handleCountryComparison = () => {
    if (selectedComparisonCountries.length === 0) return;
    const filteredData = fullData.filter((entry) =>
      selectedComparisonCountries
        .map((c) => c.toLowerCase())
        .includes(entry.country.toLowerCase())
    );
    const grouped = {};
    filteredData.forEach((entry) => {
      if (!grouped[entry.year]) grouped[entry.year] = { year: entry.year };
      grouped[entry.year][entry.country] = entry.risk_percentage;
    });
    setRiskData(Object.values(grouped));
    setQueryType("multiComparison");
    setActiveCountries(selectedComparisonCountries);

    let reportText = `Countries: ${selectedComparisonCountries.join(", ")}\n`;
    selectedComparisonCountries.forEach((country) => {
      const countryData = filteredData.filter(
        (entry) => entry.country.toLowerCase() === country.toLowerCase()
      );
      reportText += `\n${country}:\n  Highest Risk Year: ${getHighestRiskFromData(
        countryData
      )}\n  Average Risk: ${calculateAverageRiskFromData(
        countryData
      )}%\n  Recommendations: ${
        countryData[0]?.recommendations || "N/A"
      }\n  Risk Factor Analysis: ${
        countryData[0]?.risk_factor_analysis || "N/A"
      }\n`;
    });
    setReport(reportText);
  };

 return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerContainer} onClick={() => navigate("/")}>
        <div style={styles.headerContent}>
          <img src={logo} alt="BioBytes Logo" style={styles.logo} />
          <h1 style={styles.brandTitle}>Biobytes</h1>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Dashboard Layout */}
        <div style={styles.dashboardGrid}>
          {/* Left Panel - Controls */}
          <div style={styles.controlsPanel}>
            <div style={styles.filterCard}>
              <h3 style={styles.filterTitle}>Multi-Country Comparison</h3>
              <input
                type="text"
                placeholder="Search countries..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                style={styles.searchInput}
              />
              <div style={styles.countryList}>
                {euCountries
                  .filter(country => country.toLowerCase().includes(countryFilter.toLowerCase()))
                  .map(country => (
                    <button
                      key={country}
                      onClick={() => toggleCountrySelection(country)}
                      style={{
                        ...styles.countryButton,
                        ...(selectedComparisonCountries.includes(country) && 
                          styles.selectedCountryButton)
                      }}
                    >
                      {country}
                    </button>
                  ))}
              </div>
              <button
                onClick={handleCountryComparison}
                style={styles.compareButton}
                disabled={selectedComparisonCountries.length === 0}
              >
                Compare Selected Countries
              </button>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div style={styles.visualizationPanel}>
            {riskData.length > 0 && (
              <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                {queryType === "multiComparison" ||
                queryType === "yearSpecificComparison" ? (
                  <LineChart data={riskData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccecee" />
                    <XAxis
                      dataKey="year"
                      label={{
                        value: "Year",
                        position: "left",
                        offset: 30,
                        style: styles.axisLabel,
                      }}
                      tick={styles.axisTick}
                    />
                    <YAxis
                      label={{
                        value: "Risk Percentage (%)",
                        angle: -90,
                        position: "left",
                        style: styles.axisLabel,
                      }}
                      tick={styles.axisTick}
                      domain={calculateYAxisDomain()}
                    />
                    <Tooltip contentStyle={styles.tooltip} itemStyle={styles.tooltipItem} />
                    <Legend wrapperStyle={styles.legend} />
                    {riskData[0] &&
                      Object.keys(riskData[0])
                        .filter((key) => key !== "year")
                        .map((key, index) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={key}
                            stroke={getColor(index)}
                            strokeWidth={2}
                            dot={{ fill: getColor(index), strokeWidth: 1 }}
                          />
                        ))}
                  </LineChart>
                ) : (
                  <LineChart data={riskData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
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
                      label={{
                        value: "Risk Percentage (%)",
                        angle: -90,
                        position: "left",
                        style: styles.axisLabel,
                      }}
                      tick={styles.axisTick}
                      domain={calculateYAxisDomain()}
                    />
                    <Tooltip contentStyle={styles.tooltip} itemStyle={styles.tooltipItem} />
                    <Legend wrapperStyle={styles.legend} />
                    <Line
                      type="monotone"
                      dataKey="risk_percentage"
                      name="Risk"
                      stroke="#095d7e"
                      strokeWidth={2}
                      dot={{ fill: "#095d7e", strokeWidth: 1 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
              <div style={styles.reportCard}>
                  <h3 style={styles.reportTitle}>Analysis Report</h3>
                  <div style={styles.reportContent}>{report}</div>
                </div>
              </div>
            ) }
          </div>

          <div style={styles.chatPanel}>
  <div style={styles.chatHeader}>
    <h3 style={styles.chatTitle}>Analytics Assistant</h3>
    <div style={styles.chatStatus}>
      <div style={styles.statusIndicator}></div>
      Online
    </div>
  </div>
  
  {/* Changed messages container to have scroll */}
  <div style={styles.chatMessages}>
    {chatHistory.map((msg, idx) => (
      <div
        key={idx}
        style={{
          ...styles.messageBubble,
          ...(msg.sender === "user" ? styles.userMessage : styles.botMessage)
        }}
      >
        <div style={styles.messageContent}>{msg.text}</div>
      </div>
    ))}
  </div>

  {/* Input stays fixed at bottom */}
  <div style={styles.chatControls}>
    <input
      type="text"
      placeholder="Ask about medical risks..."
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      style={styles.chatInput}
      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
    />
    <button onClick={handleSendChat} style={styles.sendButton}>
      Send
    </button>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(9, 93, 126, 0.08)",
    padding: "1rem 2rem",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  headerContent: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#0f766e",
    margin: 0,
  },
  mainContent: {
    flex: 1,
    padding: "2rem",
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr 350px", 
    gap: "2rem",
    height: "calc(100vh - 100px)",
  },
  controlsPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: "1.5rem",
    boxShadow: "0 2px 6px rgba(9, 93, 126, 0.05)",
    overflowY: "auto",
  },
  visualizationPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(9, 93, 126, 0.05)",
    padding: "1.5rem",
    overflowY: "auto",
  },
  chatPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(9, 93, 126, 0.05)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    right: "2rem",
    top: "calc(100px + 2rem)", // Below header
    bottom: "2rem",
    width: "350px",
    zIndex: 1000,
    overflow: "hidden",
  },
  filterCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  searchInput: {
    padding: "0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: "0.9rem",
    width: "100%",
  },
  countryList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxHeight: "400px",
    overflowY: "auto",
    padding: "0.5rem 0",
  },
  countryButton: {
    padding: "0.75rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f1f5f9",
    },
  },
  selectedCountryButton: {
    backgroundColor: "#0d9488",
    color: "white",
    borderColor: "#0d9488",
  },
  compareButton: {
    padding: "0.75rem",
    backgroundColor: "#0d9488",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    marginTop: "1rem",
    ":disabled": {
      backgroundColor: "#e2e8f0",
      cursor: "not-allowed",
    },
  },
  chartContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  reportCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: "1.5rem",
  },
  reportTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#134e4a",
    marginBottom: "1rem",
  },
  reportContent: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    color: "#334155",
    fontSize: "0.9rem",
  },
  placeholder: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "1.1rem",
  },
  chatHeader: {
    padding: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
  },
  chatTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#134e4a",
    margin: 0,
  },
  chatStatus: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#64748b",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    backgroundColor: "#10b981",
    borderRadius: "50%",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem", // Increased from 1rem to 1.5rem
    paddingBottom: "80px", // Space for input
  },
  
  messageBubble: {
    maxWidth: "85%",
    padding: "1rem",
    borderRadius: 12,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  userMessage: {
    backgroundColor: "#0d9488",
    color: "white",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  chatControls: {
    position: "sticky",
    bottom: 0,
    backgroundColor: "#ffffff",
    padding: "1.5rem",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    gap: "0.5rem",
  },
  chatInput: {
    flex: 1,
    padding: "0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: "0.9rem",
  },
  sendButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0d9488",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default MedicalRiskAnalysisDashboard;