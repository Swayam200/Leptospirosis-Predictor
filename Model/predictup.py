import pandas as pd
import joblib

# Load trained models
weather_model = joblib.load('trained_weather_model.pkl')
risk_model = joblib.load('trained_leptospirosis_model.pkl')
label_encoder = joblib.load('country_encoder.pkl')

# Load dataset to get the list of countries
data = pd.read_csv('ml_data.csv')
all_countries = sorted(data['Country Name'].unique())

def predict_weather(year, country):
    """ Predict future weather conditions for a given year and country. """
    try:
        country_code = label_encoder.transform([country])[0]  # Convert country name to encoded value
    except ValueError:
        print(f"❌ Error: Country '{country}' not found in training data.")
        return None

    input_data = pd.DataFrame({'Year': [year], 'Country_Code': [country_code]})
    weather_prediction = weather_model.predict(input_data)

    return {
        'Temperature_Celsius': weather_prediction[0][0],
        'Dew_Point_Celsius': weather_prediction[0][1],
        'Relative_Humidity': weather_prediction[0][2],
        'TP': weather_prediction[0][3]
    }

def predict_risk(weather_data):
    """ Predict Leptospirosis risk using the predicted weather conditions. """
    input_data = pd.DataFrame([weather_data])
    risk_prediction = risk_model.predict(input_data)[0]
    risk_percentage = (risk_prediction / 10) * 100  # Scaling based on observed max value
    return risk_prediction, risk_percentage

def predict_for_year_range(start_year, end_year, country):
    """ Predict for all years from start_year to end_year for a specific country or all countries. """
    predictions_list = []

    for year in range(start_year, end_year + 1):
        if country.lower() == "all":
            for country_name in all_countries:
                predicted_weather = predict_weather(year, country_name)
                if predicted_weather is None:
                    continue
                
                predicted_risk, risk_percentage = predict_risk(predicted_weather)

                prediction = {
                    "Year": year,
                    "Country Name": country_name,
                    "Predicted_Leptospirosis_Rate": round(predicted_risk, 3),
                    "Risk_Percentage": f"{round(risk_percentage, 2)}%"
                }
                predictions_list.append(prediction)
        else:
            predicted_weather = predict_weather(year, country)
            if predicted_weather is None:
                continue

            predicted_risk, risk_percentage = predict_risk(predicted_weather)

            prediction = {
                "Year": year,
                "Country Name": country,
                "Predicted_Leptospirosis_Rate": round(predicted_risk, 3),
                "Risk_Percentage": f"{round(risk_percentage, 2)}%"
            }
            predictions_list.append(prediction)

    return predictions_list

def main():
    end_year = int(input("📅 Enter the year for prediction (e.g., 2027): "))
    country = input("🌍 Enter the country name (or type 'all' for all countries): ").strip()

    if end_year < 2024:
        print("❌ Error: Please enter a year **after** 2023.")
        return

    predictions = predict_for_year_range(2024, end_year, country)

    # Save predictions to CSV (appending data)
    predictions_df = pd.DataFrame(predictions)
    predictions_df.to_csv("predictions.csv", mode='a', index=False, header=False)

    # Display results in the terminal
    print("\n🌡️ Predicted Leptospirosis Risk Levels:")
    print(predictions_df.to_string(index=False))

    print("\n✅ Predictions saved successfully in 'predictions.csv'.")

if __name__ == "__main__":
    main()
