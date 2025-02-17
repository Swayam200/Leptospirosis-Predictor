import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

def load_data(file_path):
    try:
        data = pd.read_csv(file_path)
        return data.dropna()
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None

def calculate_risk_percentage(prediction, historical_max):
    return max(min((prediction / historical_max) * 100, 100), 0.1)

def get_risk_level(risk_percentage):
    if risk_percentage >= 75:
        return "Very High", "🔴"
    elif risk_percentage >= 50:
        return "High", "🟠"
    elif risk_percentage >= 25:
        return "Moderate", "🟡"
    else:
        return "Low", "🟢"

def get_recommendations(risk_level):
    recommendations = {
        "Very High": "Immediate intervention needed!",
        "High": "Increased alert!",
        "Moderate": "Stay cautious!",
        "Low": "Low risk, maintain hygiene."
    }
    return recommendations.get(risk_level, "No recommendation.")

def identify_primary_factor(model, features):
    importances = model.feature_importances_
    return features[np.argmax(importances)]

def predict_risk(data, model, features, historical_max, country_name, start_year, end_year):
    country_data = data[data['Country Name'] == country_name]
    if country_data.empty:
        return []

    predictions = []
    latest_data = country_data.sort_values(by='Year').iloc[-1].copy()

    for year in range(start_year, end_year + 1):
        for feature in features:
            latest_data[feature] *= np.random.uniform(0.98, 1.02)

        prediction = model.predict(pd.DataFrame([latest_data[features].to_dict()]))[0]
        if prediction == 0:
            prediction = max(historical_max * 0.01, 0.01)

        risk_percentage = calculate_risk_percentage(prediction, historical_max)
        risk_level, color_indicator = get_risk_level(risk_percentage)
        primary_factor = identify_primary_factor(model, features)
        recommendation = get_recommendations(risk_level)

        predictions.append({
            'Year': year,
            'Country': country_name,
            'Prediction': prediction,
            'Risk Percentage': risk_percentage,
            'Risk Level': risk_level,
            'Primary Factor': primary_factor,
            'Recommendation': recommendation,
            'Color Indicator': color_indicator
        })

        print(f"\n{year} | {country_name} | Pred: {prediction:.5f} | Risk: {risk_percentage:.1f}% | Level: {color_indicator} {risk_level}")

    return predictions

def main():
    print("\n--- Starting Leptospirosis Risk Prediction ---")
    file_path = 'ml_data.csv'
    data = load_data(file_path)
    if data is None:
        print("Failed to load data.")
        return

    model = joblib.load('trained_random_forest_model.pkl')
    historical_max = data['Leptospirosis_Rate'].max()
    
    print(f"\nHistorical Max Rate: {historical_max:.5f}")

    country_input = input("\nEnter country name (or 'All' for all countries): ")
    end_year = int(input("Enter end year for predictions: "))

    all_predictions = []

    if country_input.lower() == "all":
        unique_countries = data['Country Name'].unique()
        print(f"\nAnalyzing risk for all countries from 2024 to {end_year}...")
        for country in unique_countries:
            predictions = predict_risk(data, model, ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP'], historical_max, country, 2024, end_year)
            all_predictions.extend(predictions)
    else:
        predictions = predict_risk(data, model, ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP'], historical_max, country_input, 2024, end_year)
        all_predictions.extend(predictions)

    if all_predictions:
        output_df = pd.DataFrame(all_predictions)
        output_df.to_csv('leptospirosis_predictions.csv', index=False)
        print(f"\nPredictions saved to 'leptospirosis_predictions.csv'.")

if __name__ == "__main__":
    main()
