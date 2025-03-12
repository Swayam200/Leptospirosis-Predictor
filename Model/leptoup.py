import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

def load_and_prepare_data(file_path):
    """ Load data and prepare features & targets for training. """
    try:
        data = pd.read_csv(file_path)
        
        # Drop rows with missing values
        data = data.dropna()

        # Encode categorical 'Country Name' into numerical values
        label_encoder = LabelEncoder()
        data['Country_Code'] = label_encoder.fit_transform(data['Country Name'])

        # Save the encoder for future use in prediction
        joblib.dump(label_encoder, 'country_encoder.pkl')

        # Features for weather prediction
        weather_features = ['Year', 'Country_Code']
        weather_targets = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']

        # Features for leptospirosis risk prediction
        risk_features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']
        risk_target = 'Leptospirosis_Rate'

        return data, weather_features, weather_targets, risk_features, risk_target
    except FileNotFoundError:
        print(f"❌ Error: File '{file_path}' not found.")
        return None, None, None, None, None

def train_weather_model(data, features, targets):
    """ Train a model to predict future weather conditions. """
    X = data[features]
    y = data[targets]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, 'trained_weather_model.pkl')
    print("✅ Weather model trained and saved as 'trained_weather_model.pkl'")

def train_risk_model(data, features, target):
    """ Train a model to predict leptospirosis risk. """
    X = data[features]
    y = data[target]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, 'trained_leptospirosis_model.pkl')
    print("✅ Leptospirosis risk model trained and saved as 'trained_leptospirosis_model.pkl'")

def main():
    file_path = 'ml_data.csv'
    data, weather_features, weather_targets, risk_features, risk_target = load_and_prepare_data(file_path)

    if data is None:
        return

    train_weather_model(data, weather_features, weather_targets)
    train_risk_model(data, risk_features, risk_target)

if __name__ == "__main__":
    main()
