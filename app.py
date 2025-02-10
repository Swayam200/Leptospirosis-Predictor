from flask import Flask, render_template, request
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import calendar
import plotly.express as px
from datetime import datetime

# Regional threshold definitions for European regions
REGIONAL_THRESHOLDS = {
    'Northern_Europe': {
        'countries': ['Norway', 'Sweden', 'Finland', 'Denmark', 'Iceland'],
        'risk_thresholds': {'low': 15, 'moderate': 30, 'high': 45},
        'temp_threshold': 10,
        'humidity_threshold': 70
    },
    'Western_Europe': {
        'countries': ['UK', 'Ireland', 'France', 'Belgium', 'Netherlands', 'Luxembourg', 'Germany'],
        'risk_thresholds': {'low': 20, 'moderate': 35, 'high': 50},
        'temp_threshold': 15,
        'humidity_threshold': 75
    },
    'Southern_Europe': {
        'countries': ['Spain', 'Portugal', 'Italy', 'Greece', 'Malta', 'Cyprus'],
        'risk_thresholds': {'low': 25, 'moderate': 40, 'high': 55},
        'temp_threshold': 20,
        'humidity_threshold': 65
    },
    'Eastern_Europe': {
        'countries': ['Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria'],
        'risk_thresholds': {'low': 20, 'moderate': 35, 'high': 50},
        'temp_threshold': 15,
        'humidity_threshold': 70
    }
}

# Country-specific characteristics and recommendations
COUNTRY_CHARACTERISTICS = {
    'Netherlands': {
        'landscape': 'low-lying',
        'water_bodies': 'many',
        'urban_density': 'high',
        'specific_recommendations': [
            "Maintain dyke and canal systems",
            "Monitor urban water management systems",
            "Implement rodent control in dense urban areas"
        ]
    },
    'Italy': {
        'landscape': 'varied',
        'water_bodies': 'moderate',
        'urban_density': 'mixed',
        'specific_recommendations': [
            "Focus on agricultural water management",
            "Monitor coastal areas during tourist season",
            "Implement prevention in rice farming regions"
        ]
    }
}

# Load the trained model
model = joblib.load('trained_random_forest_model.pkl')

# Define features used in the model
features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']

# Helper functions
def calculate_risk_percentage(prediction, historical_max):
    risk_percentage = (prediction / historical_max) * 100
    return min(risk_percentage, 100)

def get_risk_level(risk_percentage):
    if risk_percentage >= 75:
        return "Very High"
    elif risk_percentage >= 50:
        return "High"
    elif risk_percentage >= 25:
        return "Moderate"
    else:
        return "Low"

def identify_primary_factor(model, features):
    importances = model.feature_importances_
    max_importance_idx = np.argmax(importances)
    return features[max_importance_idx]

def get_prevention_recommendations(risk_level, primary_factor):
    general_recommendations = [
        "Implement public health surveillance systems",
        "Educate the public about Leptospirosis transmission",
        "Improve sanitation and drainage systems"
    ]
    factor_specific_recommendations = {
        'Temperature_Celsius': [
            "Monitor water bodies during warm periods",
            "Implement cooling stations in high-risk areas",
            "Issue temperature-related health advisories"
        ],
        'Relative_Humidity': [
            "Improve ventilation in humid areas",
            "Install dehumidification systems in risk-prone buildings",
            "Monitor humidity levels in agricultural settings"
        ],
        'Dew_Point_Celsius': [
            "Monitor condensation in risk-prone areas",
            "Implement moisture control measures",
            "Install proper drainage systems"
        ],
        'TP': [
            "Improve flood control measures",
            "Maintain proper drainage systems",
            "Issue rainfall-related health advisories"
        ]
    }
    recommendations = general_recommendations.copy()
    if primary_factor in factor_specific_recommendations:
        recommendations.extend(factor_specific_recommendations[primary_factor])
    return recommendations

def get_country_specific_recommendations(country, risk_level, primary_factor):
    recommendations = []
    if country in COUNTRY_CHARACTERISTICS:
        country_data = COUNTRY_CHARACTERISTICS[country]
        # Add landscape-specific recommendations
        if country_data['landscape'] == 'low-lying':
            recommendations.append("Implement enhanced flood control measures")
        elif country_data['landscape'] == 'varied':
            recommendations.append("Focus on region-specific prevention strategies")
        # Add water body-specific recommendations
        if country_data['water_bodies'] == 'many':
            recommendations.append("Regular monitoring of water quality in multiple water bodies")
        # Add urban density-specific recommendations
        if country_data['urban_density'] == 'high':
            recommendations.append("Implement urban rodent control programs")
        # Add country-specific recommendations
        recommendations.extend(country_data['specific_recommendations'])
    return recommendations

def predict_future_factors(data, features, target_year):
    current_year = datetime.now().year
    years_ahead = target_year - current_year
    if years_ahead <= 0:
        raise ValueError("Target year must be greater than the current year.")
    
    future_data = []
    months = list(range(1, 13))
    
    for feature in features:
        X = np.array(range(len(data))).reshape(-1, 1)
        y = data[feature].values
        model = LinearRegression()
        model.fit(X, y)
        
        start_index = len(data) + (years_ahead - 1) * len(months)
        future_X = np.array(range(start_index, start_index + len(months))).reshape(-1, 1)
        future_y = model.predict(future_X)
        future_data.append(future_y)
    
    future_df = pd.DataFrame({
        'Year': [target_year] * len(months),
        'Month': months,
        features[0]: future_data[0],
        features[1]: future_data[1],
        features[2]: future_data[2],
        features[3]: future_data[3]
    })
    
    future_df['Month_Name'] = future_df['Month'].apply(lambda x: calendar.month_name[x])
    return future_df

# Flask app
app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            # Get user inputs
            target_year = int(request.form["year"])
            country_name = request.form["country"]
            historical_max = 100  # Replace with actual historical maximum
            
            # Simulate future environmental factors
            file_path = 'E:\\LeptoVS\\ml_final_data.csv'
            data = pd.read_csv(file_path)
            data = data.dropna()  # Drop rows with missing values
            if data.empty:
                return render_template("index.html", error="Failed to load or process the dataset.")
            
            future_factors = predict_future_factors(data, features, target_year)
            
            # Predict leptospirosis risk
            future_factors['Predicted_Leptospirosis_Rate'] = model.predict(future_factors[features])
            future_factors['Risk_Percentage'] = future_factors['Predicted_Leptospirosis_Rate'].apply(
                lambda x: calculate_risk_percentage(x, historical_max)
            )
            future_factors['Risk_Level'] = future_factors['Risk_Percentage'].apply(get_risk_level)
            
            # Generate general recommendations
            recommendations = []
            for _, row in future_factors.iterrows():
                prediction = row['Predicted_Leptospirosis_Rate']
                risk_percentage = row['Risk_Percentage']
                risk_level = row['Risk_Level']
                primary_factor = identify_primary_factor(model, features)
                general_recommendations = get_prevention_recommendations(risk_level, primary_factor)
                
                recommendations.append({
                    'Year': row['Year'],
                    'Month': row['Month_Name'],  # Use month name instead of number
                    'Predicted_Rate': prediction,
                    'Risk_Percentage': risk_percentage,
                    'Risk_Level': risk_level,
                    'Primary_Factor': primary_factor,
                    'General_Recommendations': general_recommendations
                })
            
            # Generate country-specific recommendations (once for the entire year)
            country_specific_recommendations = get_country_specific_recommendations(
                country_name, risk_level, primary_factor
            )
            
            # Create risk pie chart
            pie_data = []
            for rec in recommendations:
                pie_data.append({
                    'Month': rec['Month'],
                    'Risk Percentage': rec['Risk_Percentage'],
                    'Risk Level': rec['Risk_Level'],
                    'Recommendations': (
                        f"General Recommendations:\n"
                        + "\n".join([f"{i}. {r}" for i, r in enumerate(rec['General_Recommendations'], 1)])
                        + "\n\nCountry-Specific Recommendations:\n"
                        + "\n".join([f"{i}. {r}" for i, r in enumerate(country_specific_recommendations, 1)])
                    )
                })
            pie_df = pd.DataFrame(pie_data)
            fig = px.pie(
                pie_df,
                values='Risk Percentage',
                names='Month',
                title=f'Leptospirosis Risk Distribution for {target_year}',
                hover_data=['Recommendations'],
                labels={'Risk Percentage': 'Risk (%)'}
            )
            fig.update_traces(
                hovertemplate=(
                    '<b>%{label}</b><br>' +
                    'Risk Level: %{customdata[0]}<br>' +
                    'Risk Percentage: %{value:.1f}%<br><br>' +
                    '%{customdata[1]}'
                ),
                customdata=pie_df[['Risk Level', 'Recommendations']].values
            )
            pie_chart_html = fig.to_html(full_html=False)
            
            return render_template(
                "index.html",
                recommendations=recommendations,
                country_specific_recommendations=country_specific_recommendations,  # Pass country-specific recommendations separately
                pie_chart_html=pie_chart_html
            )
        except Exception as e:
            return render_template("index.html", error=f"An error occurred: {str(e)}")
    
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)