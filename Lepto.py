import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import folium
from folium import plugins
import geopandas as gpd
from scipy.stats import pearsonr
import calendar
from datetime import datetime
import joblib  # For saving the trained model

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

def load_and_prepare_data(file_path):
    """Load and prepare the dataset"""
    try:
        data = pd.read_csv(file_path)
        features = ['Temperature_Celsius', 'Dew_Point_Celsius', 'Relative_Humidity', 'TP']
        target = 'Leptospirosis_Rate'
        data = data.dropna()
        # Add month column if not present (assuming you have a date column)
        if 'Month' not in data.columns and 'Date' in data.columns:
            data['Month'] = pd.to_datetime(data['Date']).dt.month
        return data, features, target
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None, None, None

def train_model(data, features, target):
    """Train the Random Forest model and save it to the directory"""
    X_train, X_test, y_train, y_test = train_test_split(
        data[features], data[target], test_size=0.2, random_state=42
    )
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f'Mean Absolute Error: {mae}')
    
    # Save the trained model to the current directory
    model_filename = 'trained_random_forest_model.pkl'
    joblib.dump(model, model_filename)
    print(f"\nTrained model saved successfully as '{model_filename}' in the current directory.")
    
    return model, X_train, X_test, y_train, y_test

def calculate_risk_percentage(prediction, historical_max):
    """Calculate risk percentage based on predicted rate and historical maximum"""
    risk_percentage = (prediction / historical_max) * 100
    return min(risk_percentage, 100)

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

def identify_primary_factor(model, features, data):
    """Identify the most influential factor using feature importances"""
    importances = model.feature_importances_
    max_importance_idx = np.argmax(importances)
    return features[max_importance_idx]

def get_prevention_recommendations(risk_level, primary_factor):
    """Generate prevention recommendations based on risk level and primary factor"""
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

def get_region_for_country(country):
    """Determine the European region for a given country"""
    for region, data in REGIONAL_THRESHOLDS.items():
        if country in data['countries']:
            return region
    return 'Western_Europe'  # Default region if not found

def calculate_seasonal_risk(data, features, model):
    """Calculate seasonal variation in risk"""
    seasonal_risk = {}
    for month in range(1, 13):
        month_data = data[data['Month'] == month]
        if not month_data.empty:
            predictions = model.predict(month_data[features])
            seasonal_risk[month] = {
                'mean_risk': np.mean(predictions),
                'std_risk': np.std(predictions),
                'sample_size': len(predictions)
            }
    return seasonal_risk

def plot_seasonal_variation(seasonal_risk):
    """Plot seasonal variation in risk"""
    months = list(calendar.month_abbr)[1:]
    risk_values = [seasonal_risk[m]['mean_risk'] for m in range(1, 13)]
    plt.figure(figsize=(12, 6))
    plt.plot(months, risk_values, marker='o')
    plt.fill_between(
        months, 
        [seasonal_risk[m]['mean_risk'] - seasonal_risk[m]['std_risk'] for m in range(1, 13)],
        [seasonal_risk[m]['mean_risk'] + seasonal_risk[m]['std_risk'] for m in range(1, 13)],
        alpha=0.2
    )
    plt.title('Seasonal Variation in Leptospirosis Risk')
    plt.xlabel('Month')
    plt.ylabel('Risk Level')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

def analyze_factor_interactions(data, features):
    """Analyze and visualize interactions between environmental factors"""
    plt.figure(figsize=(12, 8))
    # Create correlation matrix
    corr_matrix = data[features].corr()
    # Create heatmap
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
    plt.title('Factor Interaction Heatmap')
    plt.tight_layout()
    plt.show()
    # Create pairplot
    sns.pairplot(data[features])
    plt.suptitle('Factor Interactions Pairplot', y=1.02)
    plt.show()
    return corr_matrix

def create_risk_map(country_data, risk_predictions):
    """Create an interactive map showing risk levels across Europe"""
    # Load European countries geometry
    europe = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
    europe = europe[europe.continent == 'Europe']
    # Create base map
    m = folium.Map(location=[54, 25], zoom_start=4)
    # Add risk levels to map
    for idx, row in country_data.iterrows():
        country_name = row['country']
        risk_level = risk_predictions.get(country_name, 'Unknown')
        # Get country geometry
        country_geo = europe[europe.name == country_name]
        if not country_geo.empty:
            # Create color based on risk level
            color = {
                'Very High': 'red',
                'High': 'orange',
                'Moderate': 'yellow',
                'Low': 'green'
            }.get(risk_level, 'gray')
            # Add country polygon to map
            folium.GeoJson(
                country_geo.__geo_interface__,
                style_function=lambda x, color=color: {
                    'fillColor': color,
                    'color': 'black',
                    'weight': 1,
                    'fillOpacity': 0.7
                },
                tooltip=f"{country_name}: {risk_level} Risk"
            ).add_to(m)
    # Add legend
    legend_html = '''
Risk Levels
■ Very High
■ High
■ Moderate
■ Low
    '''
    m.get_root().html.add_child(folium.Element(legend_html))
    return m

def get_country_specific_recommendations(country, risk_level, primary_factor):
    """Get country-specific recommendations based on characteristics"""
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

def enhanced_analyze_country_risk(country_data, model, features, historical_max, country_name):
    """Enhanced analysis including regional thresholds and country-specific factors"""
    # Get region for the country
    region = get_region_for_country(country_name)
    regional_thresholds = REGIONAL_THRESHOLDS[region]
    # Basic risk analysis
    prediction = model.predict([country_data[features].iloc[0]])[0]
    risk_percentage = calculate_risk_percentage(prediction, historical_max)
    # Apply regional thresholds
    if risk_percentage >= regional_thresholds['risk_thresholds']['high']:
        risk_level = "Very High"
    elif risk_percentage >= regional_thresholds['risk_thresholds']['moderate']:
        risk_level = "High"
    elif risk_percentage >= regional_thresholds['risk_thresholds']['low']:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
    # Identify primary factor using feature importances
    primary_factor = identify_primary_factor(model, features, country_data)
    # Get recommendations
    general_recommendations = get_prevention_recommendations(risk_level, primary_factor)
    country_specific_recommendations = get_country_specific_recommendations(
        country_name, risk_level, primary_factor
    )
    return {
        'prediction': prediction,
        'risk_percentage': risk_percentage,
        'risk_level': risk_level,
        'primary_factor': primary_factor,
        'general_recommendations': general_recommendations,
        'country_specific_recommendations': country_specific_recommendations,
        'regional_thresholds': regional_thresholds
    }

def print_enhanced_analysis(country_name, analysis_results):
    """Print enhanced analysis results"""
    print(f"\n====== Leptospirosis Risk Analysis for {country_name} ======")
    print(f"\nRegional Context: {get_region_for_country(country_name)}")
    print(f"Predicted Rate: {analysis_results['prediction']:.2f}")
    print(f"Risk Percentage: {analysis_results['risk_percentage']:.1f}%")
    print(f"Risk Level: {analysis_results['risk_level']}")
    print(f"Primary Contributing Factor: {analysis_results['primary_factor']}")
    print("\nGeneral Prevention Recommendations:")
    for i, rec in enumerate(analysis_results['general_recommendations'], 1):
        print(f"{i}. {rec}")
    print("\nCountry-Specific Recommendations:")
    for i, rec in enumerate(analysis_results['country_specific_recommendations'], 1):
        print(f"{i}. {rec}")
    print("\nRegional Threshold Information:")
    thresholds = analysis_results['regional_thresholds']
    print(f"Temperature Threshold: {thresholds['temp_threshold']}°C")
    print(f"Humidity Threshold: {thresholds['humidity_threshold']}%")

def main():
    print("Starting analysis...")
    file_path = 'E:\\LeptoVS\\ml_final_data.csv'
    print(f"Loading data from {file_path}")
    data, features, target = load_and_prepare_data(file_path)
    if data is None:
        print("Failed to load data!")
        return
    print(f"Data loaded successfully. Shape: {data.shape}")
    # Train model
    print("\nTraining Random Forest model...")
    model, X_train, X_test, y_train, y_test = train_model(data, features, target)

if __name__ == "__main__":
    main()