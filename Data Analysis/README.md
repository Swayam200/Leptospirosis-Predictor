# 📊Data Ananlysis


## 📂 Data Download
Download the required weather and health datasets from the link below:
🔗 Google Drive Link: https://drive.google.com/drive/folders/1AmonYTe1MVpj2XDSQtllZmEP-uvv8rVj?usp=sharing 


## 📌 Data Source
### 🌍 European Centre for Disease Prevention and Control (ECDC)
We obtained health-related data from the European Centre for Disease Prevention and Control (ECDC), an EU agency responsible for monitoring and preventing the spread of infectious diseases. The ECDC provides comprehensive epidemiological reports and datasets that contribute to effective public health strategies.

### ☁️ ERA5 Monthly (ECMWF Reanalysis v5)
The weather data is sourced from ERA5 Monthly, a climate reanalysis dataset produced by the European Centre for Medium-Range Weather Forecasts (ECMWF). ERA5 provides high-resolution historical weather data, including temperature, precipitation, wind speed, and humidity, with a global coverage. It is widely used for climate research, environmental studies, and weather impact analysis.


## 🛠️ How to Extract and Prepare Data
Download the weather data from the Google Drive link provided above.
Extract the ZIP file and place it in the project directory. Ensure that file names remain unchanged.
Run Preprocessing Scripts:
Execute combining_w_weather_data.ipynb to merge weather data with health records.
Download health_data_cleaned.csv and run making_ml_data.ipynb to generate the final dataset.
Final Output:
The processed dataset, ml_data.csv, will be generated.
If you want to skip the preprocessing, a pre-generated ml_data.csv file is provided for direct use.


## ✅ Data Validation
To ensure data consistency, compare the contents of your generated ml_data.csv with the one provided. This will confirm that the preprocessing steps were executed correctly.
