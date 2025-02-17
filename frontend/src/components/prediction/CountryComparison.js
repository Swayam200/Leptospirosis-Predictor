import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const MAX_COUNTRIES_COMPARE = 3;
const CHART_COLORS = [
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(255, 205, 86)'
];

function CountryComparison() {
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [availableCountries, setAvailableCountries] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch available countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/riskanalysis/countries');
                setAvailableCountries(response.data);
            } catch (error) {
                console.error('Error loading countries:', error);
            }
        };

        fetchCountries();
    }, []);

    // Update chart when selected countries change
    useEffect(() => {
        if (selectedCountries.length === 0) {
            setChartData(null);
            return;
        }

        const updateChart = async () => {
            setIsLoading(true);

            try {
                // Fetch data for all selected countries
                const allData = await Promise.all(
                    selectedCountries.map(country =>
                        axios.get(`http://localhost:5000/api/riskanalysis${country}`).then(res => res.data)
                    )
                );

                if (allData.length === 0 || allData[0].length === 0) {
                    setChartData(null);
                    return;
                }

                // Create datasets for chart
                const datasets = allData.map((countryData, index) => ({
                    label: countryData[0].Country,
                    data: countryData.map(d => d.Risk_Percentage),
                    borderColor: CHART_COLORS[index % CHART_COLORS.length],
                    tension: 0.1
                }));

                setChartData({
                    labels: allData[0].map(d => d.Year),
                    datasets: datasets
                });
            } catch (error) {
                console.error('Error updating comparison chart:', error);
            } finally {
                setIsLoading(false);
            }
        };

        updateChart();
    }, [selectedCountries]);

    const handleCountrySelection = (e) => {
        const country = e.target.value;
        if (!country) return;

        if (selectedCountries.length >= MAX_COUNTRIES_COMPARE) {
            alert(`You can only compare up to ${MAX_COUNTRIES_COMPARE} countries`);
            return;
        }

        setSelectedCountries(prev => [...prev, country]);
        e.target.value = '';
    };

    const removeCountry = (country) => {
        setSelectedCountries(prev => prev.filter(c => c !== country));
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Risk Percentage'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                    }
                }
            }
        }
    };

    return (
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Compare Countries</h3>

            <div className="flex flex-wrap gap-2 mb-2">
                {selectedCountries.map(country => (
                    <div key={country} className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2">
                        {country}
                        <button
                            className="text-red-500 font-bold"
                            onClick={() => removeCountry(country)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <select
                className="p-2 border rounded w-full mb-4"
                onChange={handleCountrySelection}
                disabled={isLoading}
            >
                <option value="">Select a country to compare...</option>
                {availableCountries
                    .filter(country => !selectedCountries.includes(country))
                    .map(country => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
            </select>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Loading comparison data...</p>
                </div>
            ) : chartData ? (
                <div className="h-64">
                    <Line data={chartData} options={options} />
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">Select countries to compare data</p>
                </div>
            )}
        </div>
    );
}

export default CountryComparison;