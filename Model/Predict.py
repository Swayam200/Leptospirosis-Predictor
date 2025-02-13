import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

def load_and_prepare_data(file_path):
    """Load and prepare the dataset"""
    try:
        data = pd.read_csv(file_path)
        features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']
        target = 'Leptospirosis_Rate'
        data = data.dropna()
        return data, features, target
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None, None, None

def calculate_risk_percentage(prediction, historical_max):
    """Calculate risk percentage based on predicted rate and historical maximum"""
    if historical_max == 0:
        return 0  # Prevent division by zero
    risk_percentage = (prediction / historical_max) * 100
    return max(min(risk_percentage, 100), 0.1)  # Ensure non-zero percentage if prediction is very low

def get_risk_level(risk_percentage):
    """Determine risk level based on percentage"""
    if risk_percentage >= 75:
        return "Very High"
    elif risk_percentage >= 50:
        return "High"
    elif risk_percentage >= 25:
        return "Moderate"
    else:
        return "Low"

def get_recommendations(risk_level):
    """Provide general recommendations based on risk level"""
    recommendations = {
        "Very High": "🔴 Immediate intervention needed! Strengthen hygiene measures, improve drainage, and provide medical aid.",
        "High": "🟠 Increased alert! Promote sanitation, ensure clean water, and conduct awareness programs.",
        "Moderate": "🟡 Stay cautious! Monitor conditions closely, educate communities, and improve waste management.",
        "Low": "🟢 Low risk, but maintain hygiene practices and regular monitoring."
    }
    return recommendations.get(risk_level, "No specific recommendation available.")

def identify_primary_factor(model, features):
    """Identify the most influential factor using feature importances"""
    importances = model.feature_importances_
    max_importance_idx = np.argmax(importances)
    return features[max_importance_idx]

def predict_country_risk(data, model, features, historical_max, country_name, start_year, end_year):
    """Perform risk analysis for a specific country in the given year range"""
    country_data = data[data['Country Name'] == country_name]
    if country_data.empty:
        print(f"No data found for {country_name}. Skipping analysis.")
        return []
    
    predictions = []
    latest_year_data = country_data.sort_values(by='Year').iloc[-1].copy()
    
    for year in range(start_year, end_year + 1):
        # Simulate yearly changes by applying small variations to features
        for feature in features:
            latest_year_data[feature] *= np.random.uniform(0.98, 1.02)  # Simulating ±2% yearly variation
        
        latest_year_features = pd.DataFrame([latest_year_data[features].to_dict()])
        prediction = model.predict(latest_year_features)[0]
        
        if prediction == 0:
            prediction = max(historical_max * 0.01, 0.01)  # Ensure a minimal non-zero prediction
        
        risk_percentage = calculate_risk_percentage(prediction, historical_max)
        risk_level = get_risk_level(risk_percentage)
        primary_factor = identify_primary_factor(model, features)
        recommendation = get_recommendations(risk_level)

        predictions.append({
            'Year': year,
            'Country': country_name,
            'Prediction': prediction,
            'Risk Percentage': risk_percentage,
            'Risk Level': risk_level,
            'Primary Factor': primary_factor,
            'Recommendation': recommendation
        })
        
        print(f"Year: {year} | Country: {country_name} | Prediction: {prediction:.5f} | Risk Percentage: {risk_percentage:.1f}% | Risk Level: {risk_level} | Primary Factor: {primary_factor} | Recommendation: {recommendation}")
    
    return predictions

def main():
    print("Starting risk prediction...")
    file_path = 'ml_data.csv'
    print(f"Loading data from {file_path}")
    data, features, target = load_and_prepare_data(file_path)
    if data is None:
        print("Failed to load data!")
        return
    print(f"Data loaded successfully. Shape: {data.shape}")
    
    model_filename = 'trained_random_forest_model.pkl'
    model = joblib.load(model_filename)
    print(f"Model loaded successfully from '{model_filename}'.")
    
    historical_max = data[target].max()
    print(f"\nHistorical Maximum Leptospirosis Rate: {historical_max:.5f}")
    
    country_input = input("Enter the country name (or type 'All' for all countries): ")
    start_year = 2024
    end_year = int(input("Enter the end year for predictions: "))
    
    all_predictions = []
    
    if country_input.lower() == "all":
        unique_countries = data['Country Name'].unique()
        for test_country in unique_countries:
            print(f"\nPerforming risk analysis for {test_country} from {start_year} to {end_year}...")
            predictions = predict_country_risk(data, model, features, historical_max, test_country, start_year, end_year)
            all_predictions.extend(predictions)
    else:
        print(f"\nPerforming risk analysis for {country_input} from {start_year} to {end_year}...")
        predictions = predict_country_risk(data, model, features, historical_max, country_input, start_year, end_year)
        all_predictions.extend(predictions)
    
    if all_predictions:
        output_df = pd.DataFrame(all_predictions)
        output_csv_path = 'leptospirosis_predictions.csv'
        output_df.to_csv(output_csv_path, index=False)
        print(f"Predictions saved to {output_csv_path}")

if __name__ == "__main__":
    main()
