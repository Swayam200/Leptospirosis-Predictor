import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function RiskChart({ country }) {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!country) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/predictions/${country}`);
                const data = response.data;

                setChartData({
                    labels: data.map(d => d.Year),
                    datasets: [
                        {
                            label: 'Risk Percentage',
                            data: data.map(d => d.Risk_Percentage),
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [country]);

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
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Risk Predictions</h2>

            {isLoading ? (
                <div className="h-72 flex items-center justify-center">
                    <p className="text-gray-500">Loading data...</p>
                </div>
            ) : chartData.labels.length > 0 ? (
                <div className="h-72">
                    <Line data={chartData} options={options} />
                </div>
            ) : (
                <div className="h-72 flex items-center justify-center">
                    <p className="text-gray-500">Select a country to view predictions</p>
                </div>
            )}
        </div>
    );
}

export default RiskChart;