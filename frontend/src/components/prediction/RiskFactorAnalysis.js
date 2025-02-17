import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

function RiskFactorAnalysis({ data }) {
    if (!data) return null;

    // Calculate risk factors (placeholder logic)
    const calculateRiskFactors = (data) => {
        return [
            data.Risk_Percentage * 0.8, // Temperature impact
            data.Risk_Percentage * 0.6, // Rainfall impact
            data.Risk_Percentage * 0.4, // Population density impact
            data.Risk_Percentage * 0.7  // Historical cases impact
        ];
    };

    const chartData = {
        labels: ['Temperature', 'Rainfall', 'Population Density', 'Previous Cases'],
        datasets: [
            {
                label: 'Risk Factor Impact',
                data: calculateRiskFactors(data),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                pointBackgroundColor: 'rgb(75, 192, 192)'
            }
        ]
    };

    const options = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100
            }
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Risk Factor Analysis</h2>

            <div className="h-64 mb-4">
                <Radar data={chartData} options={options} />
            </div>

            <div className="mt-4">
                <h3 className="font-semibold mb-2">Key Influencing Factors</h3>
                <ul className="space-y-2">
                    <li className="flex items-center">
                        <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
                        Temperature: High Impact
                    </li>
                    <li className="flex items-center">
                        <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                        Rainfall: Medium Impact
                    </li>
                    <li className="flex items-center">
                        <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                        Population Density: Low Impact
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default RiskFactorAnalysis;