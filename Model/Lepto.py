import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

def load_and_prepare_data(file_path):
    try:
        data = pd.read_csv(file_path)
        features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']
        target = 'Leptospirosis_Rate'
        data = data.dropna()
        return data, features, target
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None, None, None

def train_model(data, features, target):
    X = data[features]
    y = data[target]
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, 'trained_random_forest_model.pkl')
    print("Model training complete and saved as 'trained_random_forest_model.pkl'")

def main():
    file_path = 'ml_data.csv'
    data, features, target = load_and_prepare_data(file_path)
    if data is None:
        return
    train_model(data, features, target)

if __name__ == "__main__":
    main()
