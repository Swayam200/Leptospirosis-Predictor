import React from 'react';

function RiskAssessment({ data }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Risk Assessment</h2>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full">Real-time</span>
            </div>

            {data ? (
                <div className="space-y-4">
                    <div className="text-2xl font-bold mb-2">{data.Risk_Level}</div>
                    <div className="text-gray-600">
                        <p className="mb-2">Risk Percentage: {data.Risk_Percentage}%</p>
                        <p className="mb-2">Primary Factor: {data.Primary_Factor}</p>
                        <p>{data.Recommendations}</p>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Select region to view risk analysis</p>
                </div>
            )}
        </div>
    );
}

export default RiskAssessment;