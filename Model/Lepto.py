import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def load_data(file_path):
    try:
        data = pd.read_csv(file_path)
        return data.dropna()
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None

def train_and_save_model(data, features, target):
    X = data[features]
    y = data[target]
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, 'trained_model.pkl')
    return model, X, y

def evaluate_model(model, X, y):
    y_pred = model.predict(X)
    print(f"MAE: {mean_absolute_error(y, y_pred)}")
    print(f"MSE: {mean_squared_error(y, y_pred)}")
    print(f"R2: {r2_score(y, y_pred)}")

def main():
    data = load_data('ml_data.csv')
    if data is not None:
        features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']
        target = 'Leptospirosis_Rate'
        model, X, y = train_and_save_model(data, features, target)
        evaluate_model(model, X, y)

if __name__ == "__main__":
    main()
